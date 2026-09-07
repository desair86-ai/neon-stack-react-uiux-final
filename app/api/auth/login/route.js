import { NextResponse } from 'next/server';
import { loginUser } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
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
