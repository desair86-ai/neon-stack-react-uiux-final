/**
 * Lightweight, in-memory sliding-window rate limiter for Next.js Route Handlers.
 * Protects sensitive endpoints (auth, checkout, screenshots) from brute-force
 * and automated bot flooding without external dependencies.
 */

export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

const stores = new Map();

export function rateLimit({ windowMs = 60 * 1000, max = 20, name = 'default' }) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name);

  return function check(req) {
    const ip = getClientIp(req);
    const now = Date.now();

    // Prune stale entries if store grows large
    if (store.size > 1000) {
      for (const [key, record] of store.entries()) {
        if (now - record.firstTime > windowMs) {
          store.delete(key);
        }
      }
    }

    const record = store.get(ip);
    if (!record || (now - record.firstTime > windowMs)) {
      store.set(ip, { firstTime: now, count: 1 });
      return { success: true, remaining: max - 1 };
    }

    record.count += 1;
    if (record.count > max) {
      return { success: false, remaining: 0 };
    }

    return { success: true, remaining: max - record.count };
  };
}
