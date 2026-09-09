"use client";
import React, { useEffect, useState } from 'react';
import { MapPin, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { StateSelect, CitySelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

function AddressCard({ title, type, address, onSave, saving, error, success }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
    email: '',
    phone: '',
  });
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  useEffect(() => {
    if (address && !editing) {
      setForm({
        first_name: address.first_name || '',
        last_name: address.last_name || '',
        company: address.company || '',
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        state: address.state || '',
        postcode: address.postcode || '',
        country: address.country || 'IN',
        email: address.email || '',
        phone: address.phone || '',
      });
      setSelectedState(null);
      setSelectedCity(null);
    }
  }, [address, editing]);

  const startEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(type, form, selectedState, selectedCity);
    setEditing(false);
  };

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const hasContent = form.first_name || form.last_name || form.address_1 || form.city;

  return (
    <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '25px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="#00ffbc" />
          {title}
        </h3>
        {!editing && (
          <button onClick={startEdit} className="btn outline" style={{ padding: '8px 16px', fontSize: '13px', minHeight: 0, border: '1px solid var(--line)', borderRadius: '6px', color: '#fff', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={14} /> Edit
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#3b1a1a', border: '1px solid #e03131', padding: '12px', borderRadius: '6px', color: '#ffb3b3', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#1a3b2a', border: '1px solid #00ffbc', padding: '12px', borderRadius: '6px', color: '#00ffbc', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {!editing ? (
        <div style={{ color: '#b8bfd8', fontSize: '14px', lineHeight: '1.8', minHeight: '120px' }}>
          {hasContent ? (
            <>
              <p style={{ margin: 0, color: '#fff', fontWeight: 600 }}>{form.first_name} {form.last_name}</p>
              {form.company && <p style={{ margin: '4px 0 0 0' }}>{form.company}</p>}
              <p style={{ margin: '4px 0 0 0' }}>{form.address_1}</p>
              {form.address_2 && <p style={{ margin: '4px 0 0 0' }}>{form.address_2}</p>}
              <p style={{ margin: '4px 0 0 0' }}>{form.city}{form.state ? `, ${form.state}` : ''} {form.postcode}</p>
              <p style={{ margin: '4px 0 0 0' }}>{form.country}</p>
              {form.phone && <p style={{ margin: '4px 0 0 0' }}>{form.phone}</p>}
              {type === 'billing' && form.email && <p style={{ margin: '4px 0 0 0' }}>{form.email}</p>}
            </>
          ) : (
            <p style={{ margin: 0, color: '#8992a5' }}>No address saved yet.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>First name</label>
              <input type="text" value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Last name</label>
              <input type="text" value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} required style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Company (optional)</label>
            <input type="text" value={form.company} onChange={(e) => updateField('company', e.target.value)} style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Street address</label>
            <input type="text" value={form.address_1} onChange={(e) => updateField('address_1', e.target.value)} required placeholder="House number and street name" style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none', marginBottom: '10px' }} />
            <input type="text" value={form.address_2} onChange={(e) => updateField('address_2', e.target.value)} placeholder="Apartment, suite, unit, etc. (optional)" style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '15px', position: 'relative', zIndex: isDropdownActive ? 10 : 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>State</label>
            <div className="dark-location-select" onFocus={() => setIsDropdownActive(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDropdownActive(false); }}>
              <StateSelect
                countryid={101}
                onChange={(e) => { setSelectedState(e); updateField('state', e?.name || ''); setIsDropdownActive(false); }}
                placeHolder="Select State"
                value={selectedState}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px', position: 'relative', zIndex: isDropdownActive ? 9 : 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Town / City</label>
            <div style={{ opacity: selectedState ? 1 : 0.5, pointerEvents: selectedState ? 'auto' : 'none' }} className="dark-location-select" onFocus={() => setIsDropdownActive(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDropdownActive(false); }}>
              <CitySelect
                countryid={101}
                stateid={selectedState?.id || 0}
                onChange={(e) => { setSelectedCity(e); updateField('city', e?.name || ''); setIsDropdownActive(false); }}
                placeHolder="Select City"
                value={selectedCity}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>PIN Code</label>
            <input type="text" value={form.postcode} onChange={(e) => updateField('postcode', e.target.value)} required style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
          </div>

          {type === 'billing' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required style={{ width: '100%', padding: '10px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }} />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#b8bfd8' }}>Phone</label>
            <div style={{ display: 'flex', background: '#11151f', border: '1px solid #2a3040', borderRadius: '6px' }}>
              <span style={{ padding: '10px 16px', color: '#fff', borderRight: '1px solid #2a3040', background: '#0a121d', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', fontWeight: '500' }}>+91</span>
              <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} className="btn primary" style={{ padding: '10px 20px', borderRadius: '50px', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'SAVING...' : 'SAVE ADDRESS'}
            </button>
            <button type="button" onClick={cancelEdit} className="btn ghost" style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid #2a3040', color: '#b8bfd8' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState({ billing: {}, shipping: {} });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('ns_token');
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'getAddresses' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAddresses({
        billing: data.addresses.billing || {},
        shipping: data.addresses.shipping || {},
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (type, form, selectedState, selectedCity) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('ns_token');
      const payload = {
        token,
        action: 'updateAddresses',
      };

      if (type === 'billing') {
        payload.billing = {
          ...form,
          state: selectedState?.name || form.state,
          city: selectedCity?.name || form.city,
        };
      } else {
        payload.shipping = {
          ...form,
          state: selectedState?.name || form.state,
          city: selectedCity?.name || form.city,
        };
      }

      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAddresses({
        billing: data.addresses.billing || addresses.billing,
        shipping: data.addresses.shipping || addresses.shipping,
      });
      setSuccess(`${type === 'billing' ? 'Billing' : 'Shipping'} address updated successfully`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#8992a5' }}>
        Loading addresses...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {error && (
        <div style={{ background: '#3b1a1a', border: '1px solid #e03131', padding: '15px', borderRadius: '8px', color: '#ffb3b3', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#1a3b2a', border: '1px solid #00ffbc', padding: '15px', borderRadius: '8px', color: '#00ffbc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <AddressCard
          title="Billing Address"
          type="billing"
          address={addresses.billing}
          onSave={handleSaveAddress}
          saving={saving}
        />
        <AddressCard
          title="Shipping Address"
          type="shipping"
          address={addresses.shipping}
          onSave={handleSaveAddress}
          saving={saving}
        />
      </div>
    </div>
  );
}
