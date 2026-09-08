import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const payload = await req.json();
    const { key, login, password } = payload;

    if (!key || !login || !password) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
    if (!siteUrl) {
      return NextResponse.json({ message: 'Configuration error.' }, { status: 500 });
    }

    // Call custom WordPress endpoint to reset password using the reset key.
    // WooCommerce core does not have a REST API endpoint for resetting password with a key.
    // Normally, headless WP handles this via a custom plugin or the wp-graphql plugin.
    // Wait, the prompt says "Modify the WooCommerce/WordPress email template hooks (via a WP plugin/snippet if necessary, or check if we have access to WP)."
    // We will build a simple Next.js API that calls a custom WP REST endpoint that we will assume we can create, OR we can use application passwords if the user has one? No, we don't know the password yet.
    // The prompt says: "The user explicitly rejected the inclusion of a password field during registration. The flow must mimic default WordPress behavior... Customers must never be redirected to the WordPress backend. The password reset link sent via email must point to a new React frontend route (e.g., /reset-password), which will handle token validation and password updates via a secure backend proxy."

    // For now, let's assume we can call a custom endpoint on WordPress: `/wp-json/headless/v1/reset-password`
    // We'll write the proxy assuming this endpoint exists, and in the next step, I'll write the PHP snippet for the user to add to their WP site to support this.

    const wpUrl = `${siteUrl.replace(/\/$/, '')}/headless/v1/reset-password`;

    const response = await fetch(wpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, login, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Password reset failed.' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Password reset successful.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
