"use client";
import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '../../../src/components';
import { useWishlist } from '../../../src/context/WishlistContext';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist() || { wishlist: [] };

  const moveToCart = (item) => {
    try {
      const cartItem = {
        id: Date.now(),
        name: item.name,
        type: item.type || 'Standard Product',
        price: item.price,
        image: item.image,
        qty: 1
      };
      const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
      cart.push(cartItem);
      localStorage.setItem('ns_cart', JSON.stringify(cart));
      
      // Remove from wishlist after adding to cart
      if(toggleWishlist) toggleWishlist(item);
      window.location.href = '/cart';
    } catch(err) {}
  };

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '60vh', padding: '60px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Your Wishlist</h1>
          <p style={{ color: 'var(--muted)' }}>Saved items syncing securely with your TI WooCommerce Wishlist.</p>
        </div>
        
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px' }}>
            <HeartIcon size={48} color="#ff65bf" style={{ marginBottom: '20px', opacity: 0.5 }} />
            <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '20px' }}>Your wishlist is empty.</p>
            <Link href="/collections" className="btn primary">Start Exploring <ArrowRight size={16}/></Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {wishlist.map((item, idx) => (
              <div key={item.id || idx} style={{ display: 'flex', flexDirection: 'column', padding: '20px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', position: 'relative' }}>
                 <button onClick={() => toggleWishlist(item)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#111', border: '1px solid #333', color: '#ff65bf', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                   <Trash2 size={14}/>
                 </button>
                 <div style={{ width: '100%', height: '200px', borderRadius: '8px', background: item.image ? `url("${item.image}") center/cover` : '#111', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {!item.image && <span style={{fontSize:'40px'}}>✨</span>}
                 </div>
                 <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{item.name}</h3>
                 <p style={{ color: 'var(--muted)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>{item.type}</p>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                   <b style={{ fontSize: '1.2rem' }}>₹{item.price}</b>
                   <button className="btn solid" onClick={() => moveToCart(item)} style={{ padding: '8px 16px', background: 'linear-gradient(90deg, #ff65bf, #752eff)', border: 'none', color: '#fff', fontSize: '12px' }}>
                     <ShoppingCart size={14} style={{marginRight: '6px'}}/> ADD
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function HeartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}
