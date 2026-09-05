"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from './components';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);

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
            <form className="authForm" onSubmit={(e) => e.preventDefault()}>
              <div className="formGroup">
                <label>Username or email address <span>*</span></label>
                <input type="text" required />
              </div>
              
              <div className="formGroup">
                <label>Password <span>*</span></label>
                <div className="passwordInput">
                  <input type={showPassword ? "text" : "password"} required />
                  <button type="button" className="togglePassword" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              
              <div className="formActions">
                <button type="submit" className="btn primary">Log in</button>
                <label className="rememberMe">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
              </div>
              
              <Link href="#" className="lostPassword">Lost your password?</Link>
            </form>
          </div>
          
          {/* Register Section */}
          <div className="authBox">
            <h2>Register</h2>
            <form className="authForm" onSubmit={(e) => e.preventDefault()}>
              <div className="formGroup">
                <label>Email address <span>*</span></label>
                <input type="email" required />
              </div>
              
              <div className="authNotice">
                <p>A link to set a new password will be sent to your email address.</p>
                <p>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <Link href="/privacy-policy">privacy policy</Link>.</p>
              </div>
              
              <button type="submit" className="btn primary">Register</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

