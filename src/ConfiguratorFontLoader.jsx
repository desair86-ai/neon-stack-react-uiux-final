"use client";

// Cache tracking status of each font family:
// Map<familyName, 'loaded' | Promise<FontFace>>
const fontLoadMap = new Map();
const listeners = new Set();

function notifyFontLoaded(family) {
  listeners.forEach((fn) => {
    try {
      fn(family);
    } catch (e) {
      console.error(e);
    }
  });
}

export function onFontLoaded(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getFontFamilyName(font) {
  return String(font?.class || font?.family || font?.name || font?.id || "").trim();
}

export function fontUrl(font) {
  return font?.file_url || font?.fileUrl || font?.url || font?.src || font?.source_url || font?.sourceUrl || "";
}

/**
 * Loads a single configurator font on-demand.
 * Deduplicates requests: if already loaded or loading, reuses state.
 * Returns a Promise that resolves when the font is ready.
 */
export async function loadConfiguratorFont(font) {
  if (!font || typeof window === "undefined" || !("FontFace" in window)) {
    return null;
  }

  const family = getFontFamilyName(font);
  const src = fontUrl(font);

  if (!family || !src) return null;

  // 1. If already successfully loaded, return immediately
  if (fontLoadMap.get(family) === "loaded") {
    return null;
  }

  // 2. If currently in-flight, return the existing loading promise
  if (fontLoadMap.has(family)) {
    return fontLoadMap.get(family);
  }

  // 3. Create and load the font face
  const proxy = `/api/config-font?url=${encodeURIComponent(src)}`;
  const face = new FontFace(family, `url(${JSON.stringify(proxy)})`);

  const promise = face
    .load()
    .then((loadedFace) => {
      document.fonts.add(loadedFace);
      fontLoadMap.set(family, "loaded");
      notifyFontLoaded(family);
      return loadedFace;
    })
    .catch((error) => {
      console.warn(`[FontLoader] Failed to load font "${family}":`, error);
      fontLoadMap.delete(family); // allow retry on next attempt
      return null;
    });

  fontLoadMap.set(family, promise);
  return promise;
}

/**
 * Check if a font family is already loaded.
 */
export function isFontLoaded(font) {
  const family = getFontFamilyName(font);
  if (!family) return false;
  return fontLoadMap.get(family) === "loaded";
}

/**
 * Progressively loads a list of fonts in the background with small delays
 * between requests to avoid saturating network or blocking initial rendering.
 */
let bgQueueActive = false;
let bgTimer = null;

export function loadRemainingFontsProgressive(fonts, priorityFamily, delayMs = 1000) {
  if (typeof window === "undefined" || !Array.isArray(fonts) || !fonts.length) return;
  if (bgQueueActive) return;

  bgQueueActive = true;

  // Filter out priority font and already loaded fonts
  const pending = fonts.filter((f) => {
    const fam = getFontFamilyName(f);
    return fam && fam !== priorityFamily && fontLoadMap.get(fam) !== "loaded";
  });

  let index = 0;
  const concurrency = 2;
  let activeWorkers = 0;

  function pump() {
    while (activeWorkers < concurrency && index < pending.length) {
      const font = pending[index++];
      const fam = getFontFamilyName(font);

      if (fontLoadMap.get(fam) === "loaded") {
        continue;
      }

      activeWorkers++;
      loadConfiguratorFont(font).finally(() => {
        activeWorkers--;
        bgTimer = setTimeout(pump, 80);
      });
    }

    if (index >= pending.length && activeWorkers === 0) {
      bgQueueActive = false;
    }
  }

  // Start progressive loading after initial render has settled
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(
      () => {
        bgTimer = setTimeout(pump, delayMs);
      },
      { timeout: 3000 }
    );
  } else {
    bgTimer = setTimeout(pump, delayMs);
  }
}

/**
 * RootLayout component export: intentionally does NOT download fonts eagerly.
 */
export function ConfiguratorFontLoader() {
  return null;
}
