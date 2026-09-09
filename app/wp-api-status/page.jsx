"use client";
import { useEffect, useState } from 'react';
import { getNeonHealth, getNeonConfig, getNeonConfigVersion, getNeonStackApiBase } from '../../src/api/neonStackApi';

function StatusRow({ label, value, ok }) {
  return (
    <tr style={{ borderBottom: '1px solid #1c212e' }}>
      <td style={{ padding: '10px 16px', color: '#a6a8b3', fontSize: 13, whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ padding: '10px 16px', fontWeight: 600, color: ok === false ? '#ff4d4d' : ok === true ? '#00ffbc' : '#f6f6fa', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {value ?? <span style={{ color: '#555' }}>—</span>}
      </td>
    </tr>
  );
}

function ConfigPanel({ label, data, error, loading }) {
  const cfg = data;
  const opts = cfg?.options || {};
  const pricing = cfg?.pricing || {};
  const presentation = cfg?.presentation || {};
  return (
    <div style={{ background: '#0a0d14', border: '1px solid #1c212e', borderRadius: 12, padding: 24, flex: 1, minWidth: 320 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 15, color: '#00ffbc', letterSpacing: '.06em', fontFamily: 'Poppins' }}>{label}</h2>
      {loading && <p style={{ color: '#a6a8b3', fontSize: 13 }}>Fetching…</p>}
      {error && <p style={{ color: '#ff4d4d', fontSize: 13 }}>Error: {error}</p>}
      {cfg && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <StatusRow label="Configurator ID" value={cfg.configurator} ok />
            <StatusRow label="Name" value={cfg.name} ok />
            <StatusRow label="Enabled" value={String(cfg.enabled)} ok={cfg.enabled} />
            <StatusRow label="Config Revision" value={cfg.config_revision} />
            <StatusRow label="Product ID" value={cfg.product_id ? String(cfg.product_id) : 'NOT SET'} ok={!!cfg.product_id} />
            <StatusRow label="Product SKU" value={cfg.product_sku || 'NOT SET'} ok={!!cfg.product_sku} />
            <StatusRow label="Currency" value={cfg.settings?.currency_label || cfg.settings?.currency} />
            <StatusRow label="Pricing Model" value={pricing.model} />
            <StatusRow label="First Letter Price" value={pricing.first_letter_price != null ? `₹${pricing.first_letter_price}` : null} />
            <StatusRow label="Additional Letter Price" value={pricing.additional_letter_price != null ? `₹${pricing.additional_letter_price}` : null} />
            <StatusRow label="Fonts" value={cfg.fonts?.length ? `${cfg.fonts.length} fonts` : 'None'} ok={cfg.fonts?.length > 0} />
            <StatusRow label="Languages" value={cfg.languages?.length ? cfg.languages.join(', ') : 'None'} />
            <StatusRow label="Sizes" value={opts.sizes?.length ? opts.sizes.map(s => s.name).join(', ') : 'None'} ok={opts.sizes?.length > 0} />
            <StatusRow label="Colours" value={opts.colors?.length ? `${opts.colors.length} colours` : 'None'} />
            <StatusRow label="Backboards" value={opts.backboards?.length ? opts.backboards.map(b => b.name).join(', ') : 'None'} />
            <StatusRow label="Hardware" value={opts.hardware?.length ? opts.hardware.map(h => h.name).join(', ') : 'None'} />
            <StatusRow label="Shapes" value={opts.shapes?.length ? opts.shapes.map(s => s.name).join(', ') : 'None'} />
            <StatusRow label="Presentation Mode" value={presentation.mode || 'standard'} />
            <StatusRow label="Text Colour Selection" value={presentation.text_color_selection != null ? String(presentation.text_color_selection) : 'not set'} />
            <StatusRow label="Text Animation" value={presentation.text_animation || 'none'} />
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function WpApiStatusPage() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [versionData, setVersionData] = useState(null);
  const [customConfig, setCustomConfig] = useState(null);
  const [customError, setCustomError] = useState(null);
  const [customLoading, setCustomLoading] = useState(true);
  const [mojoConfig, setMojoConfig] = useState(null);
  const [mojoError, setMojoError] = useState(null);
  const [mojoLoading, setMojoLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const apiBase = getNeonStackApiBase();
  const wpBase = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_WORDPRESS_REST_URL : 'not set';

  const runChecks = async () => {
    setLastChecked(new Date().toLocaleTimeString());
    setHealthError(null);
    setCustomLoading(true);
    setMojoLoading(true);

    // Health
    try {
      const h = await getNeonHealth();
      setHealth(h);
    } catch (e) {
      setHealthError(e.message);
      setHealth(null);
    }

    // Version
    try {
      const v = await getNeonConfigVersion();
      setVersionData(v);
    } catch { setVersionData(null); }

    // Custom Neon config
    try {
      const c = await getNeonConfig('custom_neon');
      setCustomConfig(c);
      setCustomError(null);
    } catch (e) {
      setCustomError(e.message);
      setCustomConfig(null);
    } finally { setCustomLoading(false); }

    // Mojo Mix config
    try {
      const m = await getNeonConfig('mojo_mix');
      setMojoConfig(m);
      setMojoError(null);
    } catch (e) {
      setMojoError(e.message);
      setMojoConfig(null);
    } finally { setMojoLoading(false); }
  };

  useEffect(() => { runChecks(); }, []);

  const healthy = health && !healthError;

  return (
    <main style={{ minHeight: '100vh', background: '#05060a', color: '#f6f6fa', fontFamily: 'Poppins, DM Sans, sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <small style={{ color: '#00ffbc', fontSize: 13, letterSpacing: '.1em', fontWeight: 600 }}>DEVELOPER TOOL</small>
          <h1 style={{ margin: '8px 0 4px', fontSize: 28, fontFamily: 'Poppins' }}>WordPress API Status</h1>
          <p style={{ color: '#a6a8b3', fontSize: 14, margin: 0 }}>Live connection check against the Neon Stack Configurator v2.3.12 plugin.</p>
        </div>

        {/* Connection summary */}
        <div style={{ background: '#0a0d14', border: `1px solid ${healthy ? '#00ffbc44' : '#ff4d4d44'}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <StatusRow label="NEXT_PUBLIC_WORDPRESS_REST_URL" value={wpBase} ok={!!wpBase && wpBase !== 'not set'} />
              <StatusRow label="API Base" value={apiBase || 'not configured'} ok={!!apiBase} />
              <StatusRow label="Health Endpoint" value={healthy ? `OK — v${health.plugin_version || health.version || '?'}` : healthError || 'Unreachable'} ok={healthy} />
              <StatusRow label="Plugin Name" value={health?.plugin || health?.name} />
              <StatusRow label="Plugin Version" value={health?.plugin_version || health?.version} />
              <StatusRow label="Config Version" value={versionData?.version} />
              <StatusRow label="Config Revision" value={versionData?.config_revision} />
              <StatusRow label="Last Checked" value={lastChecked} />
            </tbody>
          </table>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button onClick={runChecks} style={{ background: 'linear-gradient(90deg,#752eff,#00ffbc)', color: '#000', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '.04em' }}>↻ REFRESH</button>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 22px', border: '1px solid #333', borderRadius: 6, color: '#a6a8b3', fontSize: 13, textDecoration: 'none' }}>← Back to site</a>
          </div>
        </div>

        {/* Per-configurator panels */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ConfigPanel label="custom_neon" data={customConfig} error={customError} loading={customLoading} />
          <ConfigPanel label="mojo_mix" data={mojoConfig} error={mojoError} loading={mojoLoading} />
        </div>

        <div style={{ marginTop: 32, padding: '20px 24px', background: '#0a0d14', border: '1px solid #1c212e', borderRadius: 12 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#00ffbc' }}>Environment Setup</h3>
          <pre style={{ margin: 0, fontSize: 12, color: '#a6a8b3', fontFamily: 'monospace', lineHeight: 1.8 }}>{`# .env.local (Vercel environment variables)
NEXT_PUBLIC_WORDPRESS_REST_URL=https://your-wp-site.com/wp-json

# The React app will call:
# GET  $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/health
# GET  $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/config?configurator=custom_neon
# GET  $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/config?configurator=mojo_mix
# GET  $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/config-version
# POST $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/quote
# POST $NEXT_PUBLIC_WORDPRESS_REST_URL/neon-stack/v2/screenshot`}</pre>
        </div>
      </div>
    </main>
  );
}
