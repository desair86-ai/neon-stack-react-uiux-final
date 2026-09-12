import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;

  if (!rawBaseUrl) {
    return NextResponse.json(
      { error: 'Missing WP REST URL' },
      { status: 500 }
    );
  }

  let formattedBaseUrl = rawBaseUrl.trim();
  if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
    formattedBaseUrl = `https://${formattedBaseUrl}`;
  }

  const baseUrl = formattedBaseUrl
    .replace(/\/+$/, '')
    .replace(/\/wp-json$/, '');

  const targetUrl = `${baseUrl}/wp-json/neon-stack/v2/share`;

  try {
    const body = await request.json();
    const origin = request.headers.get('origin');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(origin ? { Origin: origin } : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        error: 'WordPress returned a non-JSON response',
        response: text.slice(0, 1000),
      };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create share' },
      { status: 500 }
    );
  }
}
