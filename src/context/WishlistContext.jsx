"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [shareKey, setShareKey] = useState(null);

  useEffect(() => {
    try {
      // 1. Get or create a random share_key for guests
      let key = localStorage.getItem('ns_wishlist_key');
      if (!key) {
        key = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('ns_wishlist_key', key);
      }
      setShareKey(key);

      // 2. Load locally cached items first for instant UI
      const saved = JSON.parse(localStorage.getItem('ns_wishlist_items') || '[]');
      setWishlist(saved);

      // 3. Fetch from API (this will use TI WooCommerce Wishlist)
      fetch(`/api/wishlist?share_key=${key}`)
        .then(res => res.json())
        .then(data => {
          // Sync with database if needed, currently we prioritize local for speed
          if (data && data.items && data.items.length > 0) {
            // Note: Map TI wishlist items if keys are present
          }
        })
        .catch(console.error);
    } catch (e) {}
  }, []);

  const toggleWishlist = async (product) => {
    const isAdded = wishlist.find(item => item.name === product.name);
    let updated;
    
    if (isAdded) {
      updated = wishlist.filter(item => item.name !== product.name);
      // Call remove API
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', share_key: shareKey, item_id: product.id || 0 })
      }).catch(console.error);
    } else {
      updated = [...wishlist, product];
      // Call add API
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', share_key: shareKey, product_id: product.id || 0 })
      }).catch(console.error);
    }

    setWishlist(updated);
    localStorage.setItem('ns_wishlist_items', JSON.stringify(updated));
  };

  const isInWishlist = (productName) => {
    return wishlist.some(item => item.name === productName);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
