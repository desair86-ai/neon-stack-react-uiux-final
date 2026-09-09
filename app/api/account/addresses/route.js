import { NextResponse } from 'next/server';
import { getCurrentCustomer, getWooCommerceCustomer, updateWooCommerceCustomer } from '../../../../src/lib/account';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, action } = body;

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const customer = await getCurrentCustomer(token);
    if (!customer) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    if (action === 'getAddresses') {
      const wcCustomer = await getWooCommerceCustomer(customer.databaseId);
      return NextResponse.json({
        success: true,
        addresses: {
          billing: wcCustomer.billing || {},
          shipping: wcCustomer.shipping || {},
        },
      });
    }

    if (action === 'updateAddresses') {
      const { billing, shipping } = body;
      const updateData = {};

      if (billing && typeof billing === 'object') {
        updateData.billing = {
          first_name: billing.first_name || '',
          last_name: billing.last_name || '',
          company: billing.company || '',
          address_1: billing.address_1 || '',
          address_2: billing.address_2 || '',
          city: billing.city || '',
          state: billing.state || '',
          postcode: billing.postcode || '',
          country: billing.country || 'IN',
          email: billing.email || '',
          phone: billing.phone || '',
        };
      }

      if (shipping && typeof shipping === 'object') {
        updateData.shipping = {
          first_name: shipping.first_name || '',
          last_name: shipping.last_name || '',
          company: shipping.company || '',
          address_1: shipping.address_1 || '',
          address_2: shipping.address_2 || '',
          city: shipping.city || '',
          state: shipping.state || '',
          postcode: shipping.postcode || '',
          country: shipping.country || 'IN',
        };
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No addresses to update' }, { status: 400 });
      }

      const updated = await updateWooCommerceCustomer(customer.databaseId, updateData);
      return NextResponse.json({
        success: true,
        addresses: {
          billing: updated.billing || {},
          shipping: updated.shipping || {},
        },
      });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Account addresses error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
