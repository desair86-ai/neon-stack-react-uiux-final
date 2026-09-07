"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";

export default function CartPage() { 
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = JSON.parse(localStorage.getItem('ns_cart') || '[]');
      setCart(saved);
    } catch(e) {}
  }, []);

  const remove = (id) => {
    const updated = cart.filter(x => x.id !== id);
    setCart(updated);
    localStorage.setItem('ns_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    const updated = cart.map(x => {
      if (x.id === id) {
        return { ...x, qty: newQty };
      }
      return x;
    });
    setCart(updated);
    localStorage.setItem('ns_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((acc, item) => {
    const p = parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0;
    return acc + (p * (item.qty || 1));
  }, 0);

  if (!isClient) return null;

  return (
    <div style={{ background: '#f8f6f0', minHeight: '100vh', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif' }}>
      <Header />
      
      <div style={{ background: '#f8f6f0', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', fontSize: '14px', color: '#666' }}>
          Home &gt; Shop &gt; Promotions &gt; Reviews
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', background: '#ffffff', minHeight: '60vh', color: '#333' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', color: '#000' }}>Cart</h1>
        
        {cart.length === 0 ? (
          <div style={{ padding: '60px 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is currently empty.</p>
            <Link href="/collections" style={{ display: 'inline-block', padding: '10px 20px', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>Return to shop</Link>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <th colSpan="3" style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Product</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Price</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Quantity</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '15px', width: '40px', textAlign: 'center' }}>
                        <button onClick={() => remove(item.id)} style={{ color: '#a00', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
                      </td>
                      <td style={{ padding: '15px', width: '90px' }}>
                         {item.image ? (
                           <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                         ) : (
                           <div style={{ width: '70px', height: '70px', background: '#eee' }}></div>
                         )}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>₹{(parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0).toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>
                        <input 
                          type="number" 
                          min="1"
                          value={item.qty || 1} 
                          onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} 
                          style={{ width: '60px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }} 
                        />
                      </td>
                      <td style={{ padding: '15px', color: '#333' }}>₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0) * (item.qty || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="6" style={{ padding: '20px 15px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                         <div style={{ display: 'flex', gap: '10px' }}>
                           <input type="text" placeholder="Coupon code" style={{ padding: '10px 15px', border: '1px solid #e5e5e5', outline: 'none' }} />
                           <button style={{ padding: '10px 25px', border: '1px solid #000', background: '#fff', color: '#000', cursor: 'pointer', borderRadius: '30px', fontWeight: '500' }}>Apply coupon</button>
                         </div>
                         <button style={{ padding: '10px 25px', border: '1px solid #ccc', background: '#fff', color: '#888', cursor: 'not-allowed', borderRadius: '30px', fontWeight: '500' }}>Update cart</button>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>Cart totals</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e5e5' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <th style={{ padding: '15px', textAlign: 'left', width: '40%', color: '#000' }}>Subtotal</th>
                      <td style={{ padding: '15px', textAlign: 'left', color: '#333' }}>₹{total.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#000' }}>Total</th>
                      <td style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>₹{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <Link href="/checkout" style={{ display: 'block' }}>
                  <button style={{ width: '100%', padding: '15px', background: '#fff', border: '1px solid #000', color: '#000', marginTop: '30px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', borderRadius: '30px', transition: 'all 0.2s' }}>Proceed to checkout</button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  ); 
}
