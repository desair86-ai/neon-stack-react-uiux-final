import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !String(email).trim()) {
      return NextResponse.json({ message: 'Enter the email address for your account.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
    if (!siteUrl) return NextResponse.json({ message: 'Password reset is not configured.' }, { status: 500 });

    const wpRoot = siteUrl.replace(/\/wp-json\/?$/, '').replace(/\/$/, '');
    const response = await fetch(`${wpRoot}/wp-login.php?action=lostpassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' },
      body: new URLSearchParams({
        user_login: String(email).trim(),
        'wp-submit': 'Get New Password',
        redirect_to: '',
      }).toString(),
      cache: 'no-store',
    });
    const html = await response.text();
    if (!response.ok || /database error|error establishing|there is no account|invalid|not found|unknown/i.test(html)) {
      return NextResponse.json({ message: 'WordPress could not process that password reset request.' }, { status: 502 });
    }
    return NextResponse.json({ message: 'If an account exists for that email, WordPress has sent a reset link.' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Unable to request a password reset.' }, { status: 500 });
  }
}
