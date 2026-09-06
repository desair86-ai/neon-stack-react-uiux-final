"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, PenTool, Heart, MapPin, Plus } from 'lucide-react';
import { useWishlist } from './context/WishlistContext';
import { getFeaturedProducts } from './lib/api';

export function Account() {
  const { wishlist } = useWishlist() || { wishlist: [] };
  const [featured, setFeatured] = useState([]);
  
  useEffect(() => {
    getFeaturedProducts().then(setFeatured).catch(console.error);
  }, []);
  
  return (
    <>
      <div className="welcomeBanner">
        <div>
          <h2>Welcome back,<br/>Signneon! 👋</h2>
          <p>Good ideas look brighter here.</p>
        </div>
      </div>
      
      <div className="statCards">
        <div className="statCard">
          <div className="statIcon pink"><Package/></div>
          <div className="statInfo">
            <strong>2</strong>
            <span>Total Orders</span>
          </div>
          <Link href="/account/orders" className="statLink">View orders &rarr;</Link>
        </div>
        <div className="statCard">
          <div className="statIcon pink"><Heart/></div>
          <div className="statInfo">
            <strong>{wishlist.length}</strong>
            <span>In Wishlist</span>
          </div>
          <Link href="/account/wishlist" className="statLink">View wishlist &rarr;</Link>
        </div>
        <div className="statCard">
          <div className="statIcon purple"><MapPin/></div>
          <div className="statInfo">
            <strong>0</strong>
            <span>Saved Addresses</span>
          </div>
          <Link href="/account/addresses" className="statLink">Add address &rarr;</Link>
        </div>
      </div>
      
      <section className="accountSection">
        <div className="sectionHeader">
          <h3>Recent Orders</h3>
          <Link href="/account/orders" className="viewAll">View all orders &rarr;</Link>
        </div>
        <div className="orderList">
          <div className="orderCard">
            <div className="orderImg" style={{backgroundImage: 'url(/images/2.png)'}}></div>
            <div className="orderMeta">
              <small>#NS10482</small>
              <h4>Custom Neon Sign</h4>
              <span>60 cm • Warm White</span>
              <span>29 Aug 2026</span>
            </div>
            <div className="orderStatus">
              <span className="badge success">● Delivered</span>
            </div>
            <div className="orderAction">
              <b>₹12,499</b>
              <button className="btn outline">View Order</button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="accountSection">
        <div className="sectionHeader">
          <h3>Featured Products</h3>
          <Link href="/collections" className="viewAll">View all &rarr;</Link>
        </div>
        <div className="designGrid">
          {featured.map(w => (
            <div className="designCard" key={w.name}>
              <div className="designImg" style={{backgroundImage: w.image ? `url("${w.image}")` : 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', background: !w.image ? '#111' : undefined}}>
                {!w.image && <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}><span style={{fontSize:'30px'}}>✨</span></div>}
              </div>
              <div className="designInfo">
                <h4>{w.name}</h4>
                <small>From ₹{w.price}</small>
                <Link href="/collections" className="btn outline">View Product</Link>
              </div>
            </div>
          ))}
          <div className="designCard newDesign">
            <div className="newDesignContent">
              <div className="plusIcon"><Plus/></div>
              <h4>Create New Neon</h4>
              <small>Start a new design<br/>from scratch</small>
              <Link href="/custom-neon" className="btn primary">Design Now &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
      
      <div className="bottomPromo" style={{ backgroundImage: 'url("/images/mojo_bg_clean.webp")' }}>
        <div>
          <h2>Still have an idea<br/>in mind?</h2>
          <p>Our design studio is always open.</p>
          <Link href="/custom-neon" className="btn primary">Start Designing &rarr;</Link>
        </div>
      </div>
    </>
  );
}
