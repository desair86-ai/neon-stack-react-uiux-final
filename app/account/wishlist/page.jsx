"use client";
import React from 'react';
import Link from 'next/link';
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
      const existing = cart.find(x => x.name === cartItem.name && x.type === cartItem.type);
      if (existing) existing.qty = (existing.qty || 1) + 1;
      else cart.push(cartItem);
      localStorage.setItem('ns_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Remove from wishlist after adding to cart
      if(toggleWishlist) toggleWishlist(item);
      window.location.href = '/cart';
    } catch(err) {}
  };

  return (
    <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px', minHeight: '400px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Your Wishlist</h1>
        <p style={{ color: 'var(--muted)' }}>Saved items syncing securely with your TI WooCommerce Wishlist.</p>
      </div>
      
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <HeartIcon size={48} color="#333" style={{ margin: '0 auto 20px auto' }} />
          <h3 style={{ marginBottom: '10px' }}>Your wishlist is empty</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>Save your favourite neon signs here to easily find them later.</p>
          <Link href="/collections" className="btn primary">Explore Ideas</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {wishlist.map((item, idx) => (
             <div key={item.id || idx} style={{ background: '#111', border: '1px solid #1c212e', borderRadius: '12px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
               <button onClick={() => toggleWishlist(item)} style={{ position: 'absolute', top: '15px', right: '15px', background: '#111', border: '1px solid #333', color: '#ff65bf', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                 <Trash2 size={14}/>
               </button>
               <div style={{ width: '100%', height: '200px', borderRadius: '8px', backgroundImage: item.image ? `url("${item.image}")` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {!item.image && <span style={{fontSize:'40px'}}>✨</span>}
               </div>
               <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{item.name}</h3>
               <p style={{ color: 'var(--muted)', margin: '0 0 15px 0', fontSize: '0.9rem' }}>Type: {item.type}</p>
               <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <b style={{ fontSize: '1.2rem' }}>₹{item.price}</b>
                 <button onClick={() => moveToCart(item)} className="btn solid" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Add to Cart</button>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}
