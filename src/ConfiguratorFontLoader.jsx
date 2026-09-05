"use client";

import { useEffect } from "react";

function fontUrl(font) {
  return font?.file_url || font?.fileUrl || font?.url || font?.src || font?.source_url || font?.sourceUrl || "";
}

export function ConfiguratorFontLoader() {
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const types = ["custom_neon", "mojo_mix"];
        const responses = await Promise.all(types.map((type) => fetch(`/api/config?configurator=${type}`, { cache: "no-store" }).then((r) => r.ok ? r.json() : null).catch(() => null)));
        const fonts = responses.flatMap((data) => Array.isArray(data?.fonts) ? data.fonts : []);
        const seen = new Set();
        for (const font of fonts) {
          const src = fontUrl(font);
          const family = String(font?.class || font?.family || font?.name || font?.id || "").trim();
          if (!src || !family || seen.has(family) || cancelled) continue;
          seen.add(family);
          try {
            const face = new FontFace(family, `url(${JSON.stringify(src)})`);
            const loaded = await face.load();
            if (!cancelled) document.fonts.add(loaded);
          } catch (error) {
            console.warn("Unable to load configurator font", family, error);
          }
        }
      } catch (error) {
        console.warn("Configurator font loading failed", error);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  return null;
}
