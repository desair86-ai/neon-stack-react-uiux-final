'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const login = searchParams.get('login');

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, login, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Your password has been reset successfully. You can now log in.');
        setPassword('');
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!key || !login) {
    return (
      <div style={{ padding: '40px', maxWidth: '400px', margin: '100px auto', background: '#0a121d', borderRadius: '12px', color: '#fff', border: '1px solid #1a273b' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Invalid Link</h2>
        <p style={{ color: '#b8bfd8' }}>This password reset link is invalid or missing required parameters. Please request a new password reset.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '100px auto', background: '#0a121d', borderRadius: '12px', color: '#fff', border: '1px solid #1a273b' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b8bfd8' }}>New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            style={{ width: '100%', padding: '12px', background: '#11151f', border: '1px solid #2a3040', color: '#fff', borderRadius: '6px', outline: 'none' }}
          />
        </div>
        {error && <div style={{ color: '#ff65bf', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        {message && <div style={{ color: '#00ffbc', marginBottom: '20px', fontSize: '14px' }}>{message}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#ff65bf', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Saving...' : 'Save Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050a10', display: 'flex', alignItems: 'center' }}>
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', width: '100%' }}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
