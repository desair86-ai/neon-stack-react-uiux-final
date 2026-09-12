"use client";

// Font loading is intentionally demand-driven.
// We do NOT download the entire font catalogue on startup.
const fontLoadMap = new Map(); // family -> "loaded" | Promise<FontFace>
const preloadMap = new Map();  // family -> <link>
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
  return () => listeners.delete(fn);
}

export function getFontFamilyName(font) {
  return String(
    font?.class ||
    font?.family ||
    font?.name ||
    font?.id ||
    ""
  ).trim();
}

export function fontUrl(font) {
  return (
    font?.file_url ||
    font?.fileUrl ||
    font?.url ||
    font?.src ||
    font?.source_url ||
    font?.sourceUrl ||
    ""
  );
}

function getProxyUrl(font) {
  const src = fontUrl(font);
  return src
    ? `/api/config-font?url=${encodeURIComponent(src)}`
    : "";
}

/**
 * Give one font an explicit browser preload hint.
 * This is mainly used for the font stored in a shared design.
 * The link is same-origin, so the browser can reuse the response when
 * FontFace.load() requests the exact same URL.
 */
export function preloadConfiguratorFont(font, priority = "auto") {
  if (typeof document === "undefined") return null;

  const family = getFontFamilyName(font);
  const proxy = getProxyUrl(font);
  if (!family || !proxy) return null;

  const existing = preloadMap.get(family);
  if (existing) return existing;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.href = proxy;
  link.crossOrigin = "anonymous";

  // fetchpriority is supported by current Chromium/Edge and ignored safely
  // by browsers that do not implement it.
  if (priority === "high" || priority === "low") {
    link.setAttribute("fetchpriority", priority);
  }

  document.head.appendChild(link);
  preloadMap.set(family, link);
  return link;
}

/**
 * Load exactly one font on demand.
 *
 * Requests are deduplicated. A font is downloaded only when it is actually
 * needed by the active sign or by a visible/selected font preview.
 */
export async function loadConfiguratorFont(font, options = {}) {
  if (
    !font ||
    typeof window === "undefined" ||
    !("FontFace" in window)
  ) {
    return null;
  }

  const family = getFontFamilyName(font);
  const src = fontUrl(font);
  if (!family || !src) return null;

  if (fontLoadMap.get(family) === "loaded") return null;
  if (fontLoadMap.has(family)) return fontLoadMap.get(family);

  const priority = options?.priority || "auto";
  if (priority === "high") {
    preloadConfiguratorFont(font, "high");
  }

  const proxy = getProxyUrl(font);
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
      fontLoadMap.delete(family);
      return null;
    });

  fontLoadMap.set(family, promise);
  return promise;
}

export function isFontLoaded(font) {
  const family = getFontFamilyName(font);
  if (!family) return false;
  return fontLoadMap.get(family) === "loaded";
}

// Kept for compatibility with older imports. It intentionally does nothing.
export function loadRemainingFontsProgressive() {
  return;
}

export function ConfiguratorFontLoader() {
  return null;
}
