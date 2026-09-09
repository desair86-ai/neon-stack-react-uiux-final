"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight, Gem, Palette, ShieldCheck, ShoppingCart, WandSparkles } from 'lucide-react';
import { Benefit } from './components';

const SLIDES = [
  {
    image: '/images/UVneon.webp',
    title: 'UV Neon Prints: A Modern Twist on Neon Art',
    text: 'In the dynamic and emotive realm of art, neon prints are quickly finding a niche as a groundbreaking route to inject color into your space. With developments of UV printing technology, UV print neon signs are now giving an interesting, new, nature-friendly alternative to neon signage.',
    accent: '#c86eff',
  },
  {
    image: '/images/bxynu2pquqilctnfq4rn.webp',
    title: 'What is UV Printing?',
    text: 'UV printing is one of the fastest-growing areas in the printing industry. It instantly dries ink under ultraviolet light, creating a much more vivid, durable, and eco-friendly print on acrylic, metal, and glass.',
    accent: '#6eff86',
  },
  {
    image: '/images/planet_uv_printed_led_neon_light.webp',
    title: 'Made for Limitless Expression',
    text: 'Traditional neon signs are fragile, use more energy, and offer a limited range of colors. UV printed neon art gives you much more flexibility in design and color, while remaining long-lasting and energy-efficient for commercial and residential spaces.',
    accent: '#fe8a2e',
  },
];

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function UvProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [name, type, image, badge, price, rawPrice, productId] = product;

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
      const existing = cart.find((item) => item.product_id === productId);
      if (existing) existing.qty = (existing.qty || 1) + 1;
      else cart.push({ id: Date.now(), name, type, image, price, product_id: productId, qty: 1 });
      localStorage.setItem('ns_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    } catch {
      setAdded(false);
    }
  };

  return (
    <article className="uvProductCard">
      <Link href="/collections" className="uvProductImage">
        <img src={image} alt={name} />
        {badge && <span>{badge}</span>}
      </Link>
      <div className="uvProductInfo">
        <small>{type}</small>
        <h3>{name}</h3>
        <div className="uvProductBottom">
          <strong>{money(rawPrice || price)}</strong>
          <button type="button" onClick={addToCart} aria-label={`Add ${name} to cart`} title={added ? 'Added to cart' : 'Add to cart'}>
            {added ? <span className="uvAddedMark">✓</span> : <ShoppingCart size={17} />}
          </button>
        </div>
      </div>
    </article>
  );
}

export function UvPrintedNeon() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/products?category=uv-printed', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Product request failed.');
        return response.json();
      })
      .then((data) => {
        if (active) setProducts(data?.items || []);
      })
      .catch(() => {
        if (active) setProductsError('UV Printed products are temporarily unavailable.');
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const slide = SLIDES[activeSlide];
  const goTo = (index) => setActiveSlide((index + SLIDES.length) % SLIDES.length);

  return (
    <main className="uvPage">
      <section className="uvHeroIntro container">
        <div className="crumb"><Link href="/">Home</Link><ChevronRight /> UV Printed</div>
        <p className="uvEyebrow">VIBRANT ARTWORK. NEON ENERGY.</p>
        <h1>UV Print <span>Neon Signs</span></h1>
        <div className="heroIcons">
          <Benefit icon={<Gem />} title="Intricate Details" text="" />
          <Benefit icon={<Palette />} title="Vibrant Colors" text="" />
          <Benefit icon={<WandSparkles />} title="Unique Design" text="" />
          <Benefit icon={<ShieldCheck />} title="Safe & Durable" text="" />
        </div>
      </section>

      <section className="uvHeroSlider" aria-label="UV Printed highlights">
        <div className="uvHeroSlide container" style={{ '--uv-accent': slide.accent }}>
          <div className="uvHeroImage"><img src={slide.image} alt={slide.title} /></div>
          <div className="uvHeroCopy">
            <span className="uvSlideCount">0{activeSlide + 1} / 0{SLIDES.length}</span>
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
            <div className="uvSliderControls">
              <button type="button" onClick={() => goTo(activeSlide - 1)} aria-label="Previous UV highlight"><ArrowLeft size={18} /></button>
              <div className="uvDots">{SLIDES.map((item, index) => <button key={item.image} type="button" className={index === activeSlide ? 'active' : ''} onClick={() => goTo(index)} aria-label={`Show UV highlight ${index + 1}`} />)}</div>
              <button type="button" onClick={() => goTo(activeSlide + 1)} aria-label="Next UV highlight"><ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="uvProductsSection container" aria-labelledby="uv-products-title">
        <div className="sectionHead">
          <div><small>SHOP THE COLLECTION</small><h2 id="uv-products-title">UV Printed Neon Signs</h2><p>Only products assigned to the WooCommerce UV Printed category appear here.</p></div>
        </div>
        {productsLoading && <div className="uvProductState">Loading UV Printed products...</div>}
        {!productsLoading && productsError && <div className="uvProductState error">{productsError}</div>}
        {!productsLoading && !productsError && products.length === 0 && <div className="uvProductState">No UV Printed products are available yet.</div>}
        {!productsLoading && !productsError && products.length > 0 && <div className="uvProductGrid">{products.map((product) => <UvProductCard key={product[6] || product[0]} product={product} />)}</div>}
      </section>
    </main>
  );
}
