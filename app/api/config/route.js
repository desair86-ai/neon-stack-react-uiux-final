import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('configurator') || 'custom_neon';
  
  let baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  if (baseUrl && !baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
  if (!baseUrl) {
      return NextResponse.json({ error: "Missing WP REST URL" }, { status: 500 });
  }
  
  baseUrl = baseUrl.replace(/\/+$/, "");
  const targetUrl = `${baseUrl}/neon-stack/v2/config?configurator=${type}`;
  
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: `WP API responded with ${res.status}` }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
