'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, ArrowRight, ShieldCheck } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    sender: 'ai',
    text: "Hi! I'm the Neon Stack AI. 👋 I can help you explore our custom neon signs, collections, and design options.\n\nTell me what kind of sign you're looking for!",
    timestamp: 'Just now',
    links: [
      { label: "✨ Create Custom Neon", url: "/custom-neon", isPrimary: true },
      { label: "🛒 Shop Collections", url: "/collections" }
    ]
  }
];

const QUICK_QUESTIONS = [
  "✨ How much does a custom sign cost?",
  "🚚 What are the shipping times?",
  "🎨 Can I upload my own business logo?",
  "🔌 Are the signs safe and energy efficient?",
  "💦 Do you make waterproof/outdoor signs?"
];

const formatMessage = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'inherit', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function NeonChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    const lowerText = text.toLowerCase();
    
    // Intercept 1: Crisis
    const crisisKeywords = ['sad', 'suicid', 'depress', 'kill myself', 'unhappy'];
    if (crisisKeywords.some(k => lowerText.includes(k))) {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I'm very sorry you're feeling this way. While I'm just an AI for Neon Stack, help is available. Please reach out to a professional or someone you trust.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    // Intercept 2: Angry/Frustrated User
    const angryKeywords = ['scam', 'terrible', 'useless', 'refund', 'angry', 'fuck', 'shit', 'broken', 'damaged'];
    if (angryKeywords.some(k => lowerText.includes(k))) {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I'm really sorry you're having a frustrating experience. Our customers' satisfaction is our top priority. Please reach out to our team so a human can help you immediately.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: [
          { label: "📧 Contact Support", url: "/contact", isPrimary: true }
        ]
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    // Intercept 3: Account/Billing/Orders
    const billingKeywords = ['invoice', 'billing', 'order status', 'track my order', 'credit card'];
    if (billingKeywords.some(k => lowerText.includes(k))) {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I don't have access to your account details for security reasons, but you can check your orders in your dashboard, or our team can help you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: [
          { label: "📦 View My Orders", url: "/account", isPrimary: true },
          { label: "💳 Contact Support", url: "/contact" }
        ]
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    // Main AI Fetch
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://127.0.0.1:8787';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, context: 'neon_signs' }) // Context restriction hint for the backend
      });

      let data = {};
      if (!response.ok) {
        // Fallback for demo since we don't have the real backend yet
        data = {
          text: "I am your AI assistant! Currently, my neural backend is not fully connected, but I'm specialized in answering all your questions about Neon Stack's custom signs, UV printed signs, and business logos.",
          links: []
        };
      } else {
        data = await response.json();
      }
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || "I am specialized in Neon Signs. How can I help you customize your space?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: data.links
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "My connection to the cloud seems to be interrupted. Please try again or visit our contact page!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: [{ label: "📧 Contact Us", url: "/contact", isPrimary: true }]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #070910 0%, #130a1e 100%)',
            color: '#fff',
            border: '1px solid #752eff',
            borderRadius: '100px',
            padding: '12px 22px',
            fontSize: '14px',
            fontFamily: 'Space Grotesk',
            fontWeight: 800,
            boxShadow: '0 10px 30px rgba(117, 46, 255, 0.3)',
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={18} color="#00ffbc" />
            <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#00ffbc', border: '2px solid #070910' }} />
          </div>
          <span>{isOpen ? 'Close Chat' : 'Ask AI'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '30px',
              width: 'clamp(320px, 90vw, 400px)',
              height: '560px',
              maxHeight: '75vh',
              background: '#070910',
              border: '1px solid #752eff',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9998,
              fontFamily: 'sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #130a1e 0%, #070910 100%)', padding: '15px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(0, 255, 188, 0.1)', border: '1px solid rgba(0, 255, 188, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ffbc' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk' }}>Neon Stack AI</span>
                    <span style={{ fontSize: '10px', background: '#00ffbc', color: '#070910', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>ONLINE</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>24/7 Neon Expert</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Verified Badge */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#ff65bf', fontWeight: 700 }}>
              <ShieldCheck size={14} /> Official Support Assistant
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: msg.sender === 'user' ? 'linear-gradient(135deg, #00ffbc, #00d29a)' : 'rgba(255,255,255,0.05)', color: msg.sender === 'user' ? '#070910' : '#fff', padding: '12px 15px', borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: '13px', lineHeight: 1.5, fontWeight: msg.sender === 'user' ? 600 : 400, border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                    {formatMessage(msg.text)}
                  </div>
                  {msg.links && msg.links.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', width: '100%' }}>
                      {msg.links.map((link, i) => (
                        <Link key={i} href={link.url} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', background: link.isPrimary ? 'linear-gradient(90deg, #752eff, #b258ff)' : 'rgba(255,255,255,0.05)', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', border: link.isPrimary ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
                          <span>{link.label}</span>
                          <ArrowRight size={14} />
                        </Link>
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: '10px', color: '#666', marginTop: '4px', padding: '0 4px' }}>{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 15px', borderRadius: '18px 18px 18px 4px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '13px' }}>
                  <span>Typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Toggle */}
            <div style={{ padding: '8px 15px 4px 15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>Suggested</span>
              <button onClick={() => setShowQuickQuestions(!showQuickQuestions)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}>
                {showQuickQuestions ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Quick Starter Chips */}
            {showQuickQuestions && (
              <div style={{ padding: '5px 15px 10px 15px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                {QUICK_QUESTIONS.map((q, index) => (
                  <button key={index} onClick={() => handleSendMessage(q)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 12px', color: '#ddd', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: '0.2s', textAlign: 'left' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <div style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about custom neons..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none' }} />
              <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isTyping} style={{ background: inputValue.trim() ? '#00ffbc' : 'rgba(255,255,255,0.05)', color: inputValue.trim() ? '#070910' : '#666', border: 'none', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'default' }}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
