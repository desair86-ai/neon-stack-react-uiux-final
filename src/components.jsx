"use client";
import { WhyWeExist, OurPromise, NeonStackDifference, WhatDrivesUs } from './AboutSections';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getProducts, getCategories } from "./lib/api";
import { useWishlist } from "./context/WishlistContext";
import {
  Menu, X, Search, UserRound, ShoppingCart, ChevronDown, ArrowRight, ArrowLeft,
  Sparkles, WandSparkles, Star, Upload, SlidersHorizontal, MessageCircle, ShieldCheck,
  Truck, Heart, Gem, Store, BriefcaseBusiness, Coffee, Martini, Dumbbell, Gift,
  Music2, Baby, Gamepad2, Building2, Home as HomeIcon ,
  MapPin, Phone, Mail, Clock3, Plus, RotateCcw, Undo2, Redo2, Image as ImageIcon,
  Package, Headphones, Leaf, BadgeCheck, Zap, Palette, PenTool, Box, ChevronRight, Lightbulb,
  Rocket, Music, ShoppingBag, HelpCircle
, Moon, Crown, Smile, Monitor, Sun, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import './styles.css';

const img = (id, w=1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const rooms = {
  hero: 'website_banner_01.webp',
  living: '/images/better_together.webp',
  gaming: '/images/jeep_led_neon_sign.webp',
  office: '/images/whats_in_the_box.webp',
  cafe: '/images/pizza_and_drink.webp',
  bedroom: '/images/astro_with_moon.webp',
  studio: '/images/remote_details_01.webp',
  party: '/images/wings_and_drinks.webp',
};

const categories = [
  ['Home Decor','HomeIcon'],['Gaming','Gamepad2'],['Business','Building2'],['Café & Restaurant','Coffee'],
  ['Bar & Nightlife','Martini'],['Events & Weddings','Heart'],['Fitness & Sports','Dumbbell']
];
const defaultProducts = [
  ['Gaming Controller','Gaming','/images/1.webp','','1,499'],['Astronaut On Moon','Astronaut & Space','/images/astro_with_full_moon.webp','','1,999'],
  ['Good Vibes Only','Quotes','/images/2.webp','','1,199'],['Coffee Time','Café & Restaurant','/images/3.webp','','1,399'],
  ['Rahul','Custom Neon','/images/4.webp','','1,599'],['Love You','Love & Romance','/images/5.webp','','1,199'],
  ['Buddha','Gods & Spiritual','/images/6.webp','','1,799'],['Google Logo','Business','/images/7.webp','','2,499'],
  ['Game Room','Gaming','/images/8.webp','MOJO MIX','1,899'],['Motorcycle','Motorbikes','/images/9.webp','','1,999'],
  ['Hakuna Matata','Quotes','/images/10.webp','','1,399'],['Cocktail','Bars','/images/wings_and_drinks.webp','','1,599']
];

function useCatalogData(categorySlug = null) {
  const [data, setData] = useState({ items: defaultProducts, maxPrice: 24999, sizes: ['Up to 12 inch (52)','12 - 24 inch (97)','24 - 36 inch (63)','36 inch & above (36)'] });
  useEffect(() => {
    getProducts(categorySlug).then(fetched => {
      if (fetched && fetched.items && fetched.items.length > 0) {
        setData(fetched);
      } else if (fetched && fetched.items) {
        setData(fetched);
      }
    }).catch(console.error);
  }, [categorySlug]);
  return data;
}

function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);
  return categories;
}
const allCategories = ['All Neon Signs','Astronaut & Space','Bars','Beauty & Salon','Bollywood','Business','Café & Restaurant','Cricket','Gaming','Gods & Spiritual','Home Decor','Kids','Love & Romance','Music & Studio','Sports & Fitness','Quotes & Words'];

function Logo(){ return <Link className="logo" href="/"><img src="/images/The Neon Stack Logo without icon.svg" alt="The Neon Stack" style={{height:'72px', filter:'drop-shadow(0 0 2px rgba(139,76,255,0.4))'}} className="svg-flicker"/></Link> }
function Announcement(){ return <div className="announce"><Zap/> <span>SALE ENDS IN</span> <b>02d : 12h : 45m : 30s</b><i/> <span>Free Shipping Across India</span></div> }

import { InfiniteTicker } from './InfiniteTicker';

