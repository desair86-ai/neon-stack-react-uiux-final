"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header, Footer } from '../../src/components';
import { ChevronRight } from 'lucide-react';

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
      <div style={{ background: '#e9e4dc', padding: '60px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontFamily: 'Space Grotesk', margin: 0, color: '#111' }}>My Account</h1>
      </div>
      <main className="accountPage container">
        
        <div className="accountLayout">
          <aside className="accountSidebar" style={{ background: 'transparent', border: 'none' }}>
            <nav className="accountNav">
              <Link href="/account" className={pathname === '/account' ? 'active' : ''}>Dashboard</Link>
              <Link href="/account/orders" className={pathname === '/account/orders' ? 'active' : ''}>Orders</Link>
              <Link href="/account/addresses" className={pathname === '/account/addresses' ? 'active' : ''}>Addresses</Link>
              <Link href="/account/profile" className={pathname === '/account/profile' ? 'active' : ''}>Account details</Link>
              <Link href="/account/wishlist" className={pathname === '/account/wishlist' ? 'active' : ''}>Wishlist</Link>
              <button className="logoutBtn" onClick={() => { localStorage.removeItem('is_logged_in'); window.location.href='/login'; }} style={{ padding: '12px 20px', color: '#d8d9e4', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Log out</button>
            </nav>
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
