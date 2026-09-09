import { Header, Footer } from "../../src/components";
import {
  BriefcaseBusiness, Upload, ArrowRight, CheckCircle, ShieldCheck, Truck,
  Sparkles, WandSparkles, Gem, Heart, Star, Zap, Palette, MessageCircle
} from "lucide-react";

function Benefit({ icon, title, text }) {
  return (
    <div className="benefit">
      <span>{icon}</span>
      <div><b>{title}</b><small>{text}</small></div>
    </div>
  );
}

function CatCard({ name, href, icon }) {
  const I = icon;
  return (
    <a href={href} className="catCard">
      <span className="catIcon"><I /></span>
      <b>{name}</b>
    </a>
  );
}

export default function BusinessLogoPage() {
  return (
    <>
      <Header />
      <main className="businessLogoPage">

        {/* HERO */}
        <section className="catHero container" style={{ '--bg': `url(/images/backgrounds/office 1.webp)` }}>
          <div>
            <div className="crumb">Home <span style={{ color: '#752eff' }}>/</span> Business Logo</div>
            <h1>Design Your Custom Logo <em>With Us</em></h1>
            <p>Upload your business logo or artwork. Get a FREE Quote and 3D Mockup within 24 hours.</p>
            <div className="heroIcons">
              <Benefit icon={<Gem />} title="Made in India" text="" />
              <Benefit icon={<Heart />} title="Premium Quality" text="" />
              <Benefit icon={<WandSparkles />} title="Custom Made" text="" />
              <Benefit icon={<ShieldCheck />} title="Safe & Durable" text="" />
            </div>
          </div>
        </section>

        {/* QUOTE FORM */}
        <section className="section container">
          <div className="quoteFormWrap">
            <div className="quoteForm">
              <h2 style={{ fontSize: '28px', marginBottom: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>
                Get a <em style={{ color: '#00ffbc' }}>FREE</em> Quote &amp; Mockup
              </h2>
              <p style={{ color: '#8992a5', marginBottom: '24px' }}>Share a few details and our designers will craft your logo neon within 24 hours.</p>

              <form className="quoteFields">
                <input type="text" placeholder="Your Name *" required />
                <input type="email" placeholder="Your Email *" required />
                <input type="tel" placeholder="Phone Number" />
                <select>
                  <option>Select Sign Type</option>
                  <option>Custom Neon Sign — Classic LED neon on acrylic backboard</option>
                  <option>Mojo Mix — RGB multi-color dynamic LED signs</option>
                  <option>UV Printed Neon — Full-color UV print with neon highlights</option>
                </select>
                <textarea rows={4} placeholder="Design Details & Requirements *" required></textarea>
                <input type="text" placeholder="Approximate Budget (Optional)" />
                <label className="uploadBox">
                  <Upload size={18} style={{ marginRight: '8px' }} />
                  Upload Artwork / Logo
                  <input type="file" accept="image/*,.svg,.ai,.pdf" style={{ display: 'none' }} />
                  <small>PNG, JPG, SVG, AI, PDF</small>
                </label>
                <button className="btn primary" type="submit" style={{ width: '100%', padding: '16px', fontSize: '15px' }}>
                  Get a FREE Quote &amp; Mockup <ArrowRight size={16} />
                </button>
              </form>
            </div>

            <div className="quoteBenefits">
              <h3>Why a Neon Logo?</h3>
              <Benefit icon={<CheckCircle color="#00ffbc" />} title="Free Mockups" text="Unlimited revisions until perfect" />
              <Benefit icon={<ShieldCheck color="#00ffbc" />} title="2-Year Warranty" text="Premium quality guaranteed" />
              <Benefit icon={<Truck color="#00ffbc" />} title="Free Shipping" text="On all orders over ₹15,000" />
              <Benefit icon={<Sparkles color="#00ffbc" />} title="Fast Turnaround" text="Rush delivery available" />
            </div>
          </div>
        </section>

        {/* EVERYTHING IN THE BOX */}
        <section className="section darkSection">
          <div className="container">
            <div className="sectionHead">
              <div>
                <small>EVERYTHING YOU NEED</small>
                <h2>Right In The Box</h2>
                <p>Unbox. Install. Glow. We provide all the essentials.</p>
              </div>
            </div>
            <div className="boxGrid">
              <img src="/images/whats_in_the_box.webp" alt="What's in the box" />
              <img src="/images/remote_details_01.webp" alt="Remote Details" />
            </div>
          </div>
        </section>

        {/* FOR EVERY SPACE */}
        <section className="section container">
          <div className="sectionHead">
            <div>
              <small>FOR EVERY SPACE &amp; OCCASION</small>
              <h2>Shop by category</h2>
            </div>
          </div>
          <div className="catGrid">
            <CatCard name="Astronaut & Space" href="/category/astronaut-space" icon={Star} />
            <CatCard name="Bars & Pub" href="/category/bars-pub" icon={Sparkles} />
            <CatCard name="Business & Events" href="/category/business" icon={BriefcaseBusiness} />
            <CatCard name="Café & Coffee Shop" href="/category/cafe" icon={Heart} />
            <CatCard name="Gaming" href="/category/gaming" icon={Zap} />
            <CatCard name="Home Decor" href="/category/home-decor" icon={WandSparkles} />
            <CatCard name="Love / Heart" href="/category/love" icon={Heart} />
            <CatCard name="Quotes & Typography" href="/category/quotes" icon={Palette} />
          </div>
        </section>

        <section className="section container">
          <div className="ctaBand container">
            <div><Sparkles /><div><h3>Not sure what to create?</h3><p>Get inspired from our bestsellers.</p></div></div>
            <a href="/collections" className="btn primary">EXPLORE IDEAS <ArrowRight size={16} /></a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}