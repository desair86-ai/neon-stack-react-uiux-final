import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !String(email).trim()) {
      return NextResponse.json({ message: 'Enter the email address for your account.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
    if (!siteUrl) return NextResponse.json({ message: 'Password reset is not configured.' }, { status: 500 });

    const response = await fetch(`${siteUrl.replace(/\/$/, '')}/headless/v1/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: String(email).trim() }),
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ message: data.message || 'We could not send the reset email.' }, { status: response.status });
    return NextResponse.json({ message: data.message || 'Check your email for a password reset link.' });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Unable to request a password reset.' }, { status: 500 });
  }
}
