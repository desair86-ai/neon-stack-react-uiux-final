'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail } from 'lucide-react';
import { Header, Footer } from '../../src/components';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'We could not send the reset email.');
      setStatus({ type: 'success', text: data.message || 'Check your email for a password reset link.' });
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="passwordPage">
        <div className="passwordPageInner">
          <div className="crumb"><Link href="/">Home</Link><ChevronRight /> Account <ChevronRight /> Forgot password</div>
          <section className="passwordPanel" aria-labelledby="forgot-password-title">
            <div className="passwordIcon"><Mail size={26} /></div>
            <p className="passwordEyebrow">ACCOUNT ACCESS</p>
            <h1 id="forgot-password-title">Forgot your password?</h1>
            <p className="passwordIntro">Enter the email address connected to your account and we&apos;ll send you a secure link to create a new password.</p>
            <form className="passwordForm" onSubmit={handleSubmit}>
              <label htmlFor="reset-email">Email address</label>
              <input id="reset-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
              {status.text && <p className={`passwordStatus ${status.type}`} role="status">{status.text}</p>}
              <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Sending link...' : 'Send reset link'}</button>
            </form>
            <Link className="passwordBack" href="/login">Back to login</Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
