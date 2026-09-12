export function getWordPressBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_WORDPRESS_REST_URL;
  if (fromEnv && fromEnv.trim()) {
    // Normalise: the env value may already include a trailing /wp-json.
    return fromEnv.trim().replace(/\/wp-json\/?$/, '').replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host) return `https://${host}`;
  }
  return '';
}

export function getNeonStackApiBase() {
  const base = getWordPressBaseUrl();
  return base ? `${base}/wp-json/neon-stack/v2` : '';
}

export async function getNeonConfig(configurator = 'custom_neon') {
  if (typeof window !== 'undefined') {
    const proxyUrl = `/api/config?configurator=${encodeURIComponent(configurator)}`;
    const proxyRes = await fetch(proxyUrl, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!proxyRes.ok) throw new Error(`Config fetch failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/config?configurator=${encodeURIComponent(configurator)}`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
  return res.json();
}

export async function getNeonConfigVersion() {
  if (typeof window !== 'undefined') {
    const proxyRes = await fetch('/api/config-version', { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!proxyRes.ok) throw new Error(`Config version fetch failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/config-version`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Config version fetch failed: ${res.status}`);
  return res.json();
}

export async function getNeonQuote(configurator, design) {
  if (typeof window !== 'undefined') {
    const proxyRes = await fetch('/api/quote', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ configurator, design }),
    });
    if (!proxyRes.ok) throw new Error(`Quote failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/quote`;
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ configurator, design }),
  });
  if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
  return res.json();
}

export async function uploadNeonScreenshot(blob) {
  if (typeof window !== 'undefined') {
    const formData = new FormData();
    formData.append('screenshot', blob, 'neon-preview.png');
    const proxyRes = await fetch('/api/screenshot', { method: 'POST', body: formData });
    if (!proxyRes.ok) throw new Error(`Screenshot upload failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/screenshot`;
  const formData = new FormData();
  formData.append('screenshot', blob, 'neon-preview.png');
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`Screenshot upload failed: ${res.status}`);
  return res.json();
}

export async function getNeonHealth() {
  if (typeof window !== 'undefined') {
    const proxyRes = await fetch('/api/health', { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!proxyRes.ok) throw new Error(`Health check failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/health`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function createNeonShare(design) {
  if (typeof window !== 'undefined') {
    const proxyRes = await fetch('/api/share', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ design }),
    });
    if (!proxyRes.ok) throw new Error(`Share creation failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/share`;
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ design }),
  });
  if (!res.ok) throw new Error(`Share creation failed: ${res.status}`);
  return res.json();
}

export async function getNeonShare(token) {
  if (typeof window !== 'undefined') {
    const proxyRes = await fetch(`/api/share/${encodeURIComponent(token)}`, {
      cache: 'default',
      headers: { Accept: 'application/json' },
    });
    if (!proxyRes.ok) throw new Error(`Share fetch failed: ${proxyRes.status}`);
    return proxyRes.json();
  }

  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/share/${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Share fetch failed: ${res.status}`);
  return res.json();
}
