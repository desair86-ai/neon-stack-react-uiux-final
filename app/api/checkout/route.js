import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const payload = await req.json();
    
    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;

    if (!consumerKey || !consumerSecret || !siteUrl) {
      return NextResponse.json({ message: 'WooCommerce API keys are missing on the server.' }, { status: 500 });
    }

    const wcUrl = \\/wc/v3/orders\;
    const auth = Buffer.from(\\:\\).toString('base64');

    const response = await fetch(wcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \Basic \\
      },
      body: JSON.stringify(payload)
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

