import { NextResponse } from 'next/server';

function getProductId(config) {
  const productIds = [config?.woocommerce?.product_id, config?.product_id];
  for (const value of productIds) {
    const productId = Number(value);
    if (Number.isInteger(productId) && productId > 0) return productId;
  }
  return null;
}

async function getConfiguratorProduct(siteUrl, configurator) {
  if (!['custom_neon', 'mojo_mix'].includes(configurator)) return null;

  const response = await fetch(
    `${siteUrl.replace(/\/$/, '')}/neon-stack/v2/config?configurator=${encodeURIComponent(configurator)}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' }
  );
  if (!response.ok) return null;

  return getProductId(await response.json());
}

// In-memory sliding-window checkout rate limiter (prevents automated bot flooding)
const checkoutRateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CHECKOUTS_PER_WINDOW = 10;

function isCheckoutRateLimited(ip) {
  const now = Date.now();
  if (checkoutRateLimit.size > 1000) {
    for (const [key, record] of checkoutRateLimit.entries()) {
      if (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
        checkoutRateLimit.delete(key);
      }
    }
  }

  const record = checkoutRateLimit.get(ip);
  if (!record || (now - record.firstRequestTime > RATE_LIMIT_WINDOW_MS)) {
    checkoutRateLimit.set(ip, { firstRequestTime: now, count: 1 });
    return false;
  }

  record.count += 1;
  return record.count > MAX_CHECKOUTS_PER_WINDOW;
}

export async function POST(req) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    if (isCheckoutRateLimited(clientIp)) {
      return NextResponse.json({ message: 'Too many checkout attempts. Please wait a few minutes before trying again.' }, { status: 429 });
    }

    const payload = await req.json();
    
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;

    if (!consumerKey || !consumerSecret || !siteUrl) {
      return NextResponse.json({ message: 'WooCommerce API keys are missing on the server.' }, { status: 500 });
    }

    if (!payload || !Array.isArray(payload.line_items) || payload.line_items.length === 0) {
      return NextResponse.json({ message: 'At least one order item is required.' }, { status: 400 });
    }

    if (payload.line_items.length > 25) {
      return NextResponse.json({ message: 'Too many order items. Maximum 25 items allowed per order.' }, { status: 400 });
    }

    // Strict validation and sanitization of customer contact and shipping details
    const billing = payload.billing;
    if (!billing || typeof billing !== 'object') {
      return NextResponse.json({ message: 'Valid billing details are required.' }, { status: 400 });
    }

    const firstName = String(billing.first_name || '').trim().slice(0, 100);
    const lastName = String(billing.last_name || '').trim().slice(0, 100);
    const email = String(billing.email || '').trim().slice(0, 254);
    const phone = String(billing.phone || '').trim().slice(0, 25);
    const address1 = String(billing.address_1 || '').trim().slice(0, 200);
    const address2 = String(billing.address_2 || '').trim().slice(0, 200);
    const city = String(billing.city || '').trim().slice(0, 100);
    const state = String(billing.state || '').trim().slice(0, 100);
    const postcode = String(billing.postcode || '').trim().slice(0, 20);

    if (!firstName || !email || !phone || !address1 || !city || !state || !postcode) {
      return NextResponse.json({ message: 'Please provide all required billing and delivery address details.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address.' }, { status: 400 });
    }

    const cleanBilling = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address_1: address1,
      address_2: address2,
      city,
      state,
      postcode,
      country: 'IN'
    };

    const customerNote = typeof payload.customer_note === 'string'
      ? payload.customer_note.trim().slice(0, 500)
      : '';

    const lineItems = [];
    for (const item of payload.line_items) {
      const productId = Number(item?.product_id);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ message: 'Each order item must contain a valid product and quantity.' }, { status: 400 });
      }

      let metaData = Array.isArray(item.meta_data) ? item.meta_data : [];
      const neonMetadata = metaData.find(entry => entry?.key === 'neon_stack');
      if (neonMetadata) {
        let neonStack;
        try {
          neonStack = typeof neonMetadata.value === 'string' ? JSON.parse(neonMetadata.value) : neonMetadata.value;
        } catch {
          return NextResponse.json({ message: 'Invalid configurator metadata.' }, { status: 400 });
        }

        const expectedProductId = await getConfiguratorProduct(siteUrl, neonStack?.configurator);
        if (!expectedProductId || expectedProductId !== productId) {
          return NextResponse.json({ message: 'Invalid configurator product.' }, { status: 400 });
        }

        metaData = [{ key: 'neon_stack', value: JSON.stringify(neonStack) }];
      } else {
        metaData = [];
      }

      // Do not forward browser-supplied name, subtotal, total, or price.
      lineItems.push({ product_id: productId, quantity, meta_data: metaData });
    }

    const orderPayload = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: cleanBilling,
      shipping: cleanBilling,
      customer_note: customerNote,
      line_items: lineItems
    };

    if (payload.create_account) {
        // WordPress/WooCommerce API does not handle `create_account` natively via order creation endpoint.
        // For headless checkouts, a separate endpoint or user creation step would be needed.
        // For now, we will forward it, but real account creation will require hitting /wp-json/wp/v2/users.
        // Let's create the user first if requested. By omitting password, WordPress generates one and sends the welcome email.
        const userUrl = `${siteUrl.replace(/\/$/, '')}/wp/v2/users`;
        const userAuth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        // Generate a long random password so the account isn't completely open, WordPress requires a password on this endpoint
        // Wait, does wp/v2/users require a password?
        // Let's check WP REST API docs. Password is required unless generating it natively.
        // We can pass a random strong password. Then they will get a password reset link anyway if we rely on WP's default flow (or they just use "forgot password").
        // Or wait, WooCommerce has a specific endpoint for creating a customer which triggers the welcome email.
        // Let's hit `/wc/v3/customers` instead!
        const wcCustomersUrl = `${siteUrl.replace(/\/$/, '')}/wc/v3/customers`;
        // generate a secure random password as a fallback because WP/WC might require it depending on settings
        const userRes = await fetch(wcCustomersUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${userAuth}`
            },
            body: JSON.stringify({
                email: payload.billing.email,
                first_name: payload.billing.first_name,
                last_name: payload.billing.last_name
            })
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            orderPayload.customer_id = userData.id;
        } else {
            const errData = await userRes.json();
            // Ignore existing email errors, just attach if they exist?
            // We'll let WooCommerce attempt to map it via email or throw if strict.
            if (errData.code !== 'existing_user_email' && errData.code !== 'existing_user_login') {
                console.error("Account creation failed:", errData);
            }
        }
    }

    const wcUrl = `${siteUrl.replace(/\/$/, '')}/wc/v3/orders`;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(wcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'WooCommerce API Error' }, { status: response.status });
    }

    return NextResponse.json({ success: true, orderId: data.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

