"use client";
import React from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('ns_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#fff' }}>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ marginBottom: '10px' }}>No orders yet</h3>
        <p style={{ color: '#888', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
        <Link href="/collections" className="btn primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ marginBottom: '20px' }}>Your Orders</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#11151f', borderBottom: '1px solid #2a3040' }}>
            <th style={{ padding: '15px', textAlign: 'left' }}>Order</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.databaseId} style={{ borderBottom: '1px solid #1c212e' }}>
              <td style={{ padding: '15px' }}>#{order.databaseId}</td>
              <td style={{ padding: '15px' }}>{new Date(order.date).toLocaleDateString()}</td>
              <td style={{ padding: '15px', textTransform: 'capitalize' }}>{order.status}</td>
              <td style={{ padding: '15px' }}>{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
