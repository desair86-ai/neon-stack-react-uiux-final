import { NextResponse } from 'next/server';
import { getCustomerOrders } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const orders = await getCustomerOrders(token);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error.message);
    return NextResponse.json({ message: error.message || 'Failed to fetch orders' }, { status: 400 });
  }
}
