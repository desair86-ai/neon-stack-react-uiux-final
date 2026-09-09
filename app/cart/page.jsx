"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";

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
    <>
      <Header />
      
      <main className="container" style={{ minHeight: '60vh', padding: '32px 20px 60px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 32px', fontFamily: "'Space Grotesk', sans-serif" }}>Cart</h1>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is currently empty.</p>
            <Link href="/collections" className="btn primary">Return to Shop</Link>
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="cart-desktop" style={{ overflowX: 'auto', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '20px', display: 'block' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1c212e' }}>
                    <th colSpan="3" style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#fff' }}>Product</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#fff' }}>Price</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#fff' }}>Quantity</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#fff' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1c212e' }}>
                      <td style={{ padding: '15px', width: '40px', textAlign: 'center' }}>
                        <button onClick={() => remove(item.id)} style={{ color: '#ff65bf', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
                      </td>
                      <td style={{ padding: '15px', width: '90px' }}>
                         {item.image ? (
                           <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '8px' }} />
                         ) : (
                           <div style={{ width: '70px', height: '70px', background: '#111', borderRadius: '8px' }}></div>
                         )}
                      </td>
                      <td style={{ padding: '15px', color: '#f6f6fa', fontWeight: '500' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '15px', color: '#b8bfd8' }}>₹{(parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0).toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>
                        <input 
                          type="number" 
                          min="1"
                          value={item.qty || 1} 
                          onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)} 
                          style={{ width: '60px', padding: '8px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', textAlign: 'center' }} 
                        />
                      </td>
                      <td style={{ padding: '15px', color: '#00ffbc', fontWeight: '600' }}>₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0) * (item.qty || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="6" style={{ padding: '20px 15px 5px' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Coupon code" style={{ padding: '10px 15px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                            <button className="btn ghost" style={{ borderRadius: '6px' }}>Apply coupon</button>
                          </div>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="cart-mobile" style={{ display: 'none', flexDirection: 'column', gap: '15px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', background: '#111', borderRadius: '8px', flexShrink: 0 }}></div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px', color: '#fff', fontSize: '16px' }}>{item.name}</h3>
                      <small style={{ color: '#8992a5' }}>{item.type}</small>
                      <div style={{ marginTop: '8px', color: '#00ffbc', fontWeight: '600' }}>₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0) * (item.qty || 1)).toFixed(2)}</div>
                    </div>
                    <button onClick={() => remove(item.id)} style={{ color: '#ff65bf', border: 'none', background: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}><Trash2 size={18}/></button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #1c212e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#b8bfd8', fontSize: '14px' }}>Qty:</span>
                      <button onClick={() => updateQty(item.id, (item.qty || 1) - 1)} style={{ width: '32px', height: '32px', border: '1px solid #2a3040', background: '#11151f', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14}/></button>
                      <span style={{ color: '#fff', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.qty || 1}</span>
                      <button onClick={() => updateQty(item.id, (item.qty || 1) + 1)} style={{ width: '32px', height: '32px', border: '1px solid #2a3040', background: '#11151f', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14}/></button>
                    </div>
                    <div style={{ color: '#b8bfd8', fontSize: '14px' }}>₹{(parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0).toFixed(2)} each</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Coupon code" style={{ flex: 1, padding: '12px 15px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                <button className="btn ghost" style={{ borderRadius: '6px', whiteSpace: 'nowrap' }}>Apply coupon</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <div className="cart-totals" style={{ width: '100%', maxWidth: '400px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>Cart totals</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1c212e' }}>
                      <th style={{ padding: '15px 0', textAlign: 'left', width: '40%', color: '#b8bfd8', fontWeight: 'normal' }}>Subtotal</th>
                      <td style={{ padding: '15px 0', textAlign: 'right', color: '#fff' }}>₹{total.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '15px 0', textAlign: 'left', color: '#fff', fontWeight: '600' }}>Total</th>
                      <td style={{ padding: '15px 0', textAlign: 'right', fontWeight: 'bold', color: '#00ffbc', fontSize: '1.2rem' }}>₹{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <Link href="/checkout" style={{ display: 'block' }}>
                  <button className="btn primary" style={{ width: '100%', padding: '15px', borderRadius: '50px', fontSize: '15px' }}>PROCEED TO CHECKOUT</button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  ); 
}
