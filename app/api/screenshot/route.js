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

  const baseUrl = rawBaseUrl
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/wp-json$/, '');

  const targetUrl = `${baseUrl}/wp-json/neon-stack/v2/screenshot`;

  try {
    const formData = await request.formData();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;

    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
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

    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'WordPress screenshot upload timed out after 15 seconds'
        : error?.message || 'Screenshot upload failed';

    console.error('Neon screenshot proxy error:', {
      targetUrl,
      error: message,
    });

    return NextResponse.json(
      {
        error: message,
        targetUrl,
      },
      { status: 500 }
    );
  }
}