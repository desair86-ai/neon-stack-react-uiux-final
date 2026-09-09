"use client";

import { useEffect, useState } from "react";

export function CursorSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateEnabled = () => setEnabled(pointerQuery.matches && window.innerWidth > 800);
    const updateCursor = (event) => setPosition({ x: event.clientX, y: event.clientY });

    updateEnabled();
    pointerQuery.addEventListener?.('change', updateEnabled);
    window.addEventListener('resize', updateEnabled);
    window.addEventListener('mousemove', updateCursor);

    return () => {
      pointerQuery.removeEventListener?.('change', updateEnabled);
      window.removeEventListener('resize', updateEnabled);
      window.removeEventListener('mousemove', updateCursor);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="cursorSpotlight"
      style={{
        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(103, 0, 226, 0.08), rgba(255, 0, 222, 0.025), transparent 80%)`,
      }}
    />
  );
}