import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  const params = await Promise.resolve(context?.params);
  const token = params?.token;

  if (!token) {
    return NextResponse.json(
      { error: 'Missing share token' },
      { status: 400 }
    );
  }

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

  const targetUrl = `${baseUrl}/wp-json/neon-stack/v2/share/${encodeURIComponent(token)}`;

  try {
    const origin = request.headers.get('origin');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(origin ? { Origin: origin } : {}),
        },
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
      { error: error?.message || 'Failed to fetch share' },
      { status: 500 }
    );
  }
}
