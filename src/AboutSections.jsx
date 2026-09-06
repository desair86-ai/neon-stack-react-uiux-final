"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Sparkles, MessageCircle, Heart, Star } from "lucide-react";
import { CoverflowCarousel } from "./CoverflowCarousel";

const PROMISE_VALUES = ['Trust', 'Quality', 'Innovation', 'Ethics', 'Premium Service', 'Client Relationships'];

export function PromiseFlippingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PROMISE_VALUES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", height: "60px", overflow: "hidden", display: "inline-block", width: "100%", minWidth: "250px" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0, left: 0,
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 900,
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #00ffbc, #752eff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            whiteSpace: "nowrap"
          }}
        >
          {PROMISE_VALUES[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function WhyWeExist() {
  const cards = [
    { text: "Most people see neon signs.", icon: <Eye size={32} color="#fff" /> },
    { text: "We see atmosphere.", icon: <Sparkles size={32} color="#00ffbc" /> },
    { text: "We see conversations.", icon: <MessageCircle size={32} color="#fbbf24" /> },
    { text: "We see memories.", icon: <Heart size={32} color="#fb7185" /> },
    { text: "We see brands becoming unforgettable.", icon: <Star size={32} color="#22d3ee" /> }
  ];

  return (
    <section className="container" style={{ padding: "20px 0", textAlign: "center" }}>
      <h3 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: "20px" }}>
        WHY <span style={{ background: "linear-gradient(90deg, #00ffbc, #752eff)", WebkitBackgroundClip: "text", color: "transparent" }}>WE EXIST</span>
      </h3>
      <p style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "800px", margin: "0 auto 50px" }}>
        Whether it's a neighbourhood café, a luxury residence, a retail store or a corporate office, our purpose is to create lighting that gives every space its own unique personality.
      </p>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="whyCard"
            style={{
              background: "#070910", border: "1px solid var(--line)", borderRadius: "16px",
              padding: "30px 20px", width: "100%", maxWidth: "250px", display: "flex",
              flexDirection: "column", alignItems: "center", gap: "20px", cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s"
            }}
          >
            <div className="whyIcon">{card.icon}</div>
            <p style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#fff" }}>{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function OurPromise() {
  return (
    <section className="container" style={{ padding: "20px 0" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="promiseBox"
        style={{
          background: "#070910", border: "1px solid #00ffbc", borderRadius: "24px",
          padding: "50px", display: "flex", flexDirection: "column", gap: "30px",
          boxShadow: "0 0 20px rgba(0, 255, 188, 0.15)", transition: "box-shadow 0.3s"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
          <h3 style={{ fontSize: "36px", fontWeight: 900, margin: 0, color: "#fff" }}>Our Promise</h3>
          <div style={{ width: "2px", height: "40px", background: "var(--line)", margin: "0 10px" }} className="divider" />
          <div style={{ flex: 1 }}><PromiseFlippingText /></div>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "30px" }}>
          <p style={{ fontSize: "20px", color: "#fff", marginBottom: "10px" }}>There are values we'll never compromise.</p>
          <p style={{ fontSize: "16px", color: "var(--muted)", fontStyle: "italic", margin: 0 }}>
            Every project is treated with the same care, attention and passion as if it were our own.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export function NeonStackDifference() {
  const slides = [
    { src: "/images/generated/neon_tube_close_1782443029110.webp", alt: "Layered Craftsmanship", title: "Layered Craftsmanship", subtitle: "Signature acrylic techniques." },
    { src: "/images/generated/glowing_logo_split_1782443098549.webp", alt: "Bespoke Solutions", title: "Bespoke Solutions", subtitle: "Custom designs tailored." },
    { src: "/images/generated/neon_sign_kit_1782443038661.webp", alt: "Premium Materials", title: "Premium Materials", subtitle: "Highest grade LEDs." },
    { src: "/images/generated/drilling_wall_hole_1782443059654.webp", alt: "Fast Turnaround", title: "Fast Turnaround", subtitle: "Rapid production." },
    { src: "/images/generated/mounting_screw_install_1782443069589.webp", alt: "Precision Built", title: "Precision Built", subtitle: "Flawless edges." },
    { src: "/images/generated/media__1782442791885.webp", alt: "Modern Aesthetics", title: "Modern Aesthetics", subtitle: "Clean, contemporary designs." },
    { src: "/images/generated/measuring_tape_wall_1782443048985.webp", alt: "Exceptional Service", title: "Exceptional Service", subtitle: "Dedicated support." },
    { src: "/images/generated/plugging_power_1782443080893.webp", alt: "Reliable Support", title: "Reliable Support", subtitle: "Comprehensive warranties." }
  ];

  return (
    <section className="container" style={{ padding: "20px 0", textAlign: "center", overflow: "hidden" }}>
      <h3 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: "20px" }}>
        THE NEON STACK <span style={{ background: "linear-gradient(90deg, #00ffbc, #752eff)", WebkitBackgroundClip: "text", color: "transparent" }}>DIFFERENCE</span>
      </h3>
      <p style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "800px", margin: "0 auto 30px" }}>
        We go beyond standard signs. Every piece is a testament to our commitment to quality, design, and innovation.
      </p>
      <CoverflowCarousel slides={slides} loop={true} />
    </section>
  );
}

export function WhatDrivesUs() {
  return (
    <section className="container" style={{ padding: "20px 0 60px", textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: "30px" }}>
          WHAT <span style={{ background: "linear-gradient(90deg, #00ffbc, #752eff)", WebkitBackgroundClip: "text", color: "transparent" }}>DRIVES US</span>
        </h3>
        <p style={{ fontSize: "22px", color: "#fff", fontWeight: 300, marginBottom: "15px" }}>
          Success, for us, isn't measured only by growth.<br />
          <strong style={{ fontSize: "32px", fontWeight: 900, display: "block", marginTop: "15px" }}>It is measured by trust.</strong>
        </p>
        <p style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "800px", margin: "0 auto 50px" }}>
          We aspire to become the company customers never have to think twice about. A brand known for premium quality, fastest delivery, ethical business practices and exceptional customer service.
        </p>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2px", background: "linear-gradient(90deg, #00ffbc, #752eff)", borderRadius: "20px" }}>
          <div style={{ background: "#070910", borderRadius: "18px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: "22px", fontStyle: "italic", fontWeight: 300, marginBottom: "20px", color: "#fff" }}>
              When someone asks, 'Who makes the best neon signs?', we want the answer to be simple—
            </p>
            <img src="/images/neon-stack-logo.svg" alt="The Neon Stack" style={{ height: "80px", objectFit: "contain" }} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

