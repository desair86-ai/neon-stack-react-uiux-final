"use client";
import React from 'react';
import Link from 'next/link';

export function Account() {
  return (
    <div style={{ color: '#fff' }}>
      <p style={{ fontSize: '15px', marginBottom: '15px' }}>
        Hello <strong>desa.r.86</strong> (not <strong>desa.r.86</strong>? <button onClick={() => { localStorage.removeItem('is_logged_in'); window.location.href='/login'; }} style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Log out</button>)
      </p>

      <p style={{ fontSize: '15px', lineHeight: '1.6' }}>
        From your account dashboard you can view your <Link href="/account/orders" style={{ textDecoration: 'underline' }}>recent orders</Link>, manage your <Link href="/account/addresses" style={{ textDecoration: 'underline' }}>shipping and billing addresses</Link>, and <Link href="/account/profile" style={{ textDecoration: 'underline' }}>edit your password and account details</Link>.
      </p>
    </div>
  );
}
