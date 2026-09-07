import { NextResponse } from 'next/server';
import { registerUser } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
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
