"use client";

// Cache tracking status of each font family:
// Map<familyName, 'loaded' | Promise<FontFace>>
const fontLoadMap = new Map();

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

  // 2. Check if browser already has this font registered
  if (document.fonts?.check && document.fonts.check(`1em "${family}"`)) {
    fontLoadMap.set(family, "loaded");
    return null;
  }

  // 3. If currently in-flight, return the existing loading promise
  if (fontLoadMap.has(family)) {
    return fontLoadMap.get(family);
  }

  // 4. Create and load the font face
  const proxy = `/api/config-font?url=${encodeURIComponent(src)}`;
  const face = new FontFace(family, `url(${JSON.stringify(proxy)})`);

  const promise = face
    .load()
    .then((loadedFace) => {
      document.fonts.add(loadedFace);
      fontLoadMap.set(family, "loaded");
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
  if (!family || typeof document === "undefined") return false;
  if (fontLoadMap.get(family) === "loaded") return true;
  return Boolean(document.fonts?.check && document.fonts.check(`1em "${family}"`));
}

/**
 * Progressively loads a list of fonts in the background with delays
 * between requests to avoid saturating network or blocking the main thread.
 */
let bgQueueActive = false;
let bgTimer = null;

export function loadRemainingFontsProgressive(fonts, priorityFamily, delayMs = 1500) {
  if (typeof window === "undefined" || !Array.isArray(fonts) || !fonts.length) return;
  if (bgQueueActive) return;

  bgQueueActive = true;

  // Filter out the priority font and already loaded fonts
  const pending = fonts.filter((f) => {
    const fam = getFontFamilyName(f);
    return fam && fam !== priorityFamily && fontLoadMap.get(fam) !== "loaded";
  });

  let index = 0;
  function processNext() {
    if (index >= pending.length) {
      bgQueueActive = false;
      return;
    }

    const font = pending[index++];
    const fam = getFontFamilyName(font);

    // If already loaded in the meantime, skip
    if (fontLoadMap.get(fam) === "loaded") {
      processNext();
      return;
    }

    loadConfiguratorFont(font).finally(() => {
      // Pause 200ms between fonts so network is always free for user clicks/interactions
      bgTimer = setTimeout(processNext, 200);
    });
  }

  // Delay starting background loading so initial page render and preview are fast
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(
      () => {
        bgTimer = setTimeout(processNext, delayMs);
      },
      { timeout: 4000 }
    );
  } else {
    bgTimer = setTimeout(processNext, delayMs);
  }
}

/**
 * RootLayout component export: intentionally does NOT download fonts eagerly.
 */
export function ConfiguratorFontLoader() {
  return null;
}