export function Header(){
    const pathname = usePathname();
    const { wishlist } = useWishlist() || { wishlist: [] };
    const [cartCount, setCartCount] = useState(0);
    const [mobile,setMobile]=useState(false); const [shop,setShop]=useState(false);
    const shopActive = pathname.startsWith('/collections') || pathname.startsWith('/category');
    const isConfigurator = pathname === '/custom-neon' || pathname === '/mojo-mix';
    
    useEffect(() => {
      const updateCount = () => {
        try {
          const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
          const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
          setCartCount(count);
        } catch(e){}
      };
      updateCount();
      window.addEventListener('cartUpdated', updateCount);
      return () => window.removeEventListener('cartUpdated', updateCount);
    }, []);

    return <div className={`header-wrapper ${isConfigurator ? 'configurator-header-wrapper' : ''}`} onMouseLeave={() => setShop(false)}>
      {!isConfigurator && <Announcement/>}
      <header className={`header ${isConfigurator ? 'force-mobile-header' : ''}`}>
        <button className="mobileOnly iconBtn" onClick={()=>setMobile(true)}><Menu/></button>
        <div onMouseEnter={()=>setShop(false)}><Logo/></div>
        <nav className="desktopNav">
          <Link href="/" className={pathname === '/' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Home</Link>
          <button className={shopActive?'active':''} onMouseEnter={()=>setShop(true)} onClick={()=>setShop(v=>!v)}>Shop <ChevronDown/></button>
          <Link href="/custom-neon" className={pathname === '/custom-neon' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Custom Neon</Link>
          <Link href="/mojo-mix" className={pathname === '/mojo-mix' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Mojo Mix</Link>
          <Link href="/uv-printed" className={pathname === '/uv-printed' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>UV Printed</Link>
          <Link href="/category/business" className={pathname === '/category/business' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Business</Link>
          <Link href="/about" className={pathname === '/about' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>About Us</Link>
          <Link href="/blogs" className={pathname === '/blogs' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Blogs</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'active' : ''} onMouseEnter={()=>setShop(false)}>Contact</Link>
        </nav>
        <div className="headerActions" onMouseEnter={()=>setShop(false)}>
          <button><Search/></button>
          <Link href="/account" className={`account ${pathname.startsWith('/account') && pathname !== '/account/wishlist' ? 'active' : ''}`}><UserRound/></Link>
          <Link href="/account/wishlist" className={pathname === '/account/wishlist' ? 'active' : ''} style={{position:'relative'}}><Heart/>{wishlist?.length > 0 && <span style={{position:'absolute',top:-8,right:-8,background:'#ff65bf',color:'#fff',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'bold'}}>{wishlist.length}</span>}</Link>
          <Link href="/cart" className={pathname === '/cart' ? 'active' : ''} style={{position:'relative'}}><ShoppingCart/>{cartCount > 0 && <span style={{position:'absolute',top:-8,right:-8,background:'#00ffbc',color:'#000',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'bold'}}>{cartCount}</span>}</Link>
        </div>
      </header>
      {shop && <MegaMenu close={()=>setShop(false)}/>} 
      {mobile && <MobileMenu close={()=>setMobile(false)}/>} 
    </div>
  }

function MegaMenu({ close }) {
  const categories = useCategories();
  const [activeCat, setActiveCat] = useState(null);

  const displayCat = activeCat || categories[0];
  const subCategories = displayCat?.children?.nodes || [];

  return <div className="megaMenu" onMouseLeave={() => setActiveCat(null)}>
    <div className="megaCol">
      <h4>SHOP BY CATEGORY</h4>
      {categories.map((c, i) => (
        <Link 
          key={c.id} 
          className={displayCat?.id === c.id ? "megaActive" : ""} 
          href={"/category/" + c.slug}
          onMouseEnter={() => setActiveCat(c)}
          onClick={close}
        >
          <Star/><span>{c.name}</span><ArrowRight/>
        </Link>
      ))}
      {categories.length === 0 && <p style={{fontSize: "12px", color: "var(--muted)"}}>Loading...</p>}
    </div>
    <div className="megaCol collections">
      <h4>{displayCat ? displayCat.name.toUpperCase() : "POPULAR COLLECTIONS"}</h4>
      <div className="megaGrid">
        {subCategories.length > 0 ? subCategories.map((sub) => (
          <Link href={"/category/" + sub.slug} key={sub.id} onClick={close}>
            {sub.image?.sourceUrl ? (
                <img src={sub.image.sourceUrl} alt={sub.name} className="miniPic" style={{objectFit: 'cover'}} />
              ) : (
                <div className="miniPic" style={{backgroundColor: "#111"}}>
                  <span style={{fontSize:"11px"}}>{sub.name.substring(0, 8)}</span>
                </div>
              )}
            <b>{sub.name}</b>
          </Link>
        )) : (
          <p style={{fontSize: "12px", color: "var(--muted)", gridColumn: "1/-1"}}>No subcategories found.</p>
        )}
      </div>
    </div>
    <div className="megaPromo">
      <h2>Can’t find what<br/>you’re looking for?</h2>
      <p>Create your own neon sign<br/>in minutes.</p>
      <Link className="btn primary" href="/custom-neon" onClick={close}>CUSTOMIZE NOW <ArrowRight/></Link>
      <div className="neonBulb">
        <svg width="0" height="0">
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#752eff" offset="0%" />
            <stop stopColor="#00ffbc" offset="100%" />
          </linearGradient>
        </svg>
        <svg viewBox="0 0 512 512" width="220" height="220" fill="none" stroke="url(#neonGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" style={{opacity: 1, filter: 'drop-shadow(0 0 4px rgba(117,46,255,0.8)) drop-shadow(0 0 8px rgba(0,255,188,0.8))', transform: 'rotate(5deg)'}}>
          <path d="M256 464c-18.1 0-32-13.9-32-32h64c0 18.1-13.9 32-32 32zM288 400H224v16h64v-16zM388.7 187.3c0 74.3-51.2 110.1-68.7 136.7-6 9.1-11 18.1-12.7 28H204.7c-1.7-9.9-6.8-18.9-12.7-28-17.5-26.6-68.7-62.4-68.7-136.7 0-74.3 60.1-139.3 132.7-139.3 72.6 0 132.7 65 132.7 139.3z" />
        </svg>
      </div>
    </div>
    <div className="megaBenefits">
      <Benefit icon={<Gem/>} title="Premium Quality" text="Built to last"/>
      <Benefit icon={<ShieldCheck/>} title="Safe & Durable" text="Low voltage, high safety"/>
      <Benefit icon={<Leaf/>} title="Made in India" text="Proudly handcrafted"/>
      <Benefit icon={<Truck/>} title="Fast Delivery" text="Quick & reliable"/>
      <Benefit icon={<BadgeCheck/>} title="1 Year Warranty" text="We've got you covered"/>
    </div>
  </div>
}
export function MobileMenu({ close, onMouseLeave }) { 
  const [shopOpen, setShopOpen] = useState(false);
  const [colOpen, setColOpen] = useState(false);
  const categories = useCategories();
  
  return (
    <div className="mobileMenu" onMouseLeave={onMouseLeave}>
      <div className="mobileMenuTop">
        <Logo/>
        <button className="iconBtn" onClick={close}><X/></button>
      </div>
      <div className="mobileLinks">
        <Link href="/" onClick={close}> HOME <ChevronRight/></Link>
        <div className="mobAccordion">
          <button className="mobAccBtn" onClick={() => setShopOpen(!shopOpen)}>
            <span><ShoppingBag/> SHOP</span> <ChevronDown style={{transform: shopOpen ? 'rotate(180deg)' : 'none', transition: '0.2s'}}/>
          </button>
          {shopOpen && (
            <div className="mobAccContent">
              <Link href="/collections" onClick={close}><Sparkles/> All Neon Signs <ChevronRight/></Link>
              
              <button className="mobAccBtn" style={{padding: '15px 20px', border: 'none', background: 'transparent', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontSize: '15px', textTransform: 'none'}} onClick={(e) => { e.preventDefault(); setColOpen(!colOpen); }}>
                <span style={{display: 'flex', alignItems: 'center', gap: '15px'}}><Star style={{width:'20px', height:'20px', color:'#752eff'}}/> Collections</span> 
                <ChevronDown style={{transform: colOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', width: '14px', color:'#555'}}/>
              </button>
              {colOpen && categories.map((c) => (
                <Link key={c.id} href={"/category/" + c.slug} onClick={close} style={{paddingLeft: '50px'}}>
                   {c.name} <ChevronRight/>
                </Link>
              ))}

              <Link href="/custom-neon" onClick={close}><Rocket/> Custom Neon <ChevronRight/></Link>
              <Link href="/mojo-mix" onClick={close}><Music/> Mojo Mix <ChevronRight/></Link>
              <Link href="/uv-printed" onClick={close}><Zap/> UV Printed Neon <ChevronRight/></Link>
              <Link href="/category/business" onClick={close}><BriefcaseBusiness/> Business / Logos <ChevronRight/></Link>
            </div>
          )}
        </div>
        <Link href="/about" onClick={close}>ABOUT US <ChevronRight/></Link>
        <Link href="/blogs" onClick={close}>BLOGS <ChevronRight/></Link>
        <Link href="/contact" onClick={close}>CONTACT <ChevronRight/></Link>
      </div>
      <div className="mobileMenuBottom">
        <Link href="/custom-neon" onClick={close}>Create Your Custom Neon <ArrowRight/></Link>
        <p>Free Shipping Across India</p>
      </div>
    </div>
  );
}
function Benefit({icon,title,text}){return <div className="benefit"><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></div>}
function CTA({title='YOUR IDEA DESERVES TO GLOW.',text="Let's create something amazing together."}){return <section className="ctaBand container"><div><Sparkles/><div><h3>{title}</h3><p>{text}</p></div></div><Link className="btn primary" href="/custom-neon">CREATE YOUR NEON <ArrowRight/></Link></section>}
export function Footer() {
  return (
    <footer>
      {/* DESKTOP FOOTER */}
      <div className="desktopFooter">
        <div className="footerMain container" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', paddingBottom: '30px' }}>
          <div className="footerBrand">
            <Logo />
            <p style={{ marginTop: '20px', fontSize: '15px', color: '#b8bfd8', lineHeight: '1.6' }}>
              Premium LED neon signs<br />handcrafted in India to light<br />up your space and your story.
            </p>
            <div className="deskSocial">
              <Social />
            </div>
          </div>
          <div className="footerCol">
            <h4>SHOP</h4>
            {['All Neon Signs', 'Custom Neon Sign', 'Mojo Mix Signs', 'UV Printed Neon', 'Business Logo Signs', 'Accessories'].map(l => <Link key={l} href="/collections">{l}</Link>)}
          </div>
          <div className="footerCol">
            <h4>CUSTOMER CARE</h4>
            {['Track Your Order', 'Shipping & Delivery', 'Returns & Refunds', "FAQ's", 'Care Instructions', 'Contact Us'].map(l => <Link key={l} href="/contact">{l}</Link>)}
          </div>
          <div className="footerCol">
            <h4>COMPANY</h4>
            {['About Us', 'Our Process', 'Blogs', 'Reviews', 'Careers', 'Bulk Orders'].map(l => <Link key={l} href="/about">{l}</Link>)}
          </div>
          <div className="footerContact">
            <h4>CONTACT US</h4>
            <p><Phone /> +91 98765 43210</p>
            <p><Mail /> hello@neonstack.in</p>
            <p><MapPin /> S No. 123, Creative Street,<br />Wakad, Pune - 411057,<br />Maharashtra, India</p>
          </div>
        </div>
        <div className="footerBottom container" style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
          <span>© 2024 Neon Stack. All rights reserved.</span>
          <span><Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link> | <Link href="/terms-and-conditions" style={{ color: "inherit", textDecoration: "none" }}>Terms & Conditions</Link> | <Link href="/shipping-policy" style={{ color: "inherit", textDecoration: "none" }}>Shipping Policy</Link></span>
        </div>
      </div>

      {/* MOBILE FOOTER */}
      <div className="mobileFooter">
        <div className="footerMain container">
          <div className="footerBrand">
            <Logo />
            <p>Premium custom neon signs<br />handcrafted with care in India.</p>
            <Social />
            <div className="footerChat">
              
              <div>
                <b>Need Help Designing?</b>
                <small>Chat with our experts for free support.</small>
              </div>
              <a href="https://wa.me/919876543210" className="chatBtn">
                CHAT WITH US
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            </div>
          </div>
          <FooterCol title="HELP & SUPPORT" links={['Contact Us', 'Shipping & Delivery', 'Returns & Warranty', "FAQs", 'Track Order', 'Care Instructions']} />
          <FooterCol title="SHOP" links={['All Neon Signs', 'Custom Neon', 'Mojo Mix', 'UV Printed Neon', 'Collections', 'Business / Logos']} />
          <FooterCol title="COMPANY" links={['About Us', 'Our Materials', 'Blogs', 'Careers']} />
        </div>
        <div className="footerBenefits container">
          <Benefit icon={<ShieldCheck />} title="Secure Payments" text="100% safe & secure" />
          <Benefit icon={<Truck />} title="Pan India Delivery" text="Fast & reliable" />
          <Benefit icon={<BadgeCheck />} title="1 Year Warranty" text="On all neon signs" />
          <Benefit icon={<RotateCcw />} title="Easy Returns" text="Hassle free" />
        </div>
        <div className="footerSubscribe container">
          <div>
            <WandSparkles />
            <div>
              <h3>Not sure what to create?</h3>
              <p>Get inspired from our bestsellers.</p>
            </div>
          </div>
          <div>
            <Link href="/collections" className="btn ghost">EXPLORE IDEAS <ArrowRight /></Link>
          </div>
        </div>
        <div className="footerBottom container">
          <span>© 2026 Neon Stack. All Rights Reserved.</span>
          <span>Made with love in India 🇮🇳</span>
          <button className="upBtn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ArrowLeft style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({title, links}) {
  const [open, setOpen] = useState(false);
  const Icon = title === 'SHOP' ? ShoppingBag : title === 'COMPANY' ? Building2 : HelpCircle;
  return (
    <div className={`footerCol ${open ? 'open' : ''}`}>
      <h4 onClick={() => setOpen(!open)}>
        <span className="mobOnlyTitle"><Icon/> {title}</span>
        <span className="deskOnlyTitle">{title}</span>
        <ChevronDown className="mobOnly" style={{transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s'}} />
      </h4>
      <div className="colLinks">
        {links.map(x=><Link key={x} href={x==='All Neon Signs'?'/collections':x==='About Us'?'/about':x==='Contact Us'?'/contact':x==='Shipping & Delivery'?'/shipping-policy':'/collections'}><ChevronRight className="mobOnly" /> {x}</Link>)}
      </div>
    </div>
  );
}
function Social(){
  return (
    <div className="social">
      <a href="#" aria-label="Instagram" className="soc-ig">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" style={{ color: "#c13584" }} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
      </a>
      <a href="#" aria-label="Facebook" className="soc-fb">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" style={{ color: "#1877f2" }} viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
      </a>
      <a href="#" aria-label="YouTube" className="soc-yt">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" style={{ color: "#ff0000" }} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
      </a>
      <a href="#" aria-label="LinkedIn" className="soc-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor" style={{ color: "#0077b5" }} viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>
      </a>
    </div>
  );
}

export function Home(){
  const { items: products } = useCatalogData();
  return <><Header/><main>
    <section className="homeHero" style={{ padding: 0, minHeight: 'auto', background: 'transparent', display: 'block' }}>
      <Link href="/collections" style={{ display: 'block' }}>
        <img src="/images/hero banner.webp" alt="Launch Offer - Shop Now" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </Link>
    </section>
    <InfiniteTicker />
  <section className="section container"><SectionHead eyebrow="SHOP BY SPACE" title="Find the perfect neon for every space & occasion." link="VIEW ALL COLLECTIONS"/><div className="spaceTiles">{categories.map(([n,ic],i)=>{const I=iconByName(ic); return <Link key={n} href={`/category/${slug(n)}`} className="spaceTile" style={{"--tile-delay":`${i * 40}ms`}}><span className="spaceIcon"><I/></span><b>{n}</b></Link>})}</div></section>
  <section className="section darkSection"><div className="container"><SectionHead eyebrow="OUR SPECIAL NEON SIGNS" title="Signature neon technologies." sub="Explore the ways Neon Stack can make your space glow."/><div className="specialGrid"><Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork." action="CUSTOMIZE NOW" bg="/images/better_together.webp" /><Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200+ effects, music sync & app control." action="EXPLORE MOJO" bg="/images/mojomix.webp" /><Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish." action="EXPLORE UV" bg="/images/UVneon.webp" /></div></div></section>
  <section className="section container"><SectionHead eyebrow="BESTSELLERS" title="Neon signs people love." link="SHOP ALL"/><div className="productStrip">{products.slice(0,6).map(p=><ProductCard key={p[0]} p={p}/>)}</div></section>
  <section className="why"><div className="container"><SectionHead eyebrow="WHY CHOOSE NEON STACK?" title="Built for glow. Designed to last."/><div className="whyGrid"><Benefit icon={<Store/>} title="Made in India" text="Proudly designed & handcrafted locally."/><Benefit icon={<WandSparkles/>} title="Custom Made" text="Your text, logo or idea brought to life."/><Benefit icon={<Gem/>} title="Premium Quality" text="High grade LED neon & materials."/><Benefit icon={<Heart/>} title="Safe & Durable" text="Low voltage, energy efficient & long lasting."/><Benefit icon={<Headphones/>} title="Premium Support" text="We're here for your experience."/></div></div></section>
  <section className="section container realGlow"><div className="realCopy"><small>REAL SPACES. REAL GLOW.</small><h2>See how Neon Stack lights up beautiful spaces.</h2><p>From living rooms to gaming setups, discover signs in their natural environment.</p><Link className="textLink" href="/collections">SEE MORE INSTALLATIONS <ArrowRight/></Link></div><div className="installGrid">{[rooms.living,rooms.gaming,rooms.party,rooms.cafe].map((r,i)=><div key={i} className="install" style={{backgroundImage:`url(${r})`}}></div>)}</div></section>
  
  <section className="mojoSection" style={{backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 30%, transparent 50%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%), url('/images/mojo_bg_clean.webp')", backgroundSize: 'cover', backgroundPosition: 'center'}}><div className="container mojoLayout"><div><small>MEET MOJO MIX</small><h2>Neon that<br/><em>moves.</em></h2><p>200+ Flow Effects • Music Sync • App Control • Unlimited Colors</p><Link className="btn primary" href="/mojo-mix">EXPLORE MOJO MIX <ArrowRight/></Link></div><div className="mojoVisual"><img src="/images/mascot-image.png" alt="Mascot" className="mojoMascot" style={{height: '340px', width: 'auto', objectFit: 'contain'}} /></div></div></section>
  <section className="section container howBox"><div className="howGrid" style={{display: 'flex', flexDirection: 'column', gap: '80px'}}><div><SectionHead eyebrow="HOW IT WORKS" title="From idea to glow."/><div className="steps" style={{border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'}}>{[['01','Share Your Idea','Send your text, logo or reference.', MessageCircle],['02','Get Your Mockup','We create a design & share it with you.', Palette],['03','Approve & We Craft','Once approved, we start crafting.', Sparkles],['04','Safe Delivery','Carefully packed & delivered to you.', Truck]].map(([n,t,d,Icon], i)=><React.Fragment key={n}><div className="step" style={{border: 'none', padding: '0', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{width: '60px', height: '60px', border: '2px solid #00ffbc', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00ffbc', boxShadow: '0 0 15px #00ffbc55', marginBottom: '20px'}}><Icon size={20} /> <b style={{fontSize: '14px', marginTop: '4px'}}>{n}</b></div><h3 style={{margin: '0 0 10px', fontSize: '15px', whiteSpace: 'nowrap'}}>{t}</h3><p style={{margin: 0, fontSize: '14px'}}>{d}</p></div>{i < 3 && <ArrowRight size={24} color="#00ffbc" style={{flexShrink: 0}} />}</React.Fragment>)}</div></div><div className="boxContents"><SectionHead eyebrow="WHAT’S IN THE BOX" title="Everything you need to unbox, install & glow."/><div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap'}}><img src="/images/whats_in_the_box.webp" alt="What's in the box" style={{width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '12px'}} /><img src="/images/remote_details_01.webp" alt="Remote Details" style={{width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '12px'}} /></div></div></div></section>
  <section className="trustCTA container"><div className="customerProof"><h3>THOUSANDS OF HAPPY CUSTOMERS</h3><p>Trusted by 20,000+ customers across India.</p><div className="stars">⭐⭐⭐⭐⭐ <b>4.9/5</b></div><small>From 2,500+ Reviews</small></div><CTA/></section>
</main><Footer/></>}
function BoxItem({icon,text}){return <div><span>{icon}</span><b>{text}</b></div>}
function Special({title,text,action,bg,linkTo}){return <article className="special"><img className="specialImage" src={bg} alt=""/><div className="specialCopy"><h3>{title}</h3><p>{text}</p><Link className="btn ghost" href={linkTo || "#"}>{action} <ArrowRight/></Link></div></article>}
function SectionHead({eyebrow,title,sub,link}){return <div className="sectionHead"><div><small>{eyebrow}</small><h2>{title}</h2>{sub&&<p>{sub}</p>}</div>{link&&<Link className="textLink" href="/collections">{link} <ArrowRight/></Link>}</div>}
function NeonText({lines,colors=['pink','blue','pink']}){return <div className="neonText">{lines.map((x,i)=><span key={x} className={colors[i%colors.length]}>{x}</span>)}</div>}
function ProductCard({p}){
  const { toggleWishlist, isInWishlist } = useWishlist() || {};
  const inWishlist = isInWishlist ? isInWishlist(p[0]) : false;
  return <div className="productCard" onClick={() => window.location.href='/collections'} style={{cursor: 'pointer'}}><div className="productImg" style={{backgroundImage:`url("${p[2]}")`}}>{p[3] && p[3].trim() !== '' ? <span className="badge">{p[3]}</span> : null}<button onClick={e=>{e.preventDefault(); e.stopPropagation(); if(!localStorage.getItem('is_logged_in')){ window.location.href='/login'; return; } if(toggleWishlist) toggleWishlist({id:Date.now(), name: p[0], price: p[4], image: p[2], type: p[1]});}}><Heart fill={inWishlist ? "#ff65bf" : "none"} color={inWishlist ? "#ff65bf" : "currentColor"}/></button></div><div className="productInfo"><h3>{p[0]}</h3><small>{p[1]}</small><div><b>From ₹{p[4]}</b><button onClick={(e)=>{e.preventDefault(); e.stopPropagation(); try { const cart = JSON.parse(localStorage.getItem('ns_cart')||'[]'); const existing = cart.find(x => x.name === p[0] && x.type === p[1]); if(existing) { existing.qty = (existing.qty || 1) + 1; } else { const item = {id:Date.now(), name: p[0], type: p[1], price: p[4], image: p[2], qty: 1}; cart.push(item); } localStorage.setItem('ns_cart',JSON.stringify(cart)); window.dispatchEvent(new Event('cartUpdated')); }catch(err){}}} style={{background:'transparent',border:'1.5px solid #752eff',borderRadius:'50%',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',cursor:'pointer'}}><ShoppingCart size={18} /></button></div></div></div>
}

export function Collections(){return <><Header/><main className="catalogPage"><section className="catalogHero container" style={{'--bg':`url(${rooms.hero})`}}><div><div className="crumb">Home <ChevronRight/> All Collections</div><h1>ALL <em>NEON</em> SIGNS</h1><p>Discover our complete collection of premium LED neon signs for every space, mood and occasion.</p><div className="heroIcons"><Benefit icon={<Gem/>} title="Made in India" text=""/><Benefit icon={<Heart/>} title="Premium Quality" text=""/><Benefit icon={<WandSparkles/>} title="Custom Made" text=""/><Benefit icon={<ShieldCheck/>} title="Safe & Durable" text=""/></div></div></section><InfiniteTicker /><div className="container collectionFeature"><Feature title="Custom Neon Signs" text="Make it yours." icon={<WandSparkles/>}/><Feature title="Mojo Mix Signs" text="Dynamic. Colorful. Alive." icon={<Sparkles/>}/><Feature title="UV Printed Neon" text="Detailed. Vibrant. Stunning." icon={<Palette/>}/><Feature title="Business Logo Signs" text="Stand out. Get noticed." icon={<BriefcaseBusiness/>}/></div><CatalogGrid/></main><Footer/></>}
function Feature({title,text,icon}){return <div><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></div>}

function CatalogCTA() {
  return (
    <div className="catalogCTA">
      <div className="ctaLeft">
        <Rocket className="ctaIcon" />
        <div className="ctaText">
          <h3>CAN'T FIND WHAT YOU'RE LOOKING FOR?</h3>
          <p>We can create any neon sign you imagine.</p>
        </div>
      </div>
      <Link href="/custom-neon" className="btn ctaBtn">CREATE YOUR CUSTOM NEON <ArrowRight/></Link>
    </div>
  );
}

function CatalogGrid({ category = null }) {
    const [filterOpen,setFilterOpen]=useState(false);
    const { items: products, maxPrice, sizes } = useCatalogData(category);
    const categories = useCategories();
    const categoryNames = categories.map(c => c.name);

    return <section className="catalogGrid container"><button className="mobileFilter" onClick={()=>setFilterOpen(v=>!v)}><SlidersHorizontal/> FILTER BY <ChevronDown/></button><aside className={filterOpen?'show':''}><div className="filterHead"><b>FILTER BY</b><button>CLEAR ALL</button></div><Filter title="CATEGORIES" items={categoryNames.length > 0 ? categoryNames : allCategories.slice(0,12)}/><Filter title="PRICE RANGE" isRange={true} rangeMin={499} rangeMax={maxPrice || 24999}/><Filter title="SIZE" items={sizes.length > 0 ? sizes : ['Up to 12 inch (52)','12 - 24 inch (97)','24 - 36 inch (63)','36 inch & above (36)']}/><Filter title="TYPE" items={['Standard LED (168)','Mojo Mix (42)','UV Printed (28)']}/><button className="clearBtn">CLEAR FILTERS</button></aside><div className="catalogResults"><div className="resultTools"><span>Showing 1-{Math.min(24, products.length)} of {products.length} products</span><select><option>Sort by: Featured</option><option>Price: Low to High</option></select><button><GridIcon/></button><button><Menu/></button></div><div className="catalogProducts">{products.map(p=><ProductCard key={p[0]} p={p}/>)}</div>{Math.ceil(products.length / 24) > 1 && <div className="pagination"><button><ArrowLeft/></button><b>1</b>{Array.from({length: Math.min(3, Math.ceil(products.length / 24) - 1)}).map((_, i) => <span key={i}>{i+2}</span>)}{Math.ceil(products.length / 24) > 4 && <span>.</span>}{Math.ceil(products.length / 24) > 4 && <span>{Math.ceil(products.length / 24)}</span>}<button><ArrowRight/></button></div>}<CatalogCTA/></div></section>
}

function Filter({title, items, isRange, rangeMin, rangeMax}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filter">
      <div onClick={() => setOpen(!open)} style={{cursor: 'pointer'}}>
        <b>{title}</b><ChevronDown style={{transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s'}}/>
      </div>
      {open && (
        isRange ? (
          <div className="range"><i/><span>₹{rangeMin}</span><span>₹{rangeMax.toLocaleString()}</span></div>
        ) : (
          items?.map(x => <label key={x}><input type="checkbox"/> {x}</label>)
        )
      )}
    </div>
  );
}

function GridIcon(){return <span className="gridIcon"><i/><i/><i/><i/></span>}

export function Category({name}){const params=useParams(); name=name||params.name?.replaceAll('-',' ')||'Gaming'; const key=name.toLowerCase();const bg=key.includes('gaming')?rooms.gaming:key.includes('business')?rooms.office:key.includes('cafe')?rooms.cafe:key.includes('home')?rooms.living:rooms.party;return <><Header/><main className="categoryPage"><section className="catHero container" style={{'--bg':`url(${bg})`}}><div><div className="crumb">Home <ChevronRight/> All Collections <ChevronRight/> {name} Neon Signs</div><h1>{name.toUpperCase()}<br/><em>NEON SIGNS</em></h1><p>Level up your {name.toLowerCase()} with premium neon signs. Perfect for your space, your vibe and your story.</p><div className="catProof"><Benefit icon={<Gem/>} title="Premium LED Neon" text="Bright, safe & energy efficient"/><Benefit icon={<Sparkles/>} title="Made for You" text="Designed to match your vibe"/></div></div></section><InfiniteTicker /><div className="container catTabs">{['All Gaming','Controllers','Console','PC Setup','Characters','Quotes','Anime','More'].map((x,i)=><Link key={x} href="#" className={i===0?'active':''}><Gamepad2/><b>{x}</b></Link>)}</div><CatalogGrid category={params.name}/></main><Footer/></>}

const FONTS = [{ name: 'Neon Script', class: 'font-neon-script' }, { name: 'Arista Pro', class: 'font-arista' }, { name: 'Dreamy', class: 'font-dreamy' }];
const COLORS = [{ name: 'pink', hex: '#ff00ff', glow: '255,0,255' }, { name: 'cyan', hex: '#00ffff', glow: '0,255,255' }, { name: 'yellow', hex: '#ffff00', glow: '255,255,0' }, { name: 'green', hex: '#00ff00', glow: '0,255,0' }, { name: 'red', hex: '#ff0000', glow: '255,0,0' }, { name: 'white', hex: '#ffffff', glow: '255,255,255' }];
const SHAPES = [{ id: 'heart', icon: '❤️' }, { id: 'star', icon: '⭐' }, { id: 'moon', icon: '🌙' }, { id: 'lightning', icon: '⚡' }, { id: 'crown', icon: '👑' }, { id: 'music', icon: '🎵' }];
export function CustomNeon({ type = 'custom_neon' }) {
  const isMojo = type === 'mojo_mix';
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // TEXT
  const [text, setText] = useState('Good Vibes Only');
  const [textAlign, setTextAlign] = useState('center');
  const [activeFont, setActiveFont] = useState({ name: 'Neon Script', class: 'font-neon-script' });
  const [color, setColor] = useState({ name: 'pink', hex: '#ff00ff', glow: '255,0,255' });
  const [isMultiColor, setIsMultiColor] = useState(false);
  const [letterColors, setLetterColors] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  
  // SHAPES
  const [addedShapes, setAddedShapes] = useState([]); 
  
  // BACKBOARD & HARDWARE
  const [backboard, setBackboard] = useState(null);
  const [hardware, setHardware] = useState(null);

  // PREVIEW
  const [bg, setBg] = useState('/images/hero_living.webp');
  const [bgType, setBgType] = useState('preset'); // 'preset', 'custom'
  const [bgMood, setBgMood] = useState('night'); 
  
  // CALIBRATION
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationInches, setCalibrationInches] = useState('50');
  const [calibrationRatio, setCalibrationRatio] = useState(null);
  const [calibrationLineWidth, setCalibrationLineWidth] = useState(300);

  const [activeTab, setActiveTab] = useState('text');
  
  useEffect(() => {
    import('./lib/api').then(({ getConfiguratorOptions }) => {
      getConfiguratorOptions(type).then(data => {
        if (!data || !data.options) throw new Error("No data returned");
        setConfig(data);
        if (data?.options?.colors?.length > 0) setColor(data.options.colors[0]);
        if (data?.fonts?.length > 0) setActiveFont(data.fonts[0]);
        if (data?.options?.sizes?.length > 0) setSelectedSize(data.options.sizes[0]);
        if (data?.options?.backboards?.length > 0) setBackboard(data.options.backboards[0]);
        if (data?.options?.hardware?.length > 0) setHardware(data.options.hardware[0]);
        setLoading(false);
      }).catch(e => {
        console.error("WP API fallback", e);
        const fb = {
          options: {
            sizes: [{ id: 'small', name: 'Small', price: 1499 }, { id: 'medium', name: 'Medium', price: 3499 }, { id: 'large', name: 'Large', price: 5499 }],
            colors: COLORS,
            backboards: [{ id: 'cut', name: 'Cut to Shape', price: 0 }, { id: 'none', name: 'No Backboard', price: 1000 }],
            hardware: [{ id: 'screws', name: 'Screws', price: 0 }, { id: 'stand', name: 'Stand', price: 800 }],
            shapes: SHAPES
          },
          fonts: FONTS
        };
        setConfig(fb);
        setSelectedSize(fb.options.sizes[1]);
        setBackboard(fb.options.backboards[0]);
        setHardware(fb.options.hardware[0]);
        setLoading(false);
      });
    });
  }, [type]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBg(url);
      setBgType('custom');
      setIsCalibrating(true);
      setCalibrationRatio(null);
    }
  };

  const getPrice = () => {
    let base = 0;
    if (selectedSize) base += selectedSize.price || 0;
    if (backboard) base += backboard.price || 0;
    if (hardware) base += hardware.price || 0;
    addedShapes.forEach(s => base += s.price || 300);
    return base.toLocaleString('en-IN');
  };

  if (loading) return <><Header/><main style={{padding: '100px', textAlign: 'center'}}>Loading configurator...</main><Footer/></>;

  const activeColors = config?.options?.colors || [];
  const activeFonts = config?.fonts || [];
  const activeSizes = config?.options?.sizes || [];
  const activeBackboards = config?.options?.backboards || [];
  const activeHardware = config?.options?.hardware || [];
  const activeShapes = config?.options?.shapes || [];
  
  const getGlow = (hex) => {
    if(!hex) return '';
    const g = hex.replace('#', '');
    const r = parseInt(g.substring(0,2), 16) || 255;
    const green = parseInt(g.substring(2,4), 16) || 0;
    const b = parseInt(g.substring(4,6), 16) || 255;
    const rgb = `${r},${green},${b}`;
    return `0 0 5px #fff, 0 0 10px #fff, 0 0 20px rgba(${rgb},1), 0 0 40px rgba(${rgb},1), 0 0 80px rgba(${rgb},1)`;
  };

  // Calculate dynamic scale
  let finalScale = (activeSizes.indexOf(selectedSize) + 1) * 0.4 || 1;
  if (bgType === 'custom' && calibrationRatio !== null) {
      const targetWidthPixels = (activeSizes.indexOf(selectedSize) * 20 + 50) * calibrationRatio;
      finalScale = targetWidthPixels / 800; // rough baseline width for text
  }

  return (
    <>
      <Header />
      <style>{`
        .mojo-gradient {
            background: linear-gradient(90deg, #ffde00, #ff7b00, #ff007b, #c400ff, #00d4ff, #ffde00);
            background-size: 200% auto;
            -webkit-background-clip: text;
            color: transparent;
            animation: flowGradient 3s linear infinite;
        }
        @keyframes flowGradient { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        .canvas-mood-night::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 1; }
        .builderTabs button { flex: 1; padding: 15px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--muted); cursor: pointer; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
        .builderTabs button.active { color: #fff; border-bottom-color: #00ffbc; }
        .optionCard { background: #0a0d14; border: 1px solid #1c212e; border-radius: 8px; padding: 15px; cursor: pointer; display: flex; flex-direction: column; gap: 5px; }
        .optionCard.active { border-color: #ff65bf; background: rgba(255, 101, 191, 0.05); }
        .calibrationLine { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-top: 4px dashed #ff0055; z-index: 50; display: flex; align-items: center; justify-content: center; }
        .calibrationKnob { position: absolute; top: -10px; width: 20px; height: 20px; background: #fff; border: 3px solid #ff0055; border-radius: 50%; cursor: ew-resize; }
      `}</style>
      <main className="builderPage">
        <section className="builderHeader">
          <div className="container">
            <div className="crumb">Home <ChevronRight/> {isMojo ? 'Mojo Mix' : 'Custom Neon'}</div>
            <h1>CREATE YOUR <em>{isMojo ? 'MOJO MIX' : 'CUSTOM NEON'}</em> SIGN</h1>
          </div>
        </section>
        
        <section className="container">
          <div className="builderLayout">
            <div className="builderControls">
               <div className="builderTabs" style={{display: 'flex', borderBottom: '1px solid #1c212e', marginBottom: '25px'}}>
                  <button className={activeTab === 'text' ? 'active' : ''} onClick={()=>setActiveTab('text')}>TEXT</button>
                  <button className={activeTab === 'shapes' ? 'active' : ''} onClick={()=>setActiveTab('shapes')}>SHAPES</button>
                  <button className={activeTab === 'backboard' ? 'active' : ''} onClick={()=>setActiveTab('backboard')}>BACKBOARD</button>
                  <button className={activeTab === 'hardware' ? 'active' : ''} onClick={()=>setActiveTab('hardware')}>HARDWARE</button>
               </div>
               <div className="tabContent" style={{maxHeight: '600px', overflowY: 'auto', paddingRight: '10px'}}>
                 {activeTab === 'text' && (
                     <>
                        <div className="controlGroup">
                            <label>YOUR TEXT <span>{text.length}/50</span></label>
                            <textarea value={text} onChange={e=>setText(e.target.value.substring(0, 50))} rows={2} style={{background: '#0a0d14', border: '1px solid #1c212e', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', resize: 'none'}} />
                            <div style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
                               <button onClick={()=>setTextAlign('left')} style={{padding: '5px 10px', background: textAlign==='left'?'#1c212e':'transparent', border: '1px solid #1c212e', borderRadius: '6px', color: '#fff'}}><AlignLeft size={16}/></button>
                               <button onClick={()=>setTextAlign('center')} style={{padding: '5px 10px', background: textAlign==='center'?'#1c212e':'transparent', border: '1px solid #1c212e', borderRadius: '6px', color: '#fff'}}><AlignCenter size={16}/></button>
                               <button onClick={()=>setTextAlign('right')} style={{padding: '5px 10px', background: textAlign==='right'?'#1c212e':'transparent', border: '1px solid #1c212e', borderRadius: '6px', color: '#fff'}}><AlignRight size={16}/></button>
                            </div>
                        </div>
                        <div className="controlGroup">
                            <label>FONT STYLE</label>
                            <select style={{width: '100%', background: '#0a0d14', border: '1px solid #1c212e', color: '#fff', padding: '12px', borderRadius: '8px'}} value={activeFont.name} onChange={e => setActiveFont(activeFonts.find(f => f.name === e.target.value) || activeFonts[0])}>
                                {activeFonts.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                            </select>
                        </div>
                        {!isMojo && (
                            <div className="controlGroup">
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <label>TEXT COLOR</label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '13px'}}><input type="checkbox" checked={isMultiColor} onChange={e=>setIsMultiColor(e.target.checked)} /> Multi-Color</label>
                                </div>
                                <div className="colorGrid" style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginTop: '10px'}}>
                                    {activeColors.map(c => (
                                        <button key={c.name} onClick={() => setColor(c)} style={{width: '35px', height: '35px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: c.hex, boxShadow: color?.name === c.name ? `0 0 0 2px #0a0d14, 0 0 0 4px ${c.hex}` : 'none'}} title={c.name}/>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="controlGroup">
                            <label>SIZE</label>
                            <div style={{display: 'grid', gap: '10px'}}>
                                {activeSizes.map(s => (
                                    <div key={s.id} className={`optionCard ${selectedSize?.id === s.id ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <b>{s.name}</b>
                                            <span>₹{s.price}</span>
                                        </div>
                                        {s.description && <small style={{color: 'var(--muted)'}}>{s.description}</small>}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </>
                 )}
                 {activeTab === 'shapes' && (
                     <div className="controlGroup">
                        <label>ADD SHAPES</label>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'}}>
                            {activeShapes.map(s => (
                                <button key={s.id} onClick={() => setAddedShapes([...addedShapes, { id: Date.now().toString(), type: s.name, price: s.price, color: color?.hex }])} style={{background: '#0a0d14', border: '1px solid #1c212e', borderRadius: '8px', padding: '15px', color: '#fff', fontSize: '16px', cursor: 'pointer'}}>
                                    {s.name}
                                </button>
                            ))}
                        </div>
                        {addedShapes.length > 0 && (
                            <div style={{marginTop: '20px'}}>
                                <label>ADDED SHAPES</label>
                                {addedShapes.map((shape, idx) => (
                                    <div key={shape.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1c212e', borderRadius: '8px', marginBottom: '5px'}}>
                                        <span style={{fontSize: '14px'}}>{shape.type} (+₹{shape.price})</span>
                                        <button onClick={() => setAddedShapes(addedShapes.filter((_, i) => i !== idx))} style={{background: 'transparent', border: 'none', color: '#ff65bf', cursor: 'pointer'}}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                 )}
                 {activeTab === 'backboard' && (
                     <div className="controlGroup" style={{display: 'grid', gap: '15px'}}>
                        {activeBackboards.map(opt => (
                            <div key={opt.id} className={`optionCard ${backboard?.id === opt.id ? 'active' : ''}`} onClick={() => setBackboard(opt)}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <b>{opt.name}</b>
                                    <span>{opt.price > 0 ? `+₹${opt.price}` : 'Free'}</span>
                                </div>
                                {opt.description && <small style={{color: 'var(--muted)'}}>{opt.description}</small>}
                            </div>
                        ))}
                     </div>
                 )}
                 {activeTab === 'hardware' && (
                     <div className="controlGroup" style={{display: 'grid', gap: '15px'}}>
                        {activeHardware.map(opt => (
                            <div key={opt.id} className={`optionCard ${hardware?.id === opt.id ? 'active' : ''}`} onClick={() => setHardware(opt)}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <b>{opt.name}</b>
                                    <span>{opt.price > 0 ? `+₹${opt.price}` : 'Free'}</span>
                                </div>
                                {opt.description && <small style={{color: 'var(--muted)'}}>{opt.description}</small>}
                            </div>
                        ))}
                     </div>
                 )}
               </div>
            </div>

            <div className={`builderPreview ${bgMood === 'night' ? 'canvas-mood-night' : ''}`} style={{position: 'relative', overflow: 'hidden', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <div style={{position: 'absolute', inset: 0, background: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background 0.5s'}} />
               
               <div style={{position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10}}>
                   <div style={{display: 'flex', gap: '15px'}}>
                      <button className="active" style={{background: 'transparent', border: 'none', color: '#fff', borderBottom: '2px solid #ff65bf', paddingBottom: '5px'}}>PREVIEW</button>
                   </div>
                   <div style={{display: 'flex', gap: '10px'}}>
                      <button onClick={()=>setBgMood('day')} style={{background: 'transparent', border: 'none', color: bgMood==='day'?'#ff65bf':'var(--muted)', cursor: 'pointer'}}><Sun size={18}/></button>
                      <button onClick={()=>setBgMood('night')} style={{background: 'transparent', border: 'none', color: bgMood==='night'?'#ff65bf':'var(--muted)', cursor: 'pointer'}}><Moon size={18}/></button>
                   </div>
               </div>
               
               {isCalibrating && bgType === 'custom' && (
                  <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                     <h3 style={{color: '#fff', marginBottom: '20px'}}>Calibrate Your Wall</h3>
                     <p style={{color: 'var(--muted)', marginBottom: '30px', textAlign: 'center', maxWidth: '300px'}}>Drag the line to match a known object's width, then enter its real size.</p>
                     
                     <div style={{position: 'relative', width: `${calibrationLineWidth}px`, height: '2px', background: '#ff0055', marginBottom: '40px'}}>
                        <div className="calibrationKnob" style={{left: '-10px'}} />
                        <div className="calibrationKnob" style={{right: '-10px'}} />
                     </div>
                     
                     <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                         <input type="number" value={calibrationInches} onChange={e=>setCalibrationInches(e.target.value)} style={{background: '#111', border: '1px solid #333', color: '#fff', padding: '10px', width: '100px', borderRadius: '8px'}} />
                         <span style={{color: '#fff'}}>cm</span>
                         <button onClick={() => {
                             if(parseFloat(calibrationInches) > 0) {
                                 setCalibrationRatio(calibrationLineWidth / parseFloat(calibrationInches));
                                 setIsCalibrating(false);
                             }
                         }} style={{background: '#00ffbc', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>Save</button>
                     </div>
                  </div>
               )}
               
               <div style={{position: 'relative', zIndex: 10, transform: `scale(${finalScale})`, transition: 'transform 0.3s'}}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'flex-start' : 'flex-end', textAlign, fontFamily: activeFont.name }}>
                     {text.split('\n').map((line, lineIdx) => (
                       <div key={lineIdx} style={{ whiteSpace: 'nowrap' }}>
                         {line.split('').map((char, charIdx) => {
                           const globalIdx = lineIdx * 100 + charIdx;
                           const charColor = (isMultiColor && letterColors[globalIdx]) ? letterColors[globalIdx] : color?.hex;
                           return (
                             <span key={globalIdx} className={isMojo ? 'mojo-gradient' : ''} style={{ display: 'inline-block', fontSize: '6rem', lineHeight: '1.2', ...( !isMojo ? { color: '#fff', textShadow: getGlow(charColor) } : {}), cursor: isMultiColor ? 'pointer' : 'default' }} onClick={() => { if (isMultiColor && !isMojo) setLetterColors({...letterColors, [globalIdx]: color?.hex}); }}>
                               {char === ' ' ? '\u00A0' : char}
                             </span>
                           );
                         })}
                       </div>
                     ))}
                     <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
                         {addedShapes.map(shape => <span key={shape.id} style={{fontSize: '4rem', filter: isMojo ? 'none' : `drop-shadow(0 0 10px ${color?.hex}) drop-shadow(0 0 20px ${color?.hex})`}}>{shape.type}</span>)}
                     </div>
                   </div>
               </div>
               
               <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '25px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', zIndex: 10}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end'}}>
                       <div>
                           <b style={{fontSize: '12px', color: '#fff', letterSpacing: '1px'}}>CHOOSE A BACKGROUND</b>
                           <div style={{display: 'flex', gap: '10px', marginTop: '12px'}}>
                               {[rooms.living, rooms.gaming, rooms.party, rooms.office, rooms.cafe].map((r, i) => (
                                 <button key={i} onClick={()=>{setBg(r); setBgType('preset');}} style={{width: '60px', height: '40px', border: bg===r ? '2px solid #ff65bf' : '1px solid #1c212e', borderRadius: '6px', background: `url(${r}) center/cover`, cursor: 'pointer', position: 'relative'}} />
                               ))}
                           </div>
                       </div>
                       <label style={{background: 'transparent', border: '1px solid #1c212e', color: '#fff', padding: '10px 15px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                           UPLOAD YOUR WALL <Upload size={14}/>
                           <input type="file" accept="image/*" onChange={handleFileUpload} style={{display: 'none'}} />
                       </label>
                   </div>
               </div>
            </div>
  
            <div style={{background: '#070910', border: '1px solid #1c212e', borderRadius: '16px', padding: '25px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '30px', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                   <Rocket color="#ff65bf" size={32}/>
                   <b style={{color: '#fff', fontSize: '14px', letterSpacing: '1px'}}>YOUR NEON SIGN SUMMARY</b>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px'}}>
                    <div style={{display: 'flex', gap: '10px'}}><span style={{color: 'var(--muted)', width: '40px'}}>Text</span><span style={{color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px'}}>{text || 'None'}</span></div>
                    <div style={{display: 'flex', gap: '10px'}}><span style={{color: 'var(--muted)', width: '40px'}}>Color</span><span style={{color: '#fff'}}>{isMojo ? 'Mojo Mix' : isMultiColor ? 'Multi' : color?.name}</span></div>
                    <div style={{display: 'flex', gap: '10px'}}><span style={{color: 'var(--muted)', width: '40px'}}>Type</span><span style={{color: '#fff'}}>{isMojo ? 'Mojo Mix' : 'Custom'}</span></div>
                    <div style={{display: 'flex', gap: '10px'}}><span style={{color: 'var(--muted)', width: '40px'}}>Font</span><span style={{color: '#fff'}}>{activeFont.name}</span></div>
                </div>
                <div>
                   <small style={{color: 'var(--muted)', display: 'block', fontSize: '11px', letterSpacing: '1px', marginBottom: '5px'}}>ESTIMATED PRICE</small>
                   <b style={{fontSize: '28px', color: '#fff', fontFamily: "'Space Grotesk', sans-serif"}}>₹{getPrice()}</b><br/>
                   <small style={{color: 'var(--muted)', fontSize: '10px'}}>(Inclusive of all taxes)</small>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                   <button className="btn solid" onClick={()=>{
                       try {
                           const item = {
                               id: Date.now(),
                               name: text ? `"${text.substring(0,15)}${text.length>15?'...':''}"` : (isMojo ? 'Mojo Mix' : 'Custom Neon'),
                               type: isMojo ? 'Mojo Mix' : 'Custom Neon',
                               price: getPrice(),
                               color: isMojo ? 'Mojo Mix' : (isMultiColor ? 'Multi' : color?.name),
                               size: selectedSize?.name || 'Standard',
                               font: activeFont?.name || 'Default',
                               qty: 1
                           };
                           const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
                           const existing = cart.find(x => x.name === item.name && x.type === item.type && x.size === item.size && x.color === item.color && x.font === item.font);
                           if (existing) existing.qty = (existing.qty || 1) + 1;
                           else cart.push(item);
                           localStorage.setItem('ns_cart', JSON.stringify(cart));
                           window.dispatchEvent(new Event('cartUpdated'));
                           window.location.href='/cart';
                       } catch(e) { window.location.href='/cart'; }
                   }} style={{width: '200px', background: 'linear-gradient(90deg, #ff65bf, #752eff)', border: 'none', color: '#fff', fontWeight: 'bold'}}>ADD TO CART <ShoppingCart size={16}/></button>
                    <button className="btn ghost" onClick={(e) => { e.preventDefault(); if(!localStorage.getItem('is_logged_in')){ window.location.href='/login'; } else { alert('Design saved to wishlist!'); } }} style={{width: '200px', borderColor: '#ff65bf', color: '#fff'}}>SAVE DESIGN <Heart size={16}/></button>
                </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </>);
}
export function About(){return <><Header/><main className="aboutPage"><section className="aboutHero" style={{'--bg':`url(${rooms.hero})`}}><div className="container"><small>ABOUT NEON STACK</small><h1>WE DON'T MAKE NEON SIGNS.<br/><em>WE CREATE STATEMENTS.</em></h1><div className="lineGlow"/><p>At The Neon Stack, ambience isn't decoration - it's identity. We believe every great space deserves a visual signature that captures attention, sparks conversation and stays in people's memories long after they leave.</p><p>Our mission is simple: transform ordinary spaces into unforgettable experiences through thoughtful design, premium craftsmanship and uncompromising quality.</p></div></section><section className="story container"><div className="storyImg" style={{backgroundImage:`url(/images/mascot-image.png)`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundColor: 'transparent'}} /><div><small>A LETTER FROM THE FOUNDER</small><h2>CRAFTED WITH PASSION,<br/>MADE TO GLOW.</h2><p>I've always believed that lighting has the power to change the way people experience a space. Every time I travelled through Southeast Asia and across Vietnam, I found myself admiring the vibrant neon-lit streets.</p><p>When I returned to Mumbai, one thought stayed with me - why shouldn't our spaces tell stories like these? That single thought became The Neon Stack.</p><p><em>"We're not here to manufacture products. We're here to create experiences people remember."<br/>— Makarand Shree Sathe, Founder</em></p></div></section><WhyWeExist /><OurPromise /><NeonStackDifference /><WhatDrivesUs /><CTA title="LET'S CREATE SOMETHING AMAZING TOGETHER" text="Have an idea in mind? We'd love to bring it to life."/></main><Footer/></>}
export function Contact(){return <><Header/><main className="contactPage"><section className="contactHero" style={{'--bg':`url(${rooms.office})`}}><div className="container"><div className="crumb">HOME <ChevronRight/> CONTACT US</div><h1>LET’S CREATE<br/><em>SOMETHING AMAZING</em><br/>TOGETHER.</h1><div className="lineGlow"/><p>Have a question, an idea, or ready to light up your space?<br/>We’d love to hear from you.</p></div></section><section className="contactGrid container"><div className="reach"><h2>REACH OUT TO US</h2><ContactItem icon={<MapPin/>} title="VISIT US">Neon Stack Studio<br/>S No. 123, Creative Street,<br/>Wakad, Pune – 411057,<br/>Maharashtra, India</ContactItem><ContactItem icon={<Phone/>} title="CALL US">+91 98765 43210<br/>Mon – Sat: 10:00 AM – 7:00 PM</ContactItem><ContactItem icon={<Mail/>} title="EMAIL US">hello@neonstack.in<br/>wecare@neonstack.in</ContactItem><ContactItem icon={<MessageCircle/>} title="WHATSAPP">+91 98765 43210<br/>Quick replies on WhatsApp</ContactItem><ContactItem icon={<Clock3/>} title="BUSINESS HOURS">Mon – Sat: 10:00 AM – 7:00 PM<br/>Sunday: Closed</ContactItem></div><form className="contactForm"><h2>SEND US A MESSAGE</h2><p>Fill out the form below and we’ll get back to you as soon as possible.</p><div className="formRow"><input placeholder="Your Name *"/><input placeholder="Email Address *"/></div><div className="formRow"><input placeholder="Phone Number"/><input placeholder="Subject"/></div><textarea placeholder="Your Message / Tell us about your idea *"/><div className="uploadDrop"><Upload/><b>Upload Logo / Reference (Optional)</b><small>JPG, PNG or PDF (Max. 10MB)</small></div><button className="btn primary" type="button">SEND MESSAGE <ArrowRight/></button></form></section><section className="mapBand container"><div><h2>FIND US HERE</h2><p>We’re easy to reach.<br/>Visit our studio or connect with us<br/>online from anywhere in India.</p><button className="btn ghost">GET DIRECTIONS <ArrowRight/></button></div><div className="fakeMap"><MapPin/><b>Neon Stack Studio</b></div></section><section className="subscribe container"><Mail/><div><h3>STAY IN THE GLOW</h3><p>Get new designs, offers & inspiration straight to your inbox.</p></div><input placeholder="Enter your email address"/><button className="btn primary">SUBSCRIBE <ArrowRight/></button></section></main><Footer/></>}
function ContactItem({icon,title,children}){return <div className="contactItem"><span>{icon}</span><div><b>{title}</b><p>{children}</p></div></div>}
export function Generic({title}){return <><Header/><main className="generic container"><div className="crumb">Home <ChevronRight/> {title}</div><h1>{title}</h1><p>This page is ready for the same Neon Stack visual system and can be connected to your WordPress/WooCommerce content when product data is available.</p><Link className="btn primary" href="/collections">SHOP NEON SIGNS <ArrowRight/></Link></main><Footer/></>}
function slug(s){return s.toLowerCase().replaceAll('&','and').replaceAll(' ','-').replaceAll('é','e')}
function iconByName(n){return {HomeIcon,Gamepad2,Building2,Coffee,Martini,Heart,Dumbbell}[n]||Sparkles}



export function ShippingPolicy() {
  return (
    <>
      <Header />
      <main className="generic container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', paddingBottom: '60px' }}>
        <div className="crumb">Home <ChevronRight/> Shipping Policy</div>
        <h1 style={{ marginBottom: '40px', fontSize: '32px' }}>SHIPPING POLICY</h1>
        <div className="policyContent" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: '#c0c2cb', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>1. General</h2>
            <p>We provide free standard shipping on all orders. All orders are typically dispatched within 5-6 business days (Monday-Friday, 9am-6pm IST). Please note that delivery times may vary based on your location and order size. There Might be delays in dispatch due to the custom and handcrafted nature of our products. We understand that this is a rare occurrence, and we ask for your patience and understanding as we do our best to get your items to you as soon as possible.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>2. Shipping Costs</h2>
            <p>Free shipping on standard orders.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>3. Returns</h2>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>3.1 Return Due To Change Of Mind</h3>
            <p>The Neon Stack will not accept any returns as the product is completely customized as per your need. However we will replace it if you receive the product in damaged condition. Return shipping will be paid at the customer's expense and will be required to arrange their own shipping. Once returns are received and accepted, refunds will be processed to store credit for a future purchase. We will notify you once this has been completed through email. The Neon Stack will refund the value of the goods returned but will NOT refund the value of any shipping paid.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>3.2 Warranty Returns</h3>
            <p>Customers will be required to pre-pay the return shipping. Upon return receipt of items for warranty claim, you can expect The Neon Stack to process your warranty claim within 7 days. Once warranty claim is confirmed, a replacement or the repaired item is sent to you depending on a case to case basis.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>4. Delivery Terms</h2>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.1 Transit Time Domestically</h3>
            <p>In general, domestic shipments are in transit for 6-8 Business Working days.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.2 Transit time Internationally</h3>
            <p>Generally, orders shipped internationally are in transit for 8 - 22 days. This varies greatly depending on the courier you have selected. We are able to offer a more specific estimate when you are choosing your courier at checkout.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.3 Dispatch Time</h3>
            <p>Orders are usually dispatched within 5-6 business days. Our warehouse operates on Monday - Friday during standard business hours, except on national holidays at which time the warehouse will be closed. In these instances, we take steps to ensure shipment delays will be kept to a minimum.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.4 Change Of Delivery Address</h3>
            <p>For change of delivery address requests, we are able to change the address at any time before the order has been dispatched.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.5 P.O. Box Shipping</h3>
            <p>The Neon Stack will ship to P.O. box addresses using postal services only. We are unable to offer couriers services to these locations.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.6 Military Address Shipping</h3>
            <p>We are able to ship to military addresses using USPS. We are unable to offer this service using courier services.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.7 Items Out Of Stock</h3>
            <p>If an item is out of stock, we will cancel and refund the out-of-stock items and dispatch the rest of the order.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>4.8 Delivery Time Exceeded</h3>
            <p>If delivery time has exceeded the forecasted time, please contact us so that we can conduct an investigation.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>5. Tracking Notifications</h2>
            <p>Upon dispatch, customers will receive a tracking link from which they will be able to follow the progress of their shipment based on the latest updates made available by the shipping provider.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>6. Parcels Damaged In Transit</h2>
            <p>If you find a parcel is damaged in-transit, if possible, please reject the parcel from the courier and get in touch with our customer service. If the parcel has been delivered without you being present, please contact customer service with next steps.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>7. Duties & Taxes</h2>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>7.1 Sales Tax</h3>
            <p>Sales tax has already been applied to the price of the goods as displayed on the website.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>7.2 Import Duties & Taxes</h3>
            <p>For international shipments, import duties & taxes may be required to be paid. The Neon Stack pre-calculates these costs and displays them at checkout and gives customers the choice of pre-paying these duties and taxes, or choosing to pay them separately upon arrival in your destination country. The Neon Stack encourages customers to pre-pay duties and taxes as pre-paying these will facilitate a faster delivery time as they will be less likely to be subject to delays at customs at their destination country.</p>
            <p style={{ marginTop: '10px' }}>If you refuse to pay duties and taxes upon arrival at your destination country, the goods will be returned to The Neon Stack at the customer's expense, and the customer will receive a refund for the value of goods paid, minus the cost of the return shipping. The cost of the initial shipping will not be refunded.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>8. Cancellations</h2>
            <p>Orders once placed cannot be cancelled or exchanged.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>9. Insurance</h2>
            <p>Parcels are insured for loss and damage up to the value as stated by the courier.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>9.1 Process for parcel damaged in-transit</h3>
            <p>We will process a refund or replacement as soon as the courier has completed their investigation into the claim.</p>
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>9.2 Process for parcel lost in-transit</h3>
            <p>We will process a refund or replacement as soon as the courier has conducted an investigation and deemed the parcel lost.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>10. Customer service</h2>
            <p>For all customer service enquiries, please email us at <a href="mailto:info@theneonstack.com" style={{ color: '#00ffbc' }}>info@theneonstack.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function TermsAndConditions() {
  return (
    <>
      <Header />
      <main className="generic container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', paddingBottom: '60px' }}>
        <div className="crumb">Home <ChevronRight/> Terms & Conditions</div>
        <h1 style={{ marginBottom: '40px', fontSize: '32px' }}>TERMS & CONDITIONS OF USE</h1>
        <div className="policyContent" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: '#c0c2cb', lineHeight: '1.7' }}>
          <p>Welcome to Neon Stack. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before using our website.</p>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>1. General Info</h2>
            <p>"Neon Stack" is the trade name for our customized LED neon signs business. These terms and conditions apply between you, the User of this Website, and Neon Stack, the owner and operator of this Website.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>2. Products and Services</h2>
            <p>Neon Stack specializes in the manufacturing and sale of custom LED neon signs. All products are subject to availability, and we reserve the right to impose quantity limits on any order, to reject all or part of an order, and to discontinue products without notice, even if you have already placed your order.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>3. Pricing and Payments</h2>
            <p>All prices are subject to change without notice. We make every effort to provide accurate pricing, but errors may occur. Payments must be received in full before the manufacturing process begins. We accept major credit cards and other payment methods as displayed at checkout.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>4. Shipping and Delivery</h2>
            <p>We strive to deliver your custom Neon Stack signs as quickly as possible. However, delivery times are estimates and are not guaranteed. We are not liable for any delays in shipments.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>5. Returns and Refunds</h2>
            <p>Due to the highly customized nature of our products, Neon Stack does not offer returns or refunds on custom-made signs unless the product arrives damaged or defective. In such cases, you must contact us within 48 hours of delivery with photographic evidence.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>6. Intellectual Property</h2>
            <p>All content included on the Website, unless uploaded by Users, is the property of Neon Stack, our affiliates, or other relevant third parties. This includes text, graphics, logos, images, and software.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>7. Governing Law and Jurisdiction</h2>
            <p>These terms and conditions shall be governed by and interpreted according to the laws of India. Any disputes arising under these terms and conditions shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>8. Contact Information</h2>
            <p>For any questions, concerns, or legal notices, please contact us at:</p>
            <p>Email: <a href="mailto:contact@neonstack.com" style={{ color: '#00ffbc' }}>contact@neonstack.com</a><br/>
            Phone: +91 9876543210<br/>
            Address: Mumbai, Maharashtra, India</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="generic container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', paddingBottom: '60px' }}>
        <div className="crumb">Home <ChevronRight/> Privacy Policy</div>
        <h1 style={{ marginBottom: '40px', fontSize: '32px' }}>PRIVACY POLICY</h1>
        <div className="policyContent" style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: '#c0c2cb', lineHeight: '1.7' }}>
          <p>This Privacy Policy describes how www.theneonstack.com (the “Site” or “we”) collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.</p>
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Collecting Personal Information</h2>
            <p>When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual (including the information below) as “Personal Information”. See the list below for more information about what Personal Information we collect and why.</p>
            
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>Device information</h3>
            <p>Examples of Personal Information collected: version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.<br/>
            Purpose of collection: to load the Site accurately for you, and to perform analytics on Site usage to optimize our Site.<br/>
            Source of collection: Collected automatically when you access our Site using cookies, log files, web beacons, tags, or pixels.</p>
            
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>Order information</h3>
            <p>Examples of Personal Information collected: name, billing address, shipping address, payment information, email address, and phone number.<br/>
            Purpose of collection: to provide products or services to you to fulfill our contract, to process your payment information, arrange for shipping, and provide you with invoices and/or order confirmations, communicate with you, screen our orders for potential risk or fraud, and when in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.<br/>
            Source of collection: collected from you.</p>
            
            <h3 style={{ fontSize: '15px', marginTop: '15px', color: '#fff' }}>Customer support information</h3>
            <p>Purpose of collection: to provide customer support.<br/>
            Source of collection: collected from you.</p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Sharing Personal Information</h2>
            <p>We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:<br/>
            We may share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Behavioural Advertising</h2>
            <p>As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you. For example:</p>
            <p>We use Google Analytics to help us understand how our customers use the Site. You can read more about how Google uses your Personal Information here: https://policies.google.com/privacy?hl=en. You can also opt-out of Google Analytics here: https://tools.google.com/dlpage/gaoptout.</p>
            <p>For more information about how targeted advertising works, you can visit the Network Advertising Initiative’s (“NAI”) educational page at http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work.</p>
            <p>You can opt out of targeted advertising by:</p>
            <ul>
              <li>FACEBOOK - https://www.facebook.com/settings/?tab=ads</li>
              <li>GOOGLE - https://www.google.com/settings/ads/anonymous</li>
              <li>BING - https://advertise.bingads.microsoft.com/en-us/resources/policies/personalized-ads</li>
            </ul>
            <p>Additionally, you can opt out of some of these services by visiting the Digital Advertising Alliance’s opt-out portal at: http://optout.aboutads.info/.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Using Personal Information</h2>
            <p>We use your personal Information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Lawful basis</h2>
            <p>Pursuant to the General Data Protection Regulation (“GDPR”), if you are a resident of the European Economic Area (“EEA”), we process your personal information under the following lawful bases:</p>
            <ul>
              <li>Your consent;</li>
              <li>The performance of the contract between you and the Site;</li>
              <li>Compliance with our legal obligations;</li>
              <li>For our legitimate interests, which do not override your fundamental rights and freedoms.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Retention</h2>
            <p>When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to erase this information.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Cookies</h2>
            <p>A cookie is a small amount of information that’s downloaded to your computer or device when you visit our Site. We use a number of different cookies, including functional, performance, advertising, and social media or content cookies. Cookies make your browsing experience better by allowing the website to remember your actions and preferences.</p>
            <p>The length of time that a cookie remains on your computer or mobile device depends on whether it is a “persistent” or “session” cookie. Session cookies last until you stop browsing and persistent cookies last until they expire or are deleted. Most of the cookies we use are persistent and will expire between 30 minutes and two years from the date they are downloaded to your device.</p>
            <p>You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can negatively impact your user experience and parts of our website may no longer be fully accessible.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Changes</h2>
            <p>We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', color: '#00ffbc', marginBottom: '8px' }}>Contact</h2>
            <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:info@theneonstack.com" style={{ color: '#00ffbc' }}>info@theneonstack.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}



