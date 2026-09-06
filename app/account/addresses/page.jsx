"use client";
import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '../../../src/components';
import { ChevronRight } from 'lucide-react';

export default function AddressesPage() {
  return (
    <>
      <Header />
      <main className="accountPage container" style={{ minHeight: '60vh', padding: '60px 20px' }}>
        <div className="crumb" style={{ marginBottom: '40px', color: '#888' }}>
          <Link href="/account" style={{ color: '#fff', textDecoration: 'none' }}>My Account</Link> <ChevronRight size={14}/> Addresses
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>My Addresses</h1>
        <div style={{ padding: '60px', textAlign: 'center', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>No saved addresses</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>You haven't saved any addresses yet. Add one during your next checkout.</p>
          <Link href="/collections" className="btn primary">Start Shopping</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
