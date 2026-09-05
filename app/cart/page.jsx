import { Header, Footer } from "../../src/components";
export default function Page() { 
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Your Cart</h1>
        <p style={{ color: '#888' }}>Cart integration coming soon.</p>
      </main>
      <Footer />
    </>
  ); 
}
