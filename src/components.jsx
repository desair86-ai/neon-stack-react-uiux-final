"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getProducts, getCategories } from "./lib/api";
import {
  Menu, X, Search, UserRound, ShoppingCart, ChevronDown, ArrowRight, ArrowLeft,
  Sparkles, WandSparkles, Star, Upload, SlidersHorizontal, MessageCircle, ShieldCheck,
  Truck, Heart, Gem, Store, BriefcaseBusiness, Coffee, Martini, Dumbbell, Gift,
  Music2, Baby, Gamepad2, Building2, Home as HomeIcon ,
  MapPin, Phone, Mail, Clock3, Plus, RotateCcw, Undo2, Redo2, Image as ImageIcon,
  Package, Headphones, Leaf, BadgeCheck, Zap, Palette, PenTool, Box, ChevronRight
} from 'lucide-react';
import './styles.css';

const img = (id, w=1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const rooms = {
  hero: '/images/website_banner_01.png',
  living: '/images/better_together.jpg',
  gaming: '/images/astro_with_full_moon.png',
  office: '/images/whats_in_the_box.png',
  cafe: '/images/pizza_and_drink.png',
  bedroom: '/images/astro_with_moon.png',
  studio: '/images/remote_details_01.png',
  party: '/images/wings_and_drinks.png',
};

const categories = [
  ['Home Decor','HomeIcon'],['Gaming','Gamepad2'],['Business','Building2'],['Café & Restaurant','Coffee'],
  ['Bar & Nightlife','Martini'],['Events & Weddings','Heart'],['Fitness & Sports','Dumbbell']
];
const defaultProducts = [
  ['Gaming Controller','Gaming','/images/1.png','','1,499'],['Astronaut On Moon','Astronaut & Space','/images/astro_with_full_moon.png','','1,999'],
  ['Good Vibes Only','Quotes','/images/2.png','','1,199'],['Coffee Time','Café & Restaurant','/images/3.png','','1,399'],
  ['Rahul','Custom Neon','/images/4.png','','1,599'],['Love You','Love & Romance','/images/5.png','','1,199'],
  ['Buddha','Gods & Spiritual','/images/6.png','','1,799'],['Google Logo','Business','/images/7.png','','2,499'],
  ['Game Room','Gaming','/images/8.png','MOJO MIX','1,899'],['Motorcycle','Motorbikes','/images/9.png','','1,999'],
  ['Hakuna Matata','Quotes','/images/10.png','','1,399'],['Cocktail','Bars','/images/wings_and_drinks.png','','1,599']
];

function useProducts() {
  const [products, setProducts] = useState(defaultProducts);
  useEffect(() => {
    getProducts().then(fetched => {
      if(fetched && fetched.length > 0) {
        setProducts(fetched);
      }
    }).catch(console.error);
  }, []);
  return products;
}

function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);
  return categories;
}
const allCategories = ['All Neon Signs','Astronaut & Space','Bars','Beauty & Salon','Bollywood','Business','Café & Restaurant','Cricket','Gaming','Gods & Spiritual','Home Decor','Kids','Love & Romance','Music & Studio','Sports & Fitness','Quotes & Words'];

function Logo(){ return <Link className="logo" href="/"><span>NEON</span><b>STACK</b></Link> }
function Announcement(){ return <div className="announce"><Zap/> <span>SALE ENDS IN</span> <b>02d : 12h : 45m : 30s</b><i/> <span>Free Shipping Across India</span></div> }

