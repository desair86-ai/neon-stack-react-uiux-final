"use client";
import React from 'react';
import { Award, Wrench, Package, ShieldCheck, Users, HandHeart } from 'lucide-react';

export function InfiniteTicker() {
  const items = [
    { text: 'Top-Notch Quality', icon: <Award size={22} />, color: '#74c0fc', shadow: '0 0 10px rgba(116, 192, 252, 0.8)' },
    { text: 'Value for Money', icon: <HandHeart size={22} />, color: '#b197fc', shadow: '0 0 10px rgba(177, 151, 252, 0.8)' },
    { text: '2 Mins Installation', icon: <Wrench size={22} />, color: '#63e6be', shadow: '0 0 10px rgba(99, 230, 190, 0.8)' },
    { text: '100% Timely Delivery', icon: <Package size={22} />, color: '#66d9e8', shadow: '0 0 10px rgba(102, 217, 232, 0.8)' },
    { text: '2 Year Warranty', icon: <ShieldCheck size={22} />, color: '#8ce99a', shadow: '0 0 10px rgba(140, 233, 154, 0.8)' },
    { text: <>4.8 <span style={{ color: '#ffd43b', textShadow: '0 0 8px #ffd43b' }}>🌟</span> Rating by 20K+ Customers</>, icon: <Users size={22} />, color: '#ffd43b', shadow: '0 0 10px rgba(255, 212, 59, 0.8)' },
  ];

  // We duplicate the items to make the infinite scroll seamless
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {repeatedItems.map((item, i) => (
          <div className="ticker-item" key={i}>
            <span style={{ 
              display: 'inline-flex', 
              color: item.color, 
              marginRight: '12px',
              filter: `drop-shadow(${item.shadow})` 
            }}>
              {item.icon}
            </span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
