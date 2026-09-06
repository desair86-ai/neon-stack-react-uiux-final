"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function Page() { 
  const [cart, setCart] = useState([]);
  useEffect(() => {
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

  const updateQty = (id, delta) => {
    const updated = cart.map(x => {
      if (x.id === id) {
        return { ...x, qty: (x.qty || 1) + delta };
      }
      return x;
    }).filter(x => x.qty > 0);
    setCart(updated);
    localStorage.setItem('ns_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((acc, item) => {
    const p = parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0;
    return acc + (p * (item.qty || 1));
  }, 0);

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '60vh', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Your Cart</h1>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is empty.</p>
            <Link href="/collections" className="btn primary">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '40px', gridTemplateColumns: '1fr 350px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '20px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', position: 'relative' }}>
                   {item.image ? (
                     <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: `url("${item.image}") center/contain no-repeat` }} />
                   ) : (
                     <div style={{ width: '100px', height: '100px', borderRadius: '8px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{fontSize:'30px'}}>✨</span></div>
                   )}
                   <div style={{ flex: 1 }}>
                     <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{item.name}</h3>
                     <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>Type: {item.type}</p>
                     {item.size && <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>Size: {item.size}</p>}
                     {item.color && <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>Color: {item.color}</p>}
                     {item.font && <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>Font: {item.font}</p>}
                   </div>
                   <div style={{ textAlign: 'right', paddingRight: '30px' }}>
                     <b style={{ fontSize: '1.2rem' }}>₹{item.price}</b>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                       <button onClick={() => updateQty(item.id, -1)} style={{ background: '#1c212e', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>-</button>
                       <span>{item.qty || 1}</span>
                       <button onClick={() => updateQty(item.id, 1)} style={{ background: '#1c212e', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                     </div>
                   </div>
                   <button onClick={() => remove(item.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ff65bf', cursor: 'pointer' }}><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px', height: 'fit-content' }}>
               <h3 style={{ margin: '0 0 20px 0' }}>Order Summary</h3>
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
               <button className="btn solid" style={{ width: '100%', marginTop: '30px', background: 'linear-gradient(90deg, #ff65bf, #752eff)', border: 'none', color: '#fff' }}>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  ); 
}
