import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  if (!baseUrl) return NextResponse.json({ error: 'Missing WP REST URL' }, { status: 500 });

  const targetUrl = `${baseUrl.replace(/\/+$/, '')}/neon-stack/v2/health`;
  try {
    const response = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json({ error: `WP API responded with ${response.status}` }, { status: response.status });
    }
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
