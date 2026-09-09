"use client";
import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('ns_token');
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'getProfile' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile({
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        email: data.profile.email || '',
        username: data.profile.username || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('ns_token');
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'updateProfile', ...profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Account details updated successfully');
      if (data.customer) {
        const nsUser = JSON.parse(localStorage.getItem('ns_user') || '{}');
        nsUser.username = data.customer.username;
        nsUser.email = data.customer.email;
        localStorage.setItem('ns_user', JSON.stringify(nsUser));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('ns_token');
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'changePassword',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#8992a5' }}>
        Loading account details...
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

      {/* Account Details */}
      <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
        <h3 style={{ marginBottom: '25px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Account Details</h3>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>First name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Last name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn primary" style={{ padding: '12px 24px', borderRadius: '50px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '12px', padding: '30px' }}>
        <h3 style={{ marginBottom: '25px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Current password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>New password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>Confirm new password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8992a5' }} />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={changingPassword} className="btn primary" style={{ padding: '12px 24px', borderRadius: '50px', opacity: changingPassword ? 0.7 : 1 }}>
            {changingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
