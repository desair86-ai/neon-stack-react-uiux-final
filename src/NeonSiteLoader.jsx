"use client";

import React from "react";

/**
 * NeonSiteLoader
 * Displays the official "The Neon Stack Icon SVG .svg" inside a glowing
 * dual-gradient rotating neon circle with an optional status label.
 *
 * @param {string} message - Optional status text displayed beneath the spinner
 * @param {boolean} fullScreen - Whether to display as a full-viewport overlay or inline block
 */
export function NeonSiteLoader({
  message = "Loading…",
  fullScreen = false,
}) {
  const containerClass = fullScreen
    ? "ns-site-loader-overlay"
    : "ns-site-loader-inline";

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={message || "Loading"}>
      <div className="ns-site-loader-container">
        <div className="ns-site-loader-ring-wrap">
          {/* Subtle outer glowing orbit */}
          <div className="ns-site-loader-ring-outer" />
          {/* Main rotating neon gradient circle */}
          <div className="ns-site-loader-ring" />
          {/* Centered official Neon Stack Icon */}
          <div className="ns-site-loader-icon-wrap">
            <img
              src="/images/The%20Neon%20Stack%20Icon%20SVG%20.svg"
              alt="The Neon Stack"
              className="ns-site-loader-icon"
              width="68"
              height="68"
              decoding="async"
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = "1";
                  e.currentTarget.src = "/images/The-Neon-Stack-Icon.svg";
                }
              }}
            />
          </div>
        </div>
        {message ? <p className="ns-site-loader-label">{message}</p> : null}
      </div>
    </div>
  );
}

export default NeonSiteLoader;
