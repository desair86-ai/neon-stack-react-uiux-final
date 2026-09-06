"use client";
import React from 'react';
import Link from 'next/link';
import { Header, Footer } from './components';
import { ChevronRight, Package, PenTool, Heart, MapPin, User, LogOut, ChevronRight as ArrowRight, Plus } from 'lucide-react';

export function Account() {
  return (
    <>
      <Header />
      <main className="accountPage container">
        <div className="crumb">Home <ChevronRight/> My Account</div>
        
        <div className="accountLayout">
          <aside className="accountSidebar">
            <div className="userProfile">
              <div className="avatar">S</div>
              <div className="userInfo">
                <b>Hello, Signneon! 👋</b>
                <small>signneon95@gmail.com</small>
              </div>
            </div>
            
            <nav className="accountNav">
              <Link href="/account" className="active"><User className="icon"/> Overview <ArrowRight className="arrow"/></Link>
              <Link href="/account/orders"><Package className="icon"/> My Orders <ArrowRight className="arrow"/></Link>
              <Link href="/account/designs"><PenTool className="icon"/> My Designs <ArrowRight className="arrow"/></Link>
              <Link href="/account/wishlist"><Heart className="icon"/> Wishlist <ArrowRight className="arrow"/></Link>
              <Link href="/account/addresses"><MapPin className="icon"/> Addresses <ArrowRight className="arrow"/></Link>
              <Link href="/account/profile"><User className="icon"/> Profile & Security <ArrowRight className="arrow"/></Link>
              <button className="logoutBtn" onClick={() => window.location.href='/login'}><LogOut className="icon"/> Logout</button>
            </nav>
            
            <div className="sidebarPromo">
              <PenTool className="promoIcon"/>
              <h3>Create Something<br/>Amazing Today!</h3>
              <p>Turn your ideas into<br/>custom neon signs.</p>
              <Link href="/custom-neon" className="btn primary">Create Custom Neon &rarr;</Link>
            </div>
          </aside>
          
          <div className="accountContent">
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
                <div className="statIcon blue"><PenTool/></div>
                <div className="statInfo">
                  <strong>1</strong>
                  <span>Saved Design</span>
                </div>
                <Link href="/account/designs" className="statLink">View designs &rarr;</Link>
              </div>
              <div className="statCard">
                <div className="statIcon pink"><Heart/></div>
                <div className="statInfo">
                  <strong>3</strong>
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
                <div className="orderCard">
                  <div className="orderImg" style={{backgroundImage: 'url(/images/1.png)'}}></div>
                  <div className="orderMeta">
                    <small>#NS10421</small>
                    <h4>Gaming Neon Sign</h4>
                    <span>80 cm • Multicolor</span>
                    <span>12 Aug 2026</span>
                  </div>
                  <div className="orderStatus">
                    <span className="badge warning">● Processing</span>
                  </div>
                  <div className="orderAction">
                    <b>₹6,999</b>
                    <button className="btn outline">View Order</button>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="accountSection">
              <div className="sectionHeader">
                <h3>Your Saved Designs</h3>
                <Link href="/account/designs" className="viewAll">View all designs &rarr;</Link>
              </div>
              <div className="designGrid">
                <div className="designCard">
                  <div className="designImg" style={{backgroundImage: 'url(/images/2.png)'}}></div>
                  <div className="designInfo">
                    <h4>Dream Big</h4>
                    <small>Last edited 2 Sep 2026</small>
                    <button className="btn outline">Continue Editing</button>
                  </div>
                </div>
                <div className="designCard">
                  <div className="designImg" style={{backgroundImage: 'url(/images/6.png)'}}></div>
                  <div className="designInfo">
                    <h4>Crown</h4>
                    <small>Last edited 28 Aug 2026</small>
                    <button className="btn outline">Continue Editing</button>
                  </div>
                </div>
                <div className="designCard">
                  <div className="designImg" style={{backgroundImage: 'url(/images/5.png)'}}></div>
                  <div className="designInfo">
                    <h4>Heart</h4>
                    <small>Last edited 20 Aug 2026</small>
                    <button className="btn outline">Continue Editing</button>
                  </div>
                </div>
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
            
            <div className="bottomPromo">
              <div>
                <h2>Still have an idea<br/>in mind?</h2>
                <p>Our design studio is always open.</p>
                <Link href="/custom-neon" className="btn primary">Start Designing &rarr;</Link>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
