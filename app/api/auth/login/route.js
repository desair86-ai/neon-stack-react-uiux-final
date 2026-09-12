import { NextResponse } from 'next/server';
import { loginUser } from '../../../../src/lib/auth';
import { rateLimit } from '../../../../src/lib/rateLimit';

const checkLoginLimit = rateLimit({ windowMs: 5 * 60 * 1000, max: 10, name: 'auth_login' });

export async function POST(req) {
  try {
    const limiter = checkLoginLimit(req);
    if (!limiter.success) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const data = await loginUser(username, password);
    
    // In a real production app with next-auth or cookie sessions, we'd set an HTTP-only cookie.
    // For this headless setup without a complex auth framework, returning the token to the client is standard.
    return NextResponse.json({ success: true, token: data.authToken, user: data.user });
  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: 401 });
  }
}
