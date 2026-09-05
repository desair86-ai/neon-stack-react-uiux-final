"use client";
import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(148px, 22vw, 260px)",
  gap = 0.05,
  loop = true
}) {
  const count = slides.length;
  const frameRef = useRef(null);
  const cardRefs = useRef([]);
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef(null);
  const dragRef = useRef(null);
  const [selected, setSelected] = useState(0);

  const indexAt = useCallback((pos) => ((Math.round(pos) % count) + count) % count, [count]);

  const paint = useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
      
      // Update selected card styling for the glow effect
      if (index === Math.round(posRef.current)) {
         card.style.border = "1px solid #752eff";
         card.style.boxShadow = "0 0 30px rgba(117, 46, 255, 0.4)";
      } else {
         card.style.border = "1px solid #222";
         card.style.boxShadow = "0 10px 15px rgba(0,0,0,0.5)";
      }
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = useCallback((target) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    targetRef.current = target;
    setSelected(indexAt(target));
    const step = () => {
      const remaining = target - posRef.current;
      if (Math.abs(remaining) < 0.0004) {
        posRef.current = target;
        paint();
        rafRef.current = null;
        return;
      }
      posRef.current += remaining * 0.16;
      paint();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [indexAt, paint]);

  const clamp = useCallback((pos) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))), [count, loop]);
  
  const goTo = useCallback((index) => {
    const target = loop ? index + Math.round((targetRef.current - index) / count) * count : index;
    settle(clamp(target));
  }, [clamp, count, loop, settle]);

  const nudge = useCallback((by) => settle(clamp(Math.round(targetRef.current) + by)), [clamp, settle]);

  const onPointerDown = (event) => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = { id: event.pointerId, x: event.clientX, pos: posRef.current, v: 0, t: performance.now() };
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div className="cf-carousel-container" style={{ "--cf-card": cardWidth, width: "100%", margin: "40px 0" }}>
      <div style={{ position: "relative" }}>
        <div
          ref={frameRef} tabIndex={0}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
          }}
          style={{ cursor: "grab", overflow: "hidden", padding: "40px 0", outline: "none", perspective: `calc(var(--cf-card) * ${perspective})`, touchAction: "pan-y" }}
        >
          <div style={{ position: "relative", userSelect: "none", height: "calc(var(--cf-card) * 1.4)", transformStyle: "preserve-3d" }}>
            {slides.map((slide, index) => (
              <div
                key={index} ref={(node) => { cardRefs.current[index] = node; }}
                style={{
                  position: "absolute", left: "50%", top: 0, display: "flex", flexDirection: "column", overflow: "hidden",
                  borderRadius: "16px", background: "#070910", transition: "border 0.3s, box-shadow 0.3s",
                  willChange: "transform", width: "var(--cf-card)", height: "calc(var(--cf-card) * 1.4)"
                }}
              >
                <div style={{ width: "100%", height: "60%", position: "relative" }}>
                  <img src={slide.src} alt={slide.alt} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "15px", textAlign: "center" }}>
                  <p style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", margin: "0 0 8px 0" }}>{slide.title}</p>
                  <p style={{ fontSize: "12px", color: "#999", margin: 0, lineHeight: 1.3 }}>{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <button className="cf-nav prev" onClick={() => nudge(-1)}><ChevronLeft size={24}/></button>
        <button className="cf-nav next" onClick={() => nudge(1)}><ChevronRight size={24}/></button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
        {slides.map((_, idx) => (
           <button key={idx} onClick={() => goTo(idx)} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", border: "none", opacity: idx === selected ? 1 : 0.3, cursor: "pointer", transition: "opacity 0.2s" }} />
        ))}
      </div>
    </div>
  );
}
