import { NextResponse } from 'next/server';
import { getCurrentCustomer, getWooCommerceCustomer, updateWooCommerceCustomer, updateCustomerPassword } from '../../../../src/lib/account';
import { loginUser } from '../../../../src/lib/auth';

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

    if (action === 'getProfile') {
      const wcCustomer = await getWooCommerceCustomer(customer.databaseId);
      return NextResponse.json({
        success: true,
        profile: {
          databaseId: customer.databaseId,
          username: customer.username,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
        },
        addresses: {
          billing: wcCustomer.billing || {},
          shipping: wcCustomer.shipping || {},
        },
      });
    }

    if (action === 'updateProfile') {
      const { firstName, lastName, email, username } = body;
      const updateData = {};
      if (firstName !== undefined && firstName !== null) updateData.first_name = String(firstName);
      if (lastName !== undefined && lastName !== null) updateData.last_name = String(lastName);
      if (email !== undefined && email !== null) updateData.email = String(email);
      if (username !== undefined && username !== null) updateData.username = String(username);

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
      }

      const updated = await updateWooCommerceCustomer(customer.databaseId, updateData);
      return NextResponse.json({
        success: true,
        customer: {
          databaseId: updated.id,
          username: updated.username,
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
        },
      });
    }

    if (action === 'changePassword') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: 'Current password and new password are required' }, { status: 400 });
      }
      if (String(newPassword).length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
      }

      const loginResult = await loginUser(customer.username, currentPassword);
      if (!loginResult || !loginResult.authToken) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
      }

      await updateCustomerPassword(customer.databaseId, String(newPassword));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Account profile error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
