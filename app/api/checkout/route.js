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

export async function POST(req) {
  try {
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
      billing: payload.billing,
      shipping: payload.shipping || payload.billing,
      customer_note: payload.customer_note,
      line_items: lineItems
    };

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

