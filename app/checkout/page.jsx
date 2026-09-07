"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";
import { Info } from "lucide-react";

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
    localStorage.removeItem('ns_cart');
    setCart([]);
    window.dispatchEvent(new Event('cartUpdated'));
    setOrderPlaced(true);
  };

  if (!isClient) return null;

  if (orderPlaced) {
    return (
      <div style={{ background: '#f8f6f0', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif' }}>
        <Header />
        <main style={{ maxWidth: '800px', margin: '60px auto', padding: '40px 20px', background: '#fff', textAlign: 'center', border: '1px solid #e5e5e5' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#000' }}>Order Received</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>Thank you. Your order has been received.</p>
          <Link href="/collections" style={{ padding: '10px 25px', background: '#fff', border: '1px solid #000', color: '#000', textDecoration: 'none', borderRadius: '30px', fontWeight: '500' }}>Return to Shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ background: '#f8f6f0', minHeight: '100vh', color: '#333', fontFamily: 'sans-serif' }}>
        <Header />
        <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px 20px', background: '#ffffff', minHeight: '60vh', border: '1px solid #e5e5e5' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', color: '#000' }}>Checkout</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is currently empty.</p>
          <Link href="/collections" style={{ display: 'inline-block', padding: '10px 20px', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Return to shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}>
      <Header />
      
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px', background: '#ffffff', color: '#333' }}>
        <div style={{ border: '1px solid #cce5ff', background: '#f8fbff', padding: '15px 20px', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <Info size={20} />
          <span>Have a coupon? Click here to enter your code</span>
        </div>

        <form id="checkout-form" onSubmit={handlePlaceOrder}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            
            <div style={{ flex: '1 1 500px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Billing details</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>First name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Last name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Country / Region <span style={{ color: 'red' }}>*</span></label>
                <select style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
                  <option>India</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Street address <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required placeholder="House number and street name" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', marginBottom: '10px' }} />
                <input type="text" placeholder="Apartment, suite, unit, etc. (optional)" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Town / City <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>State <span style={{ color: 'red' }}>*</span></label>
                <select style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>PIN Code <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Phone (optional)</label>
                <input type="tel" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Email address <span style={{ color: 'red' }}>*</span></label>
                <input type="email" required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none' }} />
              </div>
            </div>

            <div style={{ flex: '1 1 500px' }}>
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Additional information</h2>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333', fontWeight: '500' }}>Order notes (optional)</label>
                <textarea placeholder="Notes about your order, e.g. special notes for delivery." style={{ width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', minHeight: '100px', resize: 'vertical' }}></textarea>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Your order</h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Product</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {item.name} <strong style={{ color: '#000' }}>× {item.qty || 1}</strong>
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        ₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0) * (item.qty || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>Subtotal</th>
                    <td style={{ padding: '15px', color: '#333', fontWeight: 'bold' }}>₹{total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>Total</th>
                    <td style={{ padding: '15px', color: '#000', fontWeight: 'bold', fontSize: '18px' }}>₹{total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ background: '#f0f2f5', padding: '30px', border: '1px solid #e5e5e5' }}>
                <div style={{ background: '#f8fbff', border: '1px solid #cce5ff', padding: '15px', color: '#0056b3', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', lineHeight: '1.5' }}>Sorry, it seems that there are no available payment methods. Please contact us if you require assistance or wish to make alternate arrangements.</span>
                </div>
                
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ padding: '15px 30px', background: '#fff', border: '1px solid #000', color: '#000', fontWeight: '500', fontSize: '16px', cursor: 'pointer', borderRadius: '30px', transition: 'all 0.2s' }}>
                    Place order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  ); 
}
