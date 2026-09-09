"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from './components';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      localStorage.setItem('ns_token', data.token);
      localStorage.setItem('ns_user', JSON.stringify(data.user));
      localStorage.setItem('is_logged_in', 'true');
      window.location.href = '/account';
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true); setRegError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Auto login after register
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regEmail, password: regPass })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem('ns_token', loginData.token);
        localStorage.setItem('ns_user', JSON.stringify(loginData.user));
        localStorage.setItem('is_logged_in', 'true');
        window.location.href = '/account';
      } else {
        setRegError('Registered, but failed to log in automatically.');
      }
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="loginPage container">
        <div className="crumb">Home <ChevronRight/> My Account</div>
        <h1 className="pageTitle">My Account</h1>
        
        <div className="authGrid">
          {/* Login Section */}
          <div className="authBox">
            <h2>Login</h2>
            {loginError && <div style={{ color: '#ffb3b3', background: '#3b1a1a', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{loginError}</div>}
            <form className="authForm" onSubmit={handleLogin}>
              <div className="formGroup">
                <label>Username or email address <span>*</span></label>
                <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} required />
              </div>
              
              <div className="formGroup">
                <label>Password <span>*</span></label>
                <div className="passwordInput">
                  <input type={showPassword ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                  <button type="button" className="togglePassword" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              
              <div className="formActions">
                <button type="submit" disabled={loginLoading} className="btn primary">{loginLoading ? 'Logging in...' : 'Log in'}</button>
                <label className="rememberMe">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>
              
              <Link href="/forgot-password" className="lostPassword">Lost your password?</Link>
            </form>
          </div>
          
          {/* Register Section */}
          <div className="authBox">
            <h2>Register</h2>
            {regError && <div style={{ color: '#ffb3b3', background: '#3b1a1a', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{regError}</div>}
            <form className="authForm" onSubmit={handleRegister}>
              <div className="formGroup">
                <label>Email address <span>*</span></label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>

              <div className="formGroup">
                <label>Password <span>*</span></label>
                <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} required />
              </div>
              
              <div className="authNotice">
                <p>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <Link href="/privacy-policy">privacy policy</Link>.</p>
              </div>
              
              <button type="submit" disabled={regLoading} className="btn primary">{regLoading ? 'Registering...' : 'Register'}</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