function Header(){
  const pathname = usePathname();
  const [mobile,setMobile]=useState(false); const [shop,setShop]=useState(false);
  const shopActive = pathname.startsWith('/collections') || pathname.startsWith('/category');
  return <>
    <Announcement/>
    <header className="header">
      <button className="mobileOnly iconBtn" onClick={()=>setMobile(true)}><Menu/></button>
      <Logo/>
      <nav className="desktopNav">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>HOME</Link>
        <button className={shopActive?'active':''} onClick={()=>setShop(v=>!v)}>SHOP <ChevronDown/></button>
        <Link href="/custom-neon" className={pathname === '/custom-neon' ? 'active' : ''}>CUSTOM NEON</Link>
        <Link href="/mojo-mix" className={pathname === '/mojo-mix' ? 'active' : ''}>MOJO MIX</Link>
        <Link href="/uv-printed" className={pathname === '/uv-printed' ? 'active' : ''}>UV PRINTED</Link>
        <Link href="/category/business" className={pathname === '/category/business' ? 'active' : ''}>BUSINESS</Link>
        <Link href="/about" className={pathname === '/about' ? 'active' : ''}>ABOUT US</Link>
        <Link href="/blogs" className={pathname === '/blogs' ? 'active' : ''}>BLOGS</Link>
        <Link href="/contact" className={pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
      </nav>
      <div className="headerActions"><button><Search/></button><button className="account"><UserRound/></button><button><ShoppingCart/><em>2</em></button></div>
    </header>
    {shop && <MegaMenu close={()=>setShop(false)}/>} 
    {mobile && <MobileMenu close={()=>setMobile(false)}/>} 
  </>
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
            <div className="miniPic" style={{backgroundColor: "#111"}}>
              <span style={{fontSize:"11px"}}>{sub.name.substring(0, 8)}</span>
            </div>
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
      <div className="neonBulb">◯</div>
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
function MobileMenu({close}){ return <div className="mobileMenu"><div className="mobileMenuTop"><Logo/><button className="iconBtn" onClick={close}><X/></button></div><div className="mobileLinks"><Link href="/" onClick={close}>HOME <ArrowRight/></Link><Link href="/collections" onClick={close}>SHOP <ArrowRight/></Link><Link href="/custom-neon" onClick={close}>CUSTOM NEON <ArrowRight/></Link><Link href="/mojo-mix" onClick={close}>MOJO MIX <ArrowRight/></Link><Link href="/uv-printed" onClick={close}>UV PRINTED <ArrowRight/></Link><Link href="/category/business" onClick={close}>BUSINESS <ArrowRight/></Link><Link href="/about" onClick={close}>ABOUT US <ArrowRight/></Link><Link href="/blogs" onClick={close}>BLOGS <ArrowRight/></Link><Link href="/contact" onClick={close}>CONTACT <ArrowRight/></Link></div><div className="mobileMenuBottom"><Link href="/custom-neon" onClick={close}>CREATE YOUR CUSTOM NEON <ArrowRight/></Link><p>Premium LED neon signs, handcrafted in India.</p></div></div> }

function Benefit({icon,title,text}){return <div className="benefit"><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></div>}
function CTA({title='YOUR IDEA DESERVES TO GLOW.',text="Let's create something amazing together."}){return <section className="ctaBand container"><div><Sparkles/><div><h3>{title}</h3><p>{text}</p></div></div><Link className="btn primary" href="/custom-neon">CREATE YOUR NEON <ArrowRight/></Link></section>}
function Footer(){return <footer><div className="footerBenefits container"><Benefit icon={<ShieldCheck/>} title="Safe & Durable" text="Low voltage, no heating, long lasting."/><Benefit icon={<Truck/>} title="Fast Delivery" text="Delivered safely at your doorstep."/><Benefit icon={<BadgeCheck/>} title="1 Year Warranty" text="We've got you covered."/><Benefit icon={<Package/>} title="Easy to Install" text="Comes with mounting accessories."/><Benefit icon={<Headphones/>} title="24/7 Support" text="We're always here to help."/></div><div className="footerMain container"><div className="footerBrand"><Logo/><p>Premium LED neon signs<br/>handcrafted in India to light<br/>up your space and your story.</p><Social/></div><FooterCol title="SHOP" links={['All Neon Signs','Custom Neon Sign','Mojo Mix Signs','UV Printed Neon','Business Logo Signs','Accessories']}/><FooterCol title="CUSTOMER CARE" links={['Track Your Order','Shipping & Delivery','Returns & Refunds',"FAQ's",'Care Instructions','Contact Us']}/><FooterCol title="COMPANY" links={['About Us','Our Process','Blogs','Reviews','Careers','Bulk Orders']}/><div className="footerContact"><h4>CONTACT US</h4><p><Phone/> +91 98765 43210</p><p><Mail/> hello@neonstack.in</p><p><MapPin/> S No. 123, Creative Street,<br/>Wakad, Pune – 411057,<br/>Maharashtra, India</p></div></div><div className="footerSubscribe container"><div><Mail/><div><h3>STAY IN THE GLOW</h3><p>Get new designs, offers & inspiration straight to your inbox.</p></div></div><div><input aria-label="Email address" placeholder="Enter your email address"/><button className="btn primary">SUBSCRIBE <ArrowRight/></button></div></div><div className="footerBottom container"><span>© 2024 Neon Stack. All rights reserved.</span><span>Privacy Policy　|　Terms & Conditions　|　Shipping Policy</span></div></footer>}
function FooterCol({title,links}){return <div className="footerCol"><h4>{title}</h4>{links.map(x=><Link key={x} href={x==='All Neon Signs'?'/collections':x==='About Us'?'/about':x==='Contact Us'?'/contact':'/collections'}>{x}</Link>)}</div>}
function Social(){return <div className="social"><span className="socialBrand" aria-label="Instagram">◎</span><span className="socialFacebook" aria-label="Facebook">f</span><span className="socialBrand" aria-label="YouTube">▶</span><span className="socialBrand" aria-label="WhatsApp">◔</span></div>}

export function Home(){
  const products = useProducts();
  return <><Header/><main>
  <section className="homeHero" style={{'--bg':`url(${rooms.hero})`}}><div className="heroCopy"><small>PREMIUM LED NEON • MADE IN INDIA</small><h1>TURN YOUR<br/>IDEA INTO<br/><em>LIGHT.</em></h1><p>Premium LED neon signs, custom made for homes, businesses & every moment that matters.</p><div className="heroBtns"><Link className="btn primary" href="/custom-neon">CREATE YOUR NEON <ArrowRight/></Link><Link className="btn ghost" href="/collections">SHOP NEON SIGNS</Link></div><div className="heroProof"><Benefit icon={<Sparkles/>} title="Made in India" text="Proudly handcrafted"/><Benefit icon={<Gem/>} title="Premium Quality" text="Built to last"/><Benefit icon={<ShieldCheck/>} title="Safe & Efficient" text="Low voltage LED"/><Benefit icon={<Truck/>} title="7–10 Day Delivery*" text="Pan India Shipping"/></div></div></section>
  <section className="section container"><SectionHead eyebrow="SHOP BY SPACE" title="Find the perfect neon for every space & occasion." link="VIEW ALL COLLECTIONS"/><div className="spaceTiles">{categories.map(([n,ic],i)=>{const I=iconByName(ic); return <Link key={n} href={`/category/${slug(n)}`} className="spaceTile" style={{"--tile-delay":`${i * 40}ms`}}><span className="spaceIcon"><I/></span><b>{n}</b></Link>})}</div></section>
  <section className="section darkSection"><div className="container"><SectionHead eyebrow="OUR SPECIAL NEON SIGNS" title="Signature neon technologies." sub="Explore the ways Neon Stack can make your space glow."/><div className="specialGrid"><Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork." action="CUSTOMIZE NOW" bg="/images/better_together.jpg" /><Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200+ effects, music sync & app control." action="EXPLORE MOJO" bg="/images/234 (7).png" /><Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish." action="EXPLORE UV" bg="/images/4.png" /></div></div></section>
  <section className="section container"><SectionHead eyebrow="BESTSELLERS" title="Neon signs people love." link="SHOP ALL"/><div className="productStrip">{products.slice(0,6).map(p=><ProductCard key={p[0]} p={p}/>)}</div></section>
  <section className="why"><div className="container"><SectionHead eyebrow="WHY CHOOSE NEON STACK?" title="Built for glow. Designed to last."/><div className="whyGrid"><Benefit icon={<Store/>} title="Made in India" text="Proudly designed & handcrafted locally."/><Benefit icon={<WandSparkles/>} title="Custom Made" text="Your text, logo or idea brought to life."/><Benefit icon={<Gem/>} title="Premium Quality" text="High grade LED neon & materials."/><Benefit icon={<Heart/>} title="Safe & Durable" text="Low voltage, energy efficient & long lasting."/><Benefit icon={<Headphones/>} title="Premium Support" text="We're here for your experience."/></div></div></section>
  <section className="section container realGlow"><div className="realCopy"><small>REAL SPACES. REAL GLOW.</small><h2>See how Neon Stack lights up beautiful spaces.</h2><p>From living rooms to gaming setups, discover signs in their natural environment.</p><Link className="textLink" href="/collections">SEE MORE INSTALLATIONS <ArrowRight/></Link></div><div className="installGrid">{[rooms.living,rooms.gaming,rooms.party,rooms.cafe].map((r,i)=><div key={i} className="install" style={{backgroundImage:`url(${r})`}}></div>)}</div></section>
  
  <section className="mojoSection" style={{backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 30%, transparent 50%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%), url('/images/mojo_bg_clean.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}><div className="container mojoLayout"><div><small>MEET MOJO MIX</small><h2>Neon that<br/><em>moves.</em></h2><p>200+ Flow Effects • Music Sync • App Control • Unlimited Colors</p><Link className="btn primary" href="/mojo-mix">EXPLORE MOJO MIX <ArrowRight/></Link></div><div className="mojoVisual"><img src="/images/mascot-image.png" alt="Mascot" className="mojoMascot" style={{height: '340px', width: 'auto', objectFit: 'contain'}} /></div></div></section>
  <section className="section container howBox"><div className="howGrid" style={{display: 'flex', flexDirection: 'column', gap: '80px'}}><div><SectionHead eyebrow="HOW IT WORKS" title="From idea to glow."/><div className="steps" style={{border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'}}>{[['01','Share Your Idea','Send your text, logo or reference.', MessageCircle],['02','Get Your Mockup','We create a design & share it with you.', Palette],['03','Approve & We Craft','Once approved, we start crafting.', Sparkles],['04','Safe Delivery','Carefully packed & delivered to you.', Truck]].map(([n,t,d,Icon], i)=><React.Fragment key={n}><div className="step" style={{border: 'none', padding: '0', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{width: '60px', height: '60px', border: '2px solid #00ffbc', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00ffbc', boxShadow: '0 0 15px #00ffbc55', marginBottom: '20px'}}><Icon size={20} /> <b style={{fontSize: '12px', marginTop: '4px'}}>{n}</b></div><h3 style={{margin: '0 0 10px', fontSize: '13px', whiteSpace: 'nowrap'}}>{t}</h3><p style={{margin: 0, fontSize: '12px'}}>{d}</p></div>{i < 3 && <ArrowRight size={24} color="#00ffbc" style={{flexShrink: 0}} />}</React.Fragment>)}</div></div><div className="boxContents"><SectionHead eyebrow="WHAT’S IN THE BOX" title="Everything you need to unbox, install & glow."/><div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap'}}><img src="/images/whats_in_the_box.png" alt="What's in the box" style={{width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '12px'}} /><img src="/images/remote_details_01.png" alt="Remote Details" style={{width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '12px'}} /></div></div></div></section>
  <section className="trustCTA container"><div className="customerProof"><h3>THOUSANDS OF HAPPY CUSTOMERS</h3><p>Trusted by 20,000+ customers across India.</p><div className="stars">⭐⭐⭐⭐⭐ <b>4.9/5</b></div><small>From 2,500+ Reviews</small></div><CTA/></section>
</main><Footer/></>}
function BoxItem({icon,text}){return <div><span>{icon}</span><b>{text}</b></div>}
function Special({title,text,action,bg,linkTo}){return <article className="special"><img className="specialImage" src={bg} alt=""/><div className="specialCopy"><h3>{title}</h3><p>{text}</p><Link className="btn ghost" href={linkTo || "#"}>{action} <ArrowRight/></Link></div></article>}
function SectionHead({eyebrow,title,sub,link}){return <div className="sectionHead"><div><small>{eyebrow}</small><h2>{title}</h2>{sub&&<p>{sub}</p>}</div>{link&&<Link className="textLink" href="/collections">{link} <ArrowRight/></Link>}</div>}
function NeonText({lines,colors=['pink','blue','pink']}){return <div className="neonText">{lines.map((x,i)=><span key={x} className={colors[i%colors.length]}>{x}</span>)}</div>}
function ProductCard({p}){return <Link className="productCard" href="/collections"><div className="productImg" style={{backgroundImage:`url(${p[2]})`}}>{p[3] && p[3].trim() !== '' ? <span className="badge">{p[3]}</span> : null}<button onClick={e=>e.preventDefault()}><Heart/></button></div><div className="productInfo"><h3>{p[0]}</h3><small>{p[1]}</small><div><b>From ₹{p[4]}</b><span><ShoppingCart/></span></div></div></Link>}

export function Collections(){return <><Header/><main className="catalogPage"><section className="catalogHero container" style={{'--bg':`url(${rooms.hero})`}}><div><div className="crumb">Home <ChevronRight/> All Collections</div><h1>ALL <em>NEON</em> SIGNS</h1><p>Discover our complete collection of premium LED neon signs for every space, mood and occasion.</p><div className="heroIcons"><Benefit icon={<Gem/>} title="Made in India" text=""/><Benefit icon={<Heart/>} title="Premium Quality" text=""/><Benefit icon={<WandSparkles/>} title="Custom Made" text=""/><Benefit icon={<ShieldCheck/>} title="Safe & Durable" text=""/></div></div></section><div className="container collectionFeature"><Feature title="Custom Neon Signs" text="Make it yours." icon={<WandSparkles/>}/><Feature title="Mojo Mix Signs" text="Dynamic. Colorful. Alive." icon={<Sparkles/>}/><Feature title="UV Printed Neon" text="Detailed. Vibrant. Stunning." icon={<Palette/>}/><Feature title="Business Logo Signs" text="Stand out. Get noticed." icon={<BriefcaseBusiness/>}/></div><CatalogGrid/></main><Footer/></>}
function Feature({title,text,icon}){return <div><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></div>}
function CatalogGrid(){
  const [filter,setFilter]=useState(false);
  const products = useProducts();
  return <section className="catalogGrid container"><button className="mobileFilter" onClick={()=>setFilter(v=>!v)}><SlidersHorizontal/> FILTER BY <ChevronDown/></button><aside className={filter?'show':''}><div className="filterHead"><b>FILTER BY</b><button>CLEAR ALL</button></div><Filter title="CATEGORIES" items={allCategories.slice(0,12)}/><Filter title="PRICE RANGE" items={['₹499','₹24,999+']}/><Filter title="SIZE" items={['Up to 12 inch (52)','12 – 24 inch (97)','24 – 36 inch (63)','36 inch & above (36)']}/><Filter title="COLOR" items={['●','●','●','●','●','●','●','●']}/><Filter title="TYPE" items={['Standard LED (168)','Mojo Mix (42)','UV Printed (28)','Custom Neon (10)']}/><Filter title="OCCASION" items={['Birthday (31)','Wedding (16)','Anniversary (17)','Festive (26)']}/><button className="clearBtn">CLEAR FILTERS</button></aside><div className="catalogResults"><div className="resultTools"><span>Showing 1–24 of 248 products</span><select><option>Sort by: Featured</option><option>Price: Low to High</option></select><button><GridIcon/></button><button><Menu/></button></div><div className="catalogProducts">{products.map(p=><ProductCard key={p[0]} p={p}/>)}</div><div className="pagination"><button><ArrowLeft/></button><b>1</b><span>2</span><span>3</span><span>…</span><span>11</span><button><ArrowRight/></button></div></div></section>}
function Filter({title,items}){return <div className="filter"><div><b>{title}</b><ChevronDown/></div>{title==='PRICE RANGE'?<div className="range"><i/><span>₹499</span><span>₹24,999+</span></div>:title==='COLOR'?<div className="colorDots">{items.map((_,i)=><i key={i}/>)}</div>:items.map(x=><label key={x}><input type="checkbox"/> {x}</label>)}</div>}
function GridIcon(){return <span className="gridIcon"><i/><i/><i/><i/></span>}

export function Category({name}){const params=useParams(); name=name||params.name?.replaceAll('-',' ')||'Gaming'; const key=name.toLowerCase();const bg=key.includes('gaming')?rooms.gaming:key.includes('business')?rooms.office:key.includes('cafe')?rooms.cafe:key.includes('home')?rooms.living:rooms.party;return <><Header/><main className="categoryPage"><section className="catHero container" style={{'--bg':`url(${bg})`}}><div><div className="crumb">Home <ChevronRight/> All Collections <ChevronRight/> {name} Neon Signs</div><h1>{name.toUpperCase()}<br/><em>NEON SIGNS</em></h1><p>Level up your {name.toLowerCase()} with premium neon signs. Perfect for your space, your vibe and your story.</p><div className="catProof"><Benefit icon={<Gem/>} title="Premium LED Neon" text="Bright, safe & energy efficient"/><Benefit icon={<Sparkles/>} title="Made for You" text="Designed to match your vibe"/></div></div></section><div className="container catTabs">{['All Gaming','Controllers','Console','PC Setup','Characters','Quotes','Anime','More'].map((x,i)=><Link key={x} href="#" className={i===0?'active':''}><Gamepad2/><b>{x}</b></Link>)}</div><CatalogGrid/></main><Footer/></>}

export function CustomNeon({ type = 'custom_neon' }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('TEXT');
  const [text, setText] = useState('Good Vibes Only');
  const [bg, setBg] = useState('dark');
  const [color, setColor] = useState('pink');

  useEffect(() => {
    import('./lib/api').then(({ getConfiguratorOptions }) => {
      getConfiguratorOptions(type).then(data => {
        setConfig(data);
        setLoading(false);
      }).catch(e => {
        console.error(e);
        setLoading(false);
      });
    });
  }, [type]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!config?.product_id) return alert('Configurator not mapped to product');
    
    const payload = {
      type: type,
      text: text,
      color: color
    };
    
    try {
      const { addToCart } = await import('./lib/woocommerce');
      await addToCart(config.product_id, 1, payload);
      alert('Added to cart!');
    } catch(err) {
      alert('Error adding to cart');
      console.error(err);
    }
  };

  if (loading) return <><Header/><main style={{padding: '100px', textAlign: 'center'}}>Loading configurator...</main><Footer/></>;

  return <><Header/>
    <main className="builderPage">
      <section className="builderHeader container">
        <h1>CREATE YOUR <em>{type === 'mojo_mix' ? 'MOJO MIX' : 'CUSTOM NEON'}</em> SIGN</h1>
        <p>Design it. See it. Love it.</p>
      </section>
      <section className="builder container">
        <aside>
          <div className="builderTabs"><button className="active">TEXT</button></div>
          <div className="builderControls">
            <label>YOUR TEXT</label><input value={text} onChange={e=>setText(e.target.value)}/>
            <label>TEXT COLOR</label>
            <div className="swatches">{['pink','blue','green'].map(c=><button className={color===c?'active':''} key={c} onClick={()=>setColor(c)} style={{'--c':c}}/>)}</div>
            <button className="btn primary" onClick={handleAddToCart}>ADD TO CART <ShoppingCart/></button>
          </div>
        </aside>
        <div className="builderPreview">
          <h3>Preview</h3>
          <div><NeonText lines={[text]} colors={[color]} /></div>
          <button className="btn primary" onClick={handleAddToCart}>ADD TO CART <ShoppingCart/></button>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}

export function About(){return <><Header/><main className="aboutPage"><section className="aboutHero" style={{'--bg':`url(${rooms.hero})`}}><div className="container"><small>ABOUT NEON STACK</small><h1>WE DON’T JUST MAKE<br/>NEON SIGNS.<br/><em>WE LIGHT UP STORIES.</em></h1><div className="lineGlow"/><p>Neon Stack is more than a brand – it’s a passion project born from the love of design, light, and the endless possibilities they create together.</p><p>From a small idea to India’s most trusted neon sign brand, our journey is all about creativity, quality, and you.</p></div></section><section className="numbers"><div className="container"><SectionHead eyebrow="OUR JOURNEY IN NUMBERS" title=""/><div className="numberGrid">{[['20K+','Happy Customers'],['50K+','Neon Signs Delivered'],['4.9 ★','Average Rating'],['1000+','Cities Delivered To'],['3+','Years of Glow']].map(([n,l],i)=><div key={l}><span>{(() => { const Icon = [Heart,Box,Star,Store,BadgeCheck][i]; return <Icon/>; })()}</span><strong>{n}</strong><b>{l}</b></div>)}</div></div></section><section className="story container"><div className="storyImg" style={{backgroundImage:`url(${rooms.studio})`}}><NeonText lines={['Good','Vibes','Only']} colors={['blue','pink','blue']}/></div><div><small>OUR STORY</small><h2>CRAFTED WITH PASSION,<br/>MADE TO GLOW.</h2><p>We started with a simple belief – every space has a story, and neon light is the perfect way to tell it.</p><p>What began in a small studio has now grown into a team of dreamers, designers, and makers who are obsessed with quality and details.</p><p>From custom creations to ready-to-shop designs, we put our heart into every sign we make.</p><Link className="btn ghost" href="/about">OUR JOURNEY <ArrowRight/></Link></div></section><section className="standFor"><div className="container"><SectionHead eyebrow="WHAT WE STAND FOR" title=""/><div className="standGrid">{[['PREMIUM QUALITY',Gem,'We use the best materials and craft long-lasting neon signs.'],['CUSTOM MADE',PenTool,'Your ideas, our creativity – designed and crafted just for you.'],['SAFE & RELIABLE',ShieldCheck,'UL-listed adapters, low voltage, and built for safety.'],['ENERGY EFFICIENT',Leaf,'Bright on looks, light on power consumption.'],['MADE IN INDIA',Heart,'Proudly designed and handcrafted in India.']].map(([t,I,d])=><div key={t}><I/><b>{t}</b><p>{d}</p></div>)}</div></div></section><section className="team container"><SectionHead eyebrow="THE TEAM BEHIND THE GLOW" title=""/><div>{[rooms.studio,rooms.gaming,rooms.office,rooms.living].map((r,i)=><img key={i} src={r} alt="Neon Stack maker at work"/>)}</div></section><CTA title="LET’S CREATE SOMETHING AMAZING TOGETHER" text="Have an idea in mind? We’d love to bring it to life."/></main><Footer/></>}
export function Contact(){return <><Header/><main className="contactPage"><section className="contactHero" style={{'--bg':`url(${rooms.office})`}}><div className="container"><div className="crumb">HOME <ChevronRight/> CONTACT US</div><h1>LET’S CREATE<br/><em>SOMETHING AMAZING</em><br/>TOGETHER.</h1><div className="lineGlow"/><p>Have a question, an idea, or ready to light up your space?<br/>We’d love to hear from you.</p></div></section><section className="contactGrid container"><div className="reach"><h2>REACH OUT TO US</h2><ContactItem icon={<MapPin/>} title="VISIT US">Neon Stack Studio<br/>S No. 123, Creative Street,<br/>Wakad, Pune – 411057,<br/>Maharashtra, India</ContactItem><ContactItem icon={<Phone/>} title="CALL US">+91 98765 43210<br/>Mon – Sat: 10:00 AM – 7:00 PM</ContactItem><ContactItem icon={<Mail/>} title="EMAIL US">hello@neonstack.in<br/>wecare@neonstack.in</ContactItem><ContactItem icon={<MessageCircle/>} title="WHATSAPP">+91 98765 43210<br/>Quick replies on WhatsApp</ContactItem><ContactItem icon={<Clock3/>} title="BUSINESS HOURS">Mon – Sat: 10:00 AM – 7:00 PM<br/>Sunday: Closed</ContactItem></div><form className="contactForm"><h2>SEND US A MESSAGE</h2><p>Fill out the form below and we’ll get back to you as soon as possible.</p><div className="formRow"><input placeholder="Your Name *"/><input placeholder="Email Address *"/></div><div className="formRow"><input placeholder="Phone Number"/><input placeholder="Subject"/></div><textarea placeholder="Your Message / Tell us about your idea *"/><div className="uploadDrop"><Upload/><b>Upload Logo / Reference (Optional)</b><small>JPG, PNG or PDF (Max. 10MB)</small></div><button className="btn primary" type="button">SEND MESSAGE <ArrowRight/></button></form></section><section className="mapBand container"><div><h2>FIND US HERE</h2><p>We’re easy to reach.<br/>Visit our studio or connect with us<br/>online from anywhere in India.</p><button className="btn ghost">GET DIRECTIONS <ArrowRight/></button></div><div className="fakeMap"><MapPin/><b>Neon Stack Studio</b></div></section><section className="subscribe container"><Mail/><div><h3>STAY IN THE GLOW</h3><p>Get new designs, offers & inspiration straight to your inbox.</p></div><input placeholder="Enter your email address"/><button className="btn primary">SUBSCRIBE <ArrowRight/></button></section></main><Footer/></>}
function ContactItem({icon,title,children}){return <div className="contactItem"><span>{icon}</span><div><b>{title}</b><p>{children}</p></div></div>}
export function Generic({title}){return <><Header/><main className="generic container"><div className="crumb">Home <ChevronRight/> {title}</div><h1>{title}</h1><p>This page is ready for the same Neon Stack visual system and can be connected to your WordPress/WooCommerce content when product data is available.</p><Link className="btn primary" href="/collections">SHOP NEON SIGNS <ArrowRight/></Link></main><Footer/></>}
function slug(s){return s.toLowerCase().replaceAll('&','and').replaceAll(' ','-').replaceAll('é','e')}
function iconByName(n){return {HomeIcon,Gamepad2,Building2,Coffee,Martini,Heart,Dumbbell}[n]||Sparkles}


