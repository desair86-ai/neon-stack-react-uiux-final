"use client";
import React from 'react';

export default function ProfilePage() {
  return (
    <div style={{ padding: '40px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '20px' }}>Account Details</h3>
      <div style={{ marginBottom: '15px' }}>
         <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>Name</label>
         <input type="text" value="Signneon" readOnly style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
         <label style={{ display: 'block', marginBottom: '5px', color: 'var(--muted)' }}>Email</label>
         <input type="email" value="signneon95@gmail.com" readOnly style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
      </div>
      <button className="btn outline" style={{ marginTop: '20px' }}>Edit Profile</button>
    </div>
  );
}
