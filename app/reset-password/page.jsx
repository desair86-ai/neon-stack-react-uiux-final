'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, KeyRound } from 'lucide-react';
import { Header, Footer } from '../../src/components';

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
      <PasswordPageShell><section className="passwordPanel" aria-labelledby="invalid-link-title"><div className="passwordIcon"><KeyRound size={26} /></div><p className="passwordEyebrow">ACCOUNT ACCESS</p><h1 id="invalid-link-title">Invalid reset link</h1><p className="passwordIntro">This password reset link is invalid or missing required details. Request a new link to continue.</p><Link className="btn primary passwordAction" href="/forgot-password">Request a new link</Link></section></PasswordPageShell>
    );
  }

  return (
    <PasswordPageShell><section className="passwordPanel" aria-labelledby="new-password-title"><div className="passwordIcon"><KeyRound size={26} /></div><p className="passwordEyebrow">ACCOUNT ACCESS</p><h1 id="new-password-title">Create a new password</h1><p className="passwordIntro">Choose a strong password for your Neon Stack account.</p>
      <form onSubmit={handleSubmit}>
        <div className="passwordForm">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
          />
        </div>
        {error && <div className="passwordStatus error">{error}</div>}
        {message && <div className="passwordStatus success">{message}</div>}
        <button className="btn primary passwordAction" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save password'}</button>
      </form>
      <Link className="passwordBack" href="/login">Back to login</Link></section></PasswordPageShell>
  );
}

function PasswordPageShell({ children }) {
  return <><Header /><main className="passwordPage"><div className="passwordPageInner"><div className="crumb"><Link href="/">Home</Link><ChevronRight /> Account <ChevronRight /> Password</div>{children}</div></main><Footer /></>;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="passwordPage"><div className="passwordPageInner"><div className="passwordPanel">Loading...</div></div></main>}>
        <ResetPasswordForm />
    </Suspense>
  );
}
