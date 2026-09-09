"use client";
import React, { useEffect, useState } from "react";
import { Header, Footer } from "../../src/components";
import Link from "next/link";
import { Info, CheckCircle } from "lucide-react";
import { StateSelect, CitySelect } from 'react-country-state-city';
import "react-country-state-city/dist/react-country-state-city.css";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const saved = JSON.parse(localStorage.getItem('ns_cart') || '[]');
      setCart(saved);
    } catch(e) {}
  }, []);

  const total = cart.reduce((acc, item) => {
    const p = parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0;
    return acc + (p * (item.qty || 1));
  }, 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedState || !selectedCity) {
      setError('Please select your state and city.');
      setLoading(false);
      return;
    }

    const getProductId = (item) =>
      Number(
        item?.product_id ??
        item?.woocommerce?.product_id ??
        0
      );

    const staleCartItem = cart.find(item => {
      const productId = getProductId(item);
      return !Number.isInteger(productId) || productId < 1;
    });
    if (staleCartItem) {
      setError('One or more cart items are outdated. Remove them and add the products again.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    const billing = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      address_1: formData.get('address1'),
      address_2: formData.get('address2'),
      city: selectedCity.name,
      state: selectedState.name,
      postcode: formData.get('postcode'),
      country: 'IN',
      email: formData.get('email'),
      phone: '+91' + formData.get('phone')
    };
    const notes = formData.get('notes');
    
    const payload = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing,
      shipping: billing,
      customer_note: notes,
      ...(createAccount ? { create_account: true } : {}),
      line_items: cart.map(item => {
        const productId = getProductId(item);

        const mergedNeonStack = {
          ...(item.neon_stack || {}),
        };

        if (!mergedNeonStack.screenshot_token && item.screenshot_token) {
          mergedNeonStack.screenshot_token = item.screenshot_token;
        }

        return {
          product_id: productId,
          name: item.name + (item.type ? ` (${item.type})` : ''),
          total: String(
            ((parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")) || 0) *
              (item.qty || 1))
          ),
          quantity: item.qty || 1,

          ...(item.neon_stack || item.screenshot_token
            ? {
                meta_data: [
                  {
                    key: 'neon_stack',
                    value: JSON.stringify(mergedNeonStack),
                  },
                ],
              }
            : {}),
        };
      })
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order');
      }
      
      localStorage.removeItem('ns_cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderPlaced(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  if (orderPlaced) {
    return (
      <>
        <Header />
        <main className="container" style={{ minHeight: '60vh', padding: '32px 20px 60px', textAlign: 'center' }}>
          <CheckCircle color="#00ffbc" size={80} style={{ margin: '0 auto 20px auto' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>Order Received</h1>
          <p style={{ color: '#8992a5', fontSize: '1.1rem', marginBottom: '40px' }}>Thank you. Your order has been received and we'll start crafting it soon.</p>
          <Link href="/collections" className="btn primary" style={{ padding: '12px 30px' }}>Return to Shop</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="container" style={{ minHeight: '60vh', padding: '32px 20px 60px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Checkout</h1>
          <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '20px' }}>Your cart is currently empty.</p>
          <Link href="/collections" className="btn primary">Return to Shop</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="container" style={{ minHeight: '60vh', padding: '32px 20px 60px' }}>
        
        <div onClick={() => setShowCoupon(!showCoupon)} style={{ background: '#0a121d', border: '1px solid #1a273b', borderRadius: '8px', padding: '15px 20px', color: '#66a3ff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: showCoupon ? '20px' : '40px', cursor: 'pointer', transition: '0.2s' }}>
          <Info size={20} />
          <span>Have a coupon? Click here to enter your code</span>
        </div>

        {showCoupon && (
          <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '8px', padding: '20px', marginBottom: '40px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, color: '#b8bfd8', fontSize: '14px', width: '100%' }}>If you have a coupon code, please apply it below.</p>
            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '450px' }}>
              <input type="text" placeholder="Coupon code" style={{ width: '100%', padding: '12px 15px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              <button type="button" className="btn ghost" disabled style={{ borderRadius: '6px', whiteSpace: 'nowrap', opacity: 0.5, cursor: 'not-allowed' }}>Apply coupon</button>
            </div>
          </div>
        )}

        <form id="checkout-form" onSubmit={handlePlaceOrder}>
          {isDropdownActive && (
             <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 8, backdropFilter: 'blur(3px)' }}></div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', position: 'relative' }} className="checkout-grid">
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '25px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Billing details</h2>
              
              <div className="checkout-billing-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>First name <span style={{ color: '#ff65bf' }}>*</span></label>
                  <input type="text" name="firstName" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Last name <span style={{ color: '#ff65bf' }}>*</span></label>
                  <input type="text" name="lastName" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Country / Region <span style={{ color: '#ff65bf' }}>*</span></label>
                <select style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none', appearance: 'none' }}>
                  <option>India</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Street address <span style={{ color: '#ff65bf' }}>*</span></label>
                <input type="text" name="address1" required placeholder="House number and street name" style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none', marginBottom: '10px' }} />
                <input type="text" name="address2" placeholder="Apartment, suite, unit, etc. (optional)" style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px', position: 'relative', zIndex: isDropdownActive ? 10 : 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>State <span style={{ color: '#ff65bf' }}>*</span></label>
                <div className="dark-location-select" onFocus={() => setIsDropdownActive(true)} onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsDropdownActive(false);
                  }
                }}>
                  <StateSelect 
                    countryid={101}
                    onChange={(e) => { 
                      setSelectedState(e); 
                      setSelectedCity(null); 
                      setIsDropdownActive(false);
                    }} 
                    placeHolder="Select State" 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px', position: 'relative', zIndex: isDropdownActive ? 9 : 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Town / City <span style={{ color: '#ff65bf' }}>*</span></label>
                <div style={{ opacity: selectedState ? 1 : 0.5, pointerEvents: selectedState ? 'auto' : 'none' }} className="dark-location-select" onFocus={() => setIsDropdownActive(true)} onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsDropdownActive(false);
                  }
                }}>
                  <CitySelect 
                    countryid={101} 
                    stateid={selectedState?.id || 0}
                    onChange={(e) => {
                      setSelectedCity(e);
                      setIsDropdownActive(false);
                    }} 
                    placeHolder="Select City" 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>PIN Code <span style={{ color: '#ff65bf' }}>*</span></label>
                <input type="text" name="postcode" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Phone <span style={{ color: '#ff65bf' }}>*</span></label>
                <div style={{ display: 'flex', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px' }}>
                  <span style={{ padding: '12px 16px', color: '#fff', borderRight: '1px solid #2a3040', background: '#0a121d', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', fontWeight: '500' }}>+91</span>
                  <input type="tel" name="phone" required style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Email address <span style={{ color: '#ff65bf' }}>*</span></label>
                <input type="email" name="email" required style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#fff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#ff65bf', cursor: 'pointer' }} />
                  Create an account?
                </label>
              </div>

              {createAccount && (
                <div style={{ marginBottom: '20px', padding: '20px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#b8bfd8', fontSize: '14px', lineHeight: '1.5' }}>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our privacy policy. An email will be sent to you with a link to set a password.</p>
                </div>
              )}
            </div>

            <div>
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '25px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Additional information</h2>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Order notes (optional)</label>
                <textarea name="notes" placeholder="Notes about your order, e.g. special notes for delivery." style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none', minHeight: '100px', resize: 'vertical' }}></textarea>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '25px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Your order</h2>
              
              <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '25px', marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1c212e' }}>
                      <th style={{ padding: '0 0 15px 0', textAlign: 'left', fontWeight: '600', color: '#fff' }}>Product</th>
                      <th style={{ padding: '0 0 15px 0', textAlign: 'right', fontWeight: '600', color: '#fff' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #1c212e' }}>
                        <td style={{ padding: '15px 0', color: '#b8bfd8' }}>
                          {item.name} <strong style={{ color: '#fff', marginLeft: '5px' }}>× {item.qty || 1}</strong>
                        </td>
                        <td style={{ padding: '15px 0', textAlign: 'right', color: '#fff' }}>
                          ₹{((parseFloat(String(item.price).replace(/[^0-9.-]+/g,"")) || 0) * (item.qty || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderBottom: '1px solid #1c212e' }}>
                      <th style={{ padding: '15px 0', textAlign: 'left', color: '#fff', fontWeight: 'normal' }}>Subtotal</th>
                      <td style={{ padding: '15px 0', textAlign: 'right', color: '#fff', fontWeight: '600' }}>₹{total.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: '20px 0 0 0', textAlign: 'left', color: '#fff', fontSize: '1.1rem' }}>Total</th>
                      <td style={{ padding: '20px 0 0 0', textAlign: 'right', color: '#00ffbc', fontWeight: 'bold', fontSize: '1.4rem' }}>₹{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#09121d', padding: '25px', borderRadius: '12px', border: '1px solid #253448' }}>
                {error && <div style={{ background: '#3b1a1a', border: '1px solid #e03131', padding: '15px', borderRadius: '6px', color: '#ffb3b3', marginBottom: '20px' }}>{error}</div>}
                
                <div style={{ background: '#0a121d', border: '1px solid #1a273b', padding: '15px', borderRadius: '6px', color: '#66a3ff', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '14px', lineHeight: '1.5' }}>Currently processing Cash on Delivery orders. Online payments will be available soon.</span>
                </div>
                
                <p style={{ fontSize: '14px', color: '#9699a5', lineHeight: '1.6', marginBottom: '30px' }}>
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={loading} className="btn primary" style={{ padding: '15px 30px', borderRadius: '50px', fontSize: '15px', width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <style>{`
          @media (max-width: 900px) {
            .checkout-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 520px) {
            .checkout-billing-name-row {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </main>
      <Footer />
    </>
  ); 
}
