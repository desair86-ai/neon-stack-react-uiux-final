import { NextResponse } from 'next/server';
import { registerUser } from '../../../../src/lib/auth';
import { rateLimit } from '../../../../src/lib/rateLimit';

const checkRegisterLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, name: 'auth_register' });

export async function POST(req) {
  try {
    const limiter = checkRegisterLimit(req);
    if (!limiter.success) {
      return NextResponse.json(
        { message: 'Too many account creation attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const { email, password, firstName, lastName } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const data = await registerUser(email, password, firstName, lastName);
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Registration error:', error.message);
    return NextResponse.json({ message: error.message || 'Registration failed' }, { status: 400 });
  }
}
