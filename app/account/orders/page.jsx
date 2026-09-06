"use client";
import React from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <div style={{ padding: '60px', textAlign: 'center', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ marginBottom: '10px' }}>No orders yet</h3>
      <p style={{ color: '#888', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
      <Link href="/collections" className="btn primary">Start Shopping</Link>
    </div>
  );
}
