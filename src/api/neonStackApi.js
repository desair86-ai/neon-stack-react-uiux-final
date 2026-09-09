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
  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/config?configurator=${encodeURIComponent(configurator)}`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
  return res.json();
}

export async function getNeonConfigVersion() {
  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/config-version`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Config version fetch failed: ${res.status}`);
  return res.json();
}

export async function getNeonQuote(configurator, design) {
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
  const base = getNeonStackApiBase();
  if (!base) throw new Error('WordPress API base URL is not configured');
  const url = `${base}/health`;
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}
