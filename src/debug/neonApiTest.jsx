"use client";
// Debug / smoke-test tool for the Neon Stack Configurator Engine v2.3.12 integration.
// Usage: render <NeonApiTest /> anywhere during development (e.g. on /custom-neon in a
// query param ?debug=api). It prints the full WordPress -> React contract so you can
// verify that the plugin is the source of truth before wiring the UI to it.
//
// Run this against the LIVE WordPress site. Do NOT commit it to production routes;
// it is intentionally a throwaway diagnostic.

import { useEffect, useState } from "react";
import {
  getNeonStackApiBase,
  getNeonHealth,
  getNeonConfig,
  getNeonConfigVersion,
} from "../api/neonStackApi";

const CONFIGURATORS = ["custom_neon", "mojo_mix"];

function summarize(name, data) {
  if (!data) return `${name}: (no data)`;
  const lines = [];
  lines.push(`${name}:`);
  lines.push(`  configurator:   ${data?.configurator ?? "-"}`);
  lines.push(`  name:           ${data?.name ?? "-"}`);
  lines.push(`  enabled:        ${data?.enabled ?? "-"}`);
  lines.push(`  product_id:     ${data?.product_id ?? "-"}`);
  lines.push(`  product_sku:    ${data?.product_sku ?? "-"}`);
  lines.push(`  currency_label: ${data?.settings?.currency_label ?? "-"}`);
  lines.push(`  config_revision:${data?.config_revision ?? "-"}`);
  lines.push(`  fonts:          ${Array.isArray(data?.fonts) ? data.fonts.length : "-"}`);
  lines.push(`  languages:      ${Array.isArray(data?.languages) ? data.languages.length : "-"}`);
  lines.push(`  pricing model:  ${data?.pricing?.model ?? "-"}`);
  lines.push(`  option groups:   ${data?.options ? Object.keys(data.options).join(", ") : "-"}`);
  const pres = data?.presentation;
  if (pres) {
    lines.push(`  presentation:`);
    lines.push(`    mode:                  ${pres.mode ?? "-"}`);
    lines.push(`    text_color_selection:  ${pres.text_color_selection ?? "-"}`);
    lines.push(`    effect_selection:      ${pres.effect_selection ?? "-"}`);
    lines.push(`    text_animation:        ${pres.text_animation ?? "-"}`);
    lines.push(`    shape_color_mode:      ${pres.shape_color_mode ?? "-"}`);
  }
  return lines.join("\n");
}

export function NeonApiTest() {
  const [health, setHealth] = useState(null);
  const [version, setVersion] = useState(null);
  const [configs, setConfigs] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const base = getNeonStackApiBase();
        if (!base) throw new Error("WordPress API base URL is not configured");

        const [h, v, ...rest] = await Promise.all([
          getNeonHealth(),
          getNeonConfigVersion(),
          ...CONFIGURATORS.map((c) => getNeonConfig(c)),
        ]);

        if (!active) return;
        setHealth(h);
        setVersion(v);
        setConfigs(
          CONFIGURATORS.reduce(
            (acc, c, i) => ({ ...acc, [c]: rest[i] }),
            {}
          )
        );
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        color: "#00ffbc",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: "24px",
        overflow: "auto",
        zIndex: 99999,
        whiteSpace: "pre",
      }}
    >
      <h2 style={{ color: "#fff" }}>Neon Stack Configurator API Test</h2>
      <p style={{ color: "#8992a5" }}>
        API base: <b style={{ color: "#fff" }}>{getNeonStackApiBase() || "(not configured)"}</b>
      </p>
      {error && <p style={{ color: "#ff65bf" }}>ERROR: {error}</p>}

      <h3 style={{ color: "#752eff", marginTop: "20px" }}>Health</h3>
      <pre style={{ color: "#fff" }}>{JSON.stringify(health, null, 2)}</pre>

      <h3 style={{ color: "#752eff", marginTop: "20px" }}>Config Version</h3>
      <pre style={{ color: "#fff" }}>{JSON.stringify(version, null, 2)}</pre>

      {CONFIGURATORS.map((c) => (
        <div key={c}>
          <h3 style={{ color: "#752eff", marginTop: "20px" }}>{c}</h3>
          <pre style={{ color: "#fff" }}>{summarize(c, configs[c])}</pre>
        </div>
      ))}
    </div>
  );
}