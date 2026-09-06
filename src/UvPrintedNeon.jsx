"use client";
import React from 'react';
import { motion } from 'framer-motion';

import { InfiniteTicker } from './InfiniteTicker';

export function UvPrintedNeon() {
  return (
    <main className="uvPage" style={{ background: '#040509', color: '#fff', overflow: 'hidden', paddingBottom: '80px' }}>
      <section style={{ paddingTop: '80px', paddingBottom: '40px', textAlign: 'center' }} className="container">
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1 }}>
          <span style={{ color: '#fff' }}>UV Print </span>
          <span style={{ background: "linear-gradient(90deg, #00e5ff, #752eff, #6eff86)", WebkitBackgroundClip: "text", color: "transparent" }}>Neon Signs</span>
        </h1>
      </section>
      
      <InfiniteTicker />

      {/* Block 1 */}
      <section className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(202,110,255,0.2)', boxShadow: '0 0 30px rgba(202,110,255,0.3)' }}>
              <img src="/images/UVneon.webp" alt="UV Print Neon Art" style={{ width: '100%', display: 'block' }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 'bold', marginBottom: '16px' }}>UV Neon Prints: A Modern Twist on Neon Art</h2>
            <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '16px' }}>
              In the dynamic and emotive realm of art, neon prints are quickly finding a niche as a groundbreaking route to inject color into your space. With developments of UV printing technology, UV print neon signs are now giving an interesting, new, nature-friendly alternative to neon signage. The recent development and how it works, the advantage of print neon art, and why it's fast becoming the trend of the modern interior are covered in the content to follow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Block 2 */}
      <section className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} style={{ order: 1 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 'bold', marginBottom: '16px' }}>What is UV Printing?</h2>
            <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '16px' }}>
              UV printing is one of the fastest-growing areas in the printing industry, which can be defined as a digital process of instantly drying the ink when printing under ultraviolet (UV) light. Unlike other traditional ways of printing that use solvent-based inks, usually taking quite some time to dry and often releasing harmful chemicals, UV printing uses inks that are instantly dried by the UV light. The result is a much more vivid, durable, and eco-friendly print. The technology is utilized to realize bright and long-lasting images on acrylic, metal, and glass in UV print neon signs.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} style={{ order: 2 }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(110,255,134,0.2)', boxShadow: '0 0 30px rgba(110,255,134,0.3)' }}>
              <img src="/images/bxynu2pquqilctnfq4rn.webp" alt="UV Printing Process" style={{ width: '100%', display: 'block' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Block 3 */}
      <section className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(254,138,46,0.2)', boxShadow: '0 0 30px rgba(254,138,46,0.3)' }}>
              <img src="/images/planet_uv_printed_led_neon_light.webp" alt="Traditional vs UV Print" style={{ width: '100%', display: 'block' }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 'bold', marginBottom: '16px' }}>How Does a UV Print Neon Sign Differ from a Traditional Neon Light?</h2>
            <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '16px', marginBottom: '16px' }}>
              UV-printed neon art prints are quite different from neon signs. The traditional neon signs are made by bending glass tubes into different shapes and filling them with a gas that glows when electrified. Even though they are iconic and surely a treat to the eyes, there are various limitations in the use of traditional neon signs. They are fragile, use a lot of energy, and offer a limited range of colors.
            </p>
            <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '16px' }}>
              In contrast, neon signs produced with UV printing manifest much more flexibility in design and color. Since the image is directly printed on some surface by UV light, there simply are no limitations to design. These signs are more long-lasting and also very energy-efficient, thus applicable for commercial and residential areas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2 Column Cards */}
      <section className="container" style={{ padding: '60px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(110,255,134,0.4)', boxShadow: '0 0 15px rgba(110,255,134,0.1)', height: '100%' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ffbc', marginBottom: '16px' }}>The Eco-Friendly Advantage</h2>
              <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '15px' }}>
                In today's environmentally conscious world, the demand for eco-friendly products is higher than ever. Print neon art created through UV printing aligns perfectly with this trend. UV printing is an ecologically beneficial option since it uses less energy, produces less waste, and releases less volatile organic compounds (VOCs) than conventional printing methods. Moreover, UV print neon signs are typically made from recyclable materials, reducing their environmental impact.
              </p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(117,46,255,0.4)', boxShadow: '0 0 15px rgba(117,46,255,0.1)', height: '100%' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#752eff', marginBottom: '16px' }}>The Versatility of Art Prints</h2>
              <p style={{ color: '#c1c3cb', lineHeight: 1.8, fontSize: '15px' }}>
                One of the most exciting aspects of neon art prints is their versatility. Whether you want to add a splash of color to your home, create a captivating storefront display, or design custom art for an event, UV print neon signs can be tailored to meet your needs. Because these prints may be printed in any color and on various materials, they offer an endless canvas for artistic expression.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

