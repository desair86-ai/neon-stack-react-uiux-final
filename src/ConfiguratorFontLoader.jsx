"use client";

// Tracks only fonts that have actually been requested.
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

/**
 * Load exactly one font on demand.
 *
 * A font is downloaded only when the UI actually needs it:
 * - the active/selected font
 * - a font whose preview card is visible in the picker
 * - a font the user hovers/selects as a fallback
 *
 * Requests are deduplicated so the same font cannot be downloaded twice
 * concurrently.
 */
export async function loadConfiguratorFont(font) {
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

  // Already loaded.
  if (fontLoadMap.get(family) === "loaded") {
    return null;
  }

  // Already loading. Reuse the same request.
  if (fontLoadMap.has(family)) {
    return fontLoadMap.get(family);
  }

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
      console.warn(
        `[FontLoader] Failed to load font "${family}":`,
        error
      );
      fontLoadMap.delete(family);
      return null;
    });

  fontLoadMap.set(family, promise);
  return promise;
}

/**
 * True only when this font has actually been loaded by this loader.
 */
export function isFontLoaded(font) {
  const family = getFontFamilyName(font);
  if (!family) return false;
  return fontLoadMap.get(family) === "loaded";
}

/**
 * Kept as a compatibility export because older callers may import it.
 *
 * IMPORTANT:
 * This no longer downloads the remaining font catalogue in the background.
 * Fonts are instead loaded by ConfiguratorExperience as preview cards enter
 * the visible area of the font picker.
 */
export function loadRemainingFontsProgressive() {
  return;
}

/**
 * RootLayout component export: intentionally does not download fonts.
 */
export function ConfiguratorFontLoader() {
  return null;
}
