"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header, Footer } from '../../src/components';
import { ChevronRight, Package, Heart, MapPin, User, LogOut, PenTool, ChevronRight as ArrowRight } from 'lucide-react';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  
  useEffect(() => {
    if (!localStorage.getItem('is_logged_in')) {
      window.location.href = '/login';
    }
  }, []);
  
  return (
    <>
      <Header />
      <main className="accountPage container">
        <div className="crumb">
          <Link href="/">Home</Link> <ChevronRight size={14}/> My Account
        </div>
        
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
              <Link href="/account" className={pathname === '/account' ? 'active' : ''}><User className="icon"/> Overview <ArrowRight className="arrow"/></Link>
              <Link href="/account/orders" className={pathname === '/account/orders' ? 'active' : ''}><Package className="icon"/> My Orders <ArrowRight className="arrow"/></Link>
              <Link href="/account/wishlist" className={pathname === '/account/wishlist' ? 'active' : ''}><Heart className="icon"/> Wishlist <ArrowRight className="arrow"/></Link>
              <Link href="/account/addresses" className={pathname === '/account/addresses' ? 'active' : ''}><MapPin className="icon"/> Addresses <ArrowRight className="arrow"/></Link>
              <Link href="/account/profile" className={pathname === '/account/profile' ? 'active' : ''}><User className="icon"/> Profile & Security <ArrowRight className="arrow"/></Link>
              <button className="logoutBtn" onClick={() => { localStorage.removeItem('is_logged_in'); window.location.href='/login'; }}><LogOut className="icon"/> Logout</button>
            </nav>
            
            <div className="sidebarPromo">
              <PenTool className="promoIcon"/>
              <h3>Create Something<br/>Amazing Today!</h3>
              <p>Turn your ideas into<br/>custom neon signs.</p>
              <Link href="/custom-neon" className="btn primary">Create Custom Neon &rarr;</Link>
            </div>
          </aside>
          
          <div className="accountContent">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
