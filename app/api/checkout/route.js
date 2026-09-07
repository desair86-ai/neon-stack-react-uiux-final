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



const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Cleanup old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.firstRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(req, payload) {
  const now = Date.now();

  // Parse true client IP correctly
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') || 'unknown-ip');

  // User advised not to rely *only* on IP. We'll combine IP + some payload uniqueness (like email/phone) if available
  const email = payload?.billing?.email ? payload.billing.email.toLowerCase() : 'no-email';
  const key = `${ip}-${email}`;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, firstRequest: now });
    return true;
  }

  const record = rateLimitMap.get(key);
  if (now - record.firstRequest > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(key, { count: 1, firstRequest: now });
    return true;
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  return true;
}


export async function POST(req) {
  try {
    const payload = await req.json();

    if (!checkRateLimit(req, payload)) {
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;

    if (!consumerKey || !consumerSecret || !siteUrl) {
      return NextResponse.json({ message: 'WooCommerce API keys are missing on the server.' }, { status: 500 });
    }

    if (!payload || !Array.isArray(payload.line_items) || payload.line_items.length === 0) {
      return NextResponse.json({ message: 'At least one order item is required.' }, { status: 400 });
    }


    // Limit request size to prevent DoS via massive arrays
    if (payload.line_items.length > 20) {
      return NextResponse.json({ message: 'Too many order items.' }, { status: 400 });
    }



    const wcAuth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const lineItems = await Promise.all(payload.line_items.map(async (item) => {
      const productId = Number(item?.product_id);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new Error('400:Each order item must contain a valid product and quantity.');
      }

      // Verify product exists and is purchasable via WooCommerce API
      const productCheckUrl = `${siteUrl.replace(/\/$/, '')}/wc/v3/products/${productId}`;
      const productRes = await fetch(productCheckUrl, {
        headers: { 'Authorization': `Basic ${wcAuth}`, 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (!productRes.ok) {
         throw new Error(`400:Product ${productId} is invalid or does not exist.`);
      }

      const productData = await productRes.json();
      if (productData.status !== 'publish' || productData.purchasable !== true) {
         throw new Error(`400:Product ${productId} is not currently available for purchase.`);
      }

      let metaData = Array.isArray(item.meta_data) ? item.meta_data : [];
      const neonMetadata = metaData.find(entry => entry?.key === 'neon_stack');
      if (neonMetadata) {
        let neonStack;
        try {
          neonStack = typeof neonMetadata.value === 'string' ? JSON.parse(neonMetadata.value) : neonMetadata.value;
        } catch {
          throw new Error('400:Invalid configurator metadata.');
        }

        const expectedProductId = await getConfiguratorProduct(siteUrl, neonStack?.configurator);
        if (!expectedProductId || expectedProductId !== productId) {
          throw new Error('400:Invalid configurator product.');
        }

        metaData = [{ key: 'neon_stack', value: JSON.stringify(neonStack) }];
      } else {
        metaData = [];
      }

      return { product_id: productId, quantity, meta_data: metaData };
    }));

    const orderPayload = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: payload.billing,
      shipping: payload.shipping || payload.billing,
      customer_note: payload.customer_note,
      line_items: lineItems
    };

    const wcUrl = `${siteUrl.replace(/\/$/, '')}/wc/v3/orders`;


    const response = await fetch(wcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${wcAuth}`
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
    if (error.message.startsWith('400:')) {
      return NextResponse.json({ message: error.message.substring(4) }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

