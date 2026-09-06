"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = JSON.parse(localStorage.getItem('ns_cart') || '[]');
      setCart(saved);
    } catch(e) {}
  }, []);

  const total = cart.reduce((acc, item) => {
    const p = parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0;
    return acc + (p * (item.qty || 1));
  }, 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // Simulate order placement
    localStorage.removeItem('ns_cart');
    setCart([]);
    window.dispatchEvent(new Event('cartUpdated'));
    setOrderPlaced(true);
  };

  if (!isClient) return null;

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="container" style={{ minHeight: '60vh', padding: '100px 20px', textAlign: 'center' }}>
          <CheckCircle color="#00ffbc" size={80} style={{ margin: '0 auto 20px auto' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>Order Received</h1>
          <p style={{ color: '#8992a5', fontSize: '1.1rem', marginBottom: '40px' }}>Thank you for your order! We'll start crafting your neon sign right away.</p>
          <Link href="/account/orders" className="btn primary" style={{ padding: '12px 30px' }}>View Orders</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ minHeight: '60vh', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Checkout</h1>
          <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is empty.</p>
          <Link href="/collections" className="btn primary">Return to Shop</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '60vh', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Checkout</h1>
        <div style={{ display: 'grid', gap: '40px', gridTemplateColumns: '1fr 400px' }} className="checkout-grid">
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Billing Details</h2>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>First Name *</label>
                  <input type="text" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>Last Name *</label>
                  <input type="text" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>Email Address *</label>
                <input type="email" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>Phone *</label>
                <input type="tel" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
              </div>
            </div>

            <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Shipping Address</h2>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>Street Address *</label>
                <input type="text" required placeholder="House number and street name" style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr', marginTop: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>City *</label>
                  <input type="text" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>State / Province *</label>
                  <input type="text" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8bfd8' }}>PIN Code *</label>
                <input type="text" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px', color: '#fff' }} />
              </div>
            </div>
            
            <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Payment Method</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#11151f', padding: '15px', borderRadius: '8px', border: '1px solid #752eff' }}>
                <input type="radio" id="cod" name="payment" defaultChecked style={{ accentColor: '#752eff' }} />
                <label htmlFor="cod" style={{ color: '#fff', fontWeight: 600 }}>Cash on Delivery / Pay Later</label>
              </div>
            </div>
          </form>

          <div>
            <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px', position: 'sticky', top: '100px' }}>
               <h3 style={{ margin: '0 0 20px 0' }}>Your Order</h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                 {cart.map(item => (
                   <div key={item.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #1c212e', paddingBottom: '15px' }}>
                      {item.image ? (
                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: `url("${item.image}") center/contain no-repeat`, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: '#111', flexShrink: 0 }} />
                      )}
                      <div>
                        <b style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{item.name}</b>
                        <div style={{ color: '#8992a5', fontSize: '0.8rem' }}>Qty: {item.qty || 1}</div>
                        <div style={{ color: '#00ffbc', fontSize: '0.9rem', marginTop: '4px' }}>₹{item.price}</div>
                      </div>
                   </div>
                 ))}
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                 <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                 <span>₹{total.toLocaleString()}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                 <span style={{ color: 'var(--muted)' }}>Shipping</span>
                 <span style={{ color: '#00ffbc' }}>Free</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1c212e' }}>
                 <b>Total</b>
                 <b style={{ fontSize: '1.5rem', color: '#00ffbc' }}>₹{total.toLocaleString()}</b>
               </div>
               
               <button type="submit" form="checkout-form" className="btn solid" style={{ width: '100%', marginTop: '30px', background: 'linear-gradient(90deg, #ff65bf, #752eff)', border: 'none', color: '#fff', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                 PLACE ORDER
               </button>
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .checkout-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </main>
      <Footer />
    </>
  ); 
}
