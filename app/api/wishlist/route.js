import { NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL || 'https://darkblue-raven-747036.hostingersite.com/wp-json';
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

const getAuthHeaders = () => {
  if (CK && CS) {
    return {
      'Authorization': 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64'),
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shareKey = searchParams.get('share_key');
  
  if (!shareKey) return NextResponse.json({ items: [] });

  try {
    if (!CK || !CS) return NextResponse.json({ items: [] });
    
    const res = await fetch(`${WP_URL}/wc/v3/wishlist/${shareKey}/get_products`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const shareKey = body.share_key;
    const action = body.action; 
    
    if (!CK || !CS) {
      // Simulate success for frontend while keys are missing
      return NextResponse.json({ success: true, dummy: true });
    }

    if (action === 'add') {
      const res = await fetch(`${WP_URL}/wc/v3/wishlist/${shareKey}/add_product`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: body.product_id })
      });
      const data = await res.json();
      return NextResponse.json(data);
    } 
    else if (action === 'remove') {
      const res = await fetch(`${WP_URL}/wc/v3/wishlist/remove_product/${body.item_id}`, {
        method: 'GET', 
        headers: getAuthHeaders()
      });
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
