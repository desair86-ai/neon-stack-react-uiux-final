"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Header, Footer } from "./components";
import { getConfiguratorOptions } from "./lib/api";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, ArrowRight, Check,
  Crown, Heart, Minus, Moon, Plus, Ruler, RotateCcw, Smile, Sparkles,
  Star, Sun, Sunset, Trash2, Upload, WandSparkles, Zap
} from "lucide-react";
import "./configurator.css";

const STEPS = ["text", "shapes", "color", "backboard", "hardware"];
const LABELS = {
  text: "TEXT", shapes: "SHAPES", color: "COLOUR", backboard: "BACKBOARD", hardware: "HARDWARE"
};

const FALLBACK = {
  options: {
    colors: [
      { id: "pink", name: "Pink", hex: "#ff2aa8", price: 0 },
      { id: "purple", name: "Purple", hex: "#8d3cff", price: 0 },
      { id: "blue", name: "Blue", hex: "#198cff", price: 0 },
      { id: "cyan", name: "Cyan", hex: "#12dfe5", price: 0 },
      { id: "green", name: "Green", hex: "#63df21", price: 0 },
      { id: "yellow", name: "Yellow", hex: "#ffd11a", price: 0 },
      { id: "orange", name: "Orange", hex: "#ff8618", price: 0 },
      { id: "white", name: "White", hex: "#ffffff", price: 0 }
    ],
    sizes: [
      { id: "small", name: "Small", price: 5600, description: "39.5 × 10 in" },
      { id: "medium", name: "Medium", price: 9100, description: "51.5 × 13 in" },
      { id: "large", name: "Large", price: 11400, description: "63.5 × 15 in" },
      { id: "xl", name: "Extra Large", price: 14800, description: "87.5 × 17 in" }
    ],
    shapes: [
      { id: "heart", name: "Heart", price: 300 },
      { id: "star", name: "Star", price: 300 },
      { id: "lightning", name: "Lightning", price: 300 },
      { id: "crown", name: "Crown", price: 300 },
      { id: "moon", name: "Moon", price: 300 },
      { id: "smile", name: "Smile", price: 300 }
    ],
    backboards: [
      { id: "cut", name: "Cut to Shape", price: 0, description: "Precision-cut backing that follows your neon" },
      { id: "whole", name: "Whole Board / Square", price: 1200, description: "A clean rectangular acrylic backing" },
      { id: "none", name: "No Backing / Minimal", price: 0, description: "Minimal hardware for a floating look" }
    ],
    hardware: [
      { id: "screws", name: "Wall Screws", price: 0, description: "Simple wall-mount hardware" },
      { id: "wire", name: "Hanging Wire", price: 300, description: "For suspended installations" },
      { id: "dimmer", name: "Standard Dimmer", price: 500, description: "Brightness control" },
      { id: "smart", name: "Smart WiFi / Wireless Remote", price: 1000, description: "Smart control and remote" },
      { id: "indoor", name: "Indoor LED", price: 0, description: "For indoor installations" },
      { id: "outdoor", name: "IP67 Waterproof Outdoor", price: 900, description: "For protected outdoor use" }
    ]
  },
  fonts: [
    { id: "neon-script", name: "Neon Script", class: "font-neon-script" },
    { id: "classic", name: "Classic", class: "" }
  ],
  presentation: { text_color_selection: true, effect_selection: true, shape_color_mode: "single" }
};

const BACKGROUNDS = [
  ["Dark Room", "/images/mojo_bg_clean.jpg"],
  ["Living Room", "/images/better_together.jpg"],
  ["Gaming Room", "/images/astro_with_full_moon.png"],
  ["Bedroom", "/images/astro_with_moon.png"],
  ["Cafe", "/images/wings_and_drinks.png"],
  ["Office", "/images/whats_in_the_box.png"],
  ["Concrete Wall", "/images/website_banner_01.png"]
];

const LIGHTING = {
  night: { label: "Dark Room", filter: "brightness(.38) contrast(1.25)" },
  evening: { label: "Cozy Evening", filter: "brightness(.62) contrast(1.1) sepia(.12)" },
  day: { label: "Daytime", filter: "brightness(.95) contrast(1)" }
};

function iconForShape(name, size = 30) {
  const props = { size, strokeWidth: 1.7 };
  const n = String(name || "").toLowerCase();
  if (n.includes("heart")) return <Heart {...props} />;
  if (n.includes("star")) return <Star {...props} />;
  if (n.includes("moon")) return <Moon {...props} />;
  if (n.includes("crown")) return <Crown {...props} />;
  if (n.includes("smile")) return <Smile {...props} />;
  if (n.includes("light") || n.includes("zap")) return <Zap {...props} />;
  return <Sparkles {...props} />;
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function physicalWidth(size) {
  const match = String(size?.description || "").match(/([\d.]+)\s*[×x]/);
  return match ? Number(match[1]) : 50;
}

export function ConfiguratorExperience({ type = "custom_neon" }) {
  const isMojo = type === "mojo_mix";
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("Good Vibes Only");
  const [font, setFont] = useState(null);
  const [align, setAlign] = useState("center");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [multiColor, setMultiColor] = useState(false);
  const [letterColors, setLetterColors] = useState({});
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [backboard, setBackboard] = useState(null);
  const [hardware, setHardware] = useState(null);
  const [background, setBackground] = useState(BACKGROUNDS[0][1]);
  const [wallFile, setWallFile] = useState(null);
  const [mood, setMood] = useState("day");
  const [lightOn, setLightOn] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationInches, setCalibrationInches] = useState("50");
  const [calibrationRatio, setCalibrationRatio] = useState(null);
  const [calibrationWidth, setCalibrationWidth] = useState(300);
  const [scale, setScale] = useState(1);

  const previewRef = useRef(null);
  const textRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getConfiguratorOptions(type)
      .then((data) => {
        if (!alive) return;
        const next = data?.options ? data : FALLBACK;
        const opts = next.options || FALLBACK.options;
        const fonts = next.fonts?.length ? next.fonts : FALLBACK.fonts;
        setConfig(next);
        setFont(fonts[0]);
        setSize(opts.sizes?.[0] || FALLBACK.options.sizes[0]);
        setColor(isMojo ? null : (opts.colors?.[0] || FALLBACK.options.colors[0]));
        setBackboard(opts.backboards?.[0] || FALLBACK.options.backboards[0]);
        setHardware(opts.hardware?.[0] || FALLBACK.options.hardware[0]);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setConfig(FALLBACK);
        setFont(FALLBACK.fonts[0]);
        setSize(FALLBACK.options.sizes[0]);
        setColor(isMojo ? null : FALLBACK.options.colors[0]);
        setBackboard(FALLBACK.options.backboards[0]);
        setHardware(FALLBACK.options.hardware[0]);
        setLoading(false);
      });
    return () => { alive = false; };
  }, [type, isMojo]);

  const options = config?.options || FALLBACK.options;
  const fonts = config?.fonts?.length ? config.fonts : FALLBACK.fonts;
  const presentation = config?.presentation || {};
  const currentStep = STEPS[step];

  const valid = {
    text: text.trim().length > 0 && text.length <= 50 && !!font,
    shapes: true,
    color: isMojo || !!color,
    backboard: !!backboard,
    hardware: !!hardware
  };
  const complete = STEPS.every((item) => valid[item]);

  const price = useMemo(() => {
    let total = Number(size?.price || 0) + Number(backboard?.price || 0) + Number(hardware?.price || 0);
    shapes.forEach((shape) => { total += Number(shape.price || 0); });
    return total;
  }, [size, backboard, hardware, shapes]);

  useEffect(() => {
    const box = previewRef.current;
    const el = textRef.current;
    if (!box || !el) return undefined;

    const measure = () => {
      const textWidth = Math.max(el.scrollWidth, 1);
      const textHeight = Math.max(el.scrollHeight, 1);
      const safeWidth = box.clientWidth * 0.86;
      const safeHeight = box.clientHeight * 0.52;
      let fitted = Math.min(1, safeWidth / textWidth, safeHeight / textHeight);
      if (calibrationRatio) {
        const targetPixels = physicalWidth(size) * calibrationRatio;
        fitted = Math.min(fitted * 2.4, targetPixels / textWidth);
      }
      setScale(Math.max(0.08, Math.min(1.08, fitted)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text, font, size, background, calibrationRatio]);

  function addShape(shape) {
    setShapes((current) => [...current, {
      ...shape,
      uid: `${shape.id}-${Date.now()}-${Math.random()}`,
      position: "left"
    }]);
  }

  function removeShape(uid) {
    setShapes((current) => current.filter((shape) => shape.uid !== uid));
  }

  function updateShape(uid, patch) {
    setShapes((current) => current.map((shape) => shape.uid === uid ? { ...shape, ...patch } : shape));
  }

  function uploadWall(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (wallFile) URL.revokeObjectURL(wallFile);
    const url = URL.createObjectURL(file);
    setWallFile(url);
    setBackground(url);
    setCalibrationRatio(null);
  }

  function chooseBackground(url) {
    if (wallFile) URL.revokeObjectURL(wallFile);
    setWallFile(null);
    setBackground(url);
    setCalibrationRatio(null);
  }

  function reset() {
    if (wallFile) URL.revokeObjectURL(wallFile);
    setText("Good Vibes Only");
    setShapes([]);
    setMultiColor(false);
    setLetterColors({});
    setSelectedLetter(null);
    setBackground(BACKGROUNDS[0][1]);
    setWallFile(null);
    setMood("day");
    setLightOn(true);
    setShowRuler(true);
    setCalibrating(false);
    setCalibrationRatio(null);
    setStep(0);
  }

  function startCalibrationDrag(event) {
    if (!calibrating) return;
    dragRef.current = { startX: event.clientX, startWidth: calibrationWidth };
    window.addEventListener("pointermove", moveCalibration);
    window.addEventListener("pointerup", endCalibration, { once: true });
  }

  function moveCalibration(event) {
    if (!dragRef.current) return;
    const max = (previewRef.current?.clientWidth || 800) * 0.85;
    const nextWidth = dragRef.current.startWidth + event.clientX - dragRef.current.startX;
    setCalibrationWidth(Math.max(80, Math.min(max, nextWidth)));
  }

  function endCalibration() {
    dragRef.current = null;
    window.removeEventListener("pointermove", moveCalibration);
  }

  function setCalibration() {
    const inches = Number(calibrationInches);
    if (inches > 0) {
      setCalibrationRatio(calibrationWidth / inches);
      setCalibrating(false);
    }
  }

  const lighting = LIGHTING[mood];
  const neonColor = color?.hex || "#63df21";
  const textStyle = {
    fontFamily: font?.class || "inherit",
    textAlign: align,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    color: isMojo ? "transparent" : neonColor,
    backgroundImage: isMojo ? "linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)" : undefined,
    WebkitBackgroundClip: isMojo ? "text" : undefined,
    backgroundSize: isMojo ? "200% auto" : undefined,
    animation: isMojo ? "nsSpectrum 3s linear infinite" : undefined,
    opacity: lightOn ? 1 : 0.55,
    textShadow: lightOn ? `0 0 3px ${neonColor}, 0 0 10px ${neonColor}, 0 0 25px ${neonColor}, 0 0 50px ${neonColor}` : "none",
    filter: lightOn ? `drop-shadow(0 0 8px ${neonColor}) drop-shadow(0 0 25px ${neonColor})` : "none"
  };

  if (loading) {
    return <><Header /><main className="ns-config-loading">Loading your neon builder…</main><Footer /></>;
  }

  return (
    <>
      <Header />
      <main className={`ns-configurator ${isMojo ? "ns-mojo" : ""}`}>
        <section className="ns-builder-heading">
          <div className="ns-container">
            <div className="ns-breadcrumb">Home / {isMojo ? "Mojo Mix" : "Custom Neon"}</div>
            <h1>CREATE YOUR <em>{isMojo ? "MOJO MIX" : "CUSTOM NEON"} SIGN</em></h1>
            <p>Design it. See it. Love it. <Heart size={15} /></p>
            <div className="ns-trust-row">
              <span><WandSparkles /> Live Real-time Preview</span>
              <span><Heart /> Custom Made Just For You</span>
              <span><Sparkles /> Premium Quality &amp; Safe</span>
              <span><Star /> Made in India</span>
            </div>
          </div>
        </section>

        <section className="ns-container ns-builder-shell">
          <div className="ns-config-layout">
            <aside className="ns-panel ns-controls">
              <div className="ns-stepper">
                {STEPS.map((item, index) => (
                  <button key={item} className={`${step === index ? "active" : ""} ${valid[item] ? "done" : ""}`} onClick={() => {
                    if (index <= step || STEPS.slice(0, index).every((s) => valid[s])) setStep(index);
                  }}>
                    <span className="ns-step-num">{valid[item] ? <Check size={13} /> : index + 1}</span>
                    <span>{LABELS[item]}</span>
                  </button>
                ))}
              </div>

              <div className="ns-control-body">
                {currentStep === "text" && (
                  <>
                    <div className="ns-field">
                      <label>YOUR TEXT <small>{text.length}/50</small></label>
                      <textarea value={text} maxLength={50} rows={3} onChange={(e) => setText(e.target.value)} />
                    </div>
                    <div className="ns-field">
                      <label>FONT STYLE</label>
                      <select value={font?.id || font?.name || ""} onChange={(e) => setFont(fonts.find((f) => String(f.id || f.name) === e.target.value) || fonts[0])}>
                        {fonts.map((item) => <option key={item.id || item.name} value={item.id || item.name}>{item.name}</option>)}
                      </select>
                    </div>
                    <div className="ns-field">
                      <label>ALIGNMENT</label>
                      <div className="ns-align">
                        <button className={align === "left" ? "selected" : ""} onClick={() => setAlign("left")}><AlignLeft /></button>
                        <button className={align === "center" ? "selected" : ""} onClick={() => setAlign("center")}><AlignCenter /></button>
                        <button className={align === "right" ? "selected" : ""} onClick={() => setAlign("right")}><AlignRight /></button>
                      </div>
                    </div>
                    <div className="ns-field">
                      <label>SIZE</label>
                      <div className="ns-option-list">
                        {options.sizes?.map((item) => (
                          <button key={item.id} className={size?.id === item.id ? "selected" : ""} onClick={() => setSize(item)}>
                            <span><b>{item.name}</b><small>{item.description || ""}</small></span>
                            <strong>{money(item.price)}</strong>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === "shapes" && (
                  <>
                    <div className="ns-section-title"><div><b>ADD NEON SHAPES</b><small>Add one or more decorative elements.</small></div></div>
                    <div className="ns-shape-grid">
                      {options.shapes?.map((item) => <button key={item.id} onClick={() => addShape(item)}><span>{iconForShape(item.name)}</span><small>{item.name}</small></button>)}
                    </div>
                    {shapes.length > 0 && (
                      <div className="ns-added">
                        <label>POSITION YOUR SHAPES</label>
                        {shapes.map((item, index) => (
                          <div className="ns-shape-config" key={item.uid}>
                            <div className="ns-shape-config-top"><span>{iconForShape(item.name, 20)} {item.name} {index + 1}</span><button onClick={() => removeShape(item.uid)}><Trash2 size={14} /></button></div>
                            <div className="ns-position">
                              <button className={item.position === "left" ? "selected" : ""} onClick={() => updateShape(item.uid, { position: "left" })}>LEFT</button>
                              <button className={item.position === "right" ? "selected" : ""} onClick={() => updateShape(item.uid, { position: "right" })}>RIGHT</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {currentStep === "color" && (
                  isMojo ? (
                    <div className="ns-mojo-info">
                      <div className="ns-spectrum-demo" />
                      <h3>MOJO SPECTRUM</h3>
                      <p>Your neon continuously flows through a vibrant multicolour spectrum. No text colour selection is required.</p>
                      <div className="ns-mojo-check"><Check /> Animated multicolour text</div>
                      <div className="ns-mojo-check"><Check /> Smooth colour transition</div>
                    </div>
                  ) : (
                    <>
                      {multiColor && (
                        <div className="ns-field">
                          <label>SELECT A LETTER</label>
                          <div className="ns-letter-picker">{[...text].map((char, index) => char.trim() ? <button key={index} className={selectedLetter === index ? "selected" : ""} onClick={() => setSelectedLetter(index)}>{char}</button> : <span key={index}> </span>)}</div>
                        </div>
                      )}
                      <div className="ns-field">
                        <label>{multiColor && selectedLetter !== null ? "COLOUR FOR SELECTED LETTER" : "TEXT COLOR"}</label>
                        <div className="ns-color-grid">
                          {options.colors?.map((item) => <button key={item.id || item.name} className={color?.id === item.id ? "selected" : ""} style={{ background: item.hex }} aria-label={item.name} onClick={() => {
                            if (multiColor && selectedLetter !== null) setLetterColors((current) => ({ ...current, [selectedLetter]: item }));
                            setColor(item);
                          }} />)}
                        </div>
                      </div>
                      {presentation.text_color_selection !== false && <label className="ns-toggle"><input type="checkbox" checked={multiColor} onChange={(e) => setMultiColor(e.target.checked)} /> Multicolour text</label>}
                    </>
                  )
                )}

                {currentStep === "backboard" && <div className="ns-card-list">{options.backboards?.map((item) => <button key={item.id} className={backboard?.id === item.id ? "selected" : ""} onClick={() => setBackboard(item)}><span><b>{item.name}</b><small>{item.description || ""}</small></span><strong>{Number(item.price || 0) ? `+${money(item.price)}` : "FREE"}</strong></button>)}</div>}

                {currentStep === "hardware" && <div className="ns-card-list">{options.hardware?.map((item) => <button key={item.id} className={hardware?.id === item.id ? "selected" : ""} onClick={() => setHardware(item)}><span><b>{item.name}</b><small>{item.description || ""}</small></span><strong>{Number(item.price || 0) ? `+${money(item.price)}` : "FREE"}</strong></button>)}</div>}
              </div>

              <div className="ns-nav-actions">
                <button className="ns-secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft /> BACK</button>
                {step < STEPS.length - 1 ? <button className="ns-primary" disabled={!valid[currentStep]} onClick={() => setStep((value) => value + 1)}>NEXT STEP <ArrowRight /></button> : <button className="ns-primary" disabled={!complete} onClick={() => alert("Configuration ready. WooCommerce cart wiring is the next integration step.")}>ADD TO CART <ArrowRight /></button>}
              </div>
              <div className="ns-mini-completion">{STEPS.map((item, index) => <span key={item} className={valid[item] ? "done" : index === step ? "current" : ""} />)}</div>
            </aside>

            <div className="ns-preview-column">
              <div className="ns-panel ns-preview">
                <div className="ns-preview-toolbar">
                  <div className="ns-preview-tabs"><button className="active">PREVIEW</button><button>YOUR WALL</button></div>
                  <div className="ns-preview-tools"><button onClick={reset} title="Reset"><RotateCcw size={16} /></button></div>
                </div>

                <div className="ns-preview-studio-toolbar">
                  <div className="ns-lighting-buttons">
                    {Object.entries(LIGHTING).map(([id, item]) => <button key={id} className={mood === id ? "selected" : ""} onClick={() => setMood(id)}>{id === "night" ? <Moon size={14} /> : id === "evening" ? <Sunset size={14} /> : <Sun size={14} />}{item.label}</button>)}
                  </div>
                  <div className="ns-studio-actions">
                    <button className={lightOn ? "selected" : ""} onClick={() => setLightOn((value) => !value)}>{lightOn ? "LIGHT ON" : "LIGHT OFF"}</button>
                    <button className={showRuler ? "selected" : ""} onClick={() => setShowRuler((value) => !value)}><Ruler size={14} /> {showRuler ? "HIDE RULER" : "SHOW RULER"}</button>
                  </div>
                </div>

                <div ref={previewRef} className="ns-canvas" style={{ backgroundImage: `url("${background}")` }}>
                  <img className="ns-canvas-background" src={background} alt="" style={{ filter: lighting.filter }} />
                  <div className="ns-canvas-shade" style={{ opacity: lightOn ? 0.48 : 0.6 }} />

                  {calibrating && (
                    <div className="ns-calibration-panel">
                      <div><b>Calibrate Room Size</b><span>Drag the line to match a known width.</span></div>
                      <input type="number" min="1" value={calibrationInches} onChange={(e) => setCalibrationInches(e.target.value)} />
                      <button onClick={setCalibration}>SET SCALE</button>
                    </div>
                  )}

                  <div className="ns-neon-art">
                    <div ref={textRef} className={`ns-neon-text ${isMojo ? "spectrum" : ""}`} style={textStyle}>
                      {multiColor && !isMojo ? [...text].map((char, index) => <span key={index} style={{ color: (letterColors[index] || color)?.hex || neonColor }}>{char}</span>) : text || "Your Neon"}
                    </div>
                    <div className="ns-art-shapes">
                      {shapes.slice(0, 8).map((item) => <span key={item.uid} className={isMojo ? "spectrum" : ""} style={!isMojo ? { color: neonColor } : undefined}>{iconForShape(item.name, 62)}</span>)}
                    </div>
                    <div className="ns-neon-base-line" style={{ background: neonColor, boxShadow: lightOn ? `0 0 10px ${neonColor}, 0 0 25px ${neonColor}` : "none" }} />
                  </div>

                  {showRuler && (
                    <div className="ns-ruler-overlay">
                      <span>{size?.description || ""}</span>
                    </div>
                  )}

                  {!calibrating && (
                    <button className="ns-calibrate-button" onClick={() => setCalibrating(true)}><Ruler size={15} /> CALIBRATE ROOM SIZE</button>
                  )}

                  {calibrating && <div className="ns-calibration-line" style={{ width: calibrationWidth }} onPointerDown={startCalibrationDrag}><span>{calibrationInches}" reference</span></div>}
                </div>

                <div className="ns-background-picker">
                  <div className="ns-bg-title"><b>CHOOSE A BACKGROUND</b><label><input type="file" accept="image/*" onChange={uploadWall} /><Upload size={14} /> UPLOAD YOUR WALL</label></div>
                  <div className="ns-bg-grid">{BACKGROUNDS.map(([name, url]) => <button key={name} className={background === url ? "selected" : ""} onClick={() => chooseBackground(url)}><img src={url} alt="" /><span>{name}</span>{background === url && <i><Check size={11} /></i>}</button>)}</div>
                </div>
              </div>

              <div className="ns-summary ns-panel">
                <div className="ns-summary-title"><Sparkles /><b>YOUR NEON SIGN SUMMARY</b></div>
                <div className="ns-summary-details">
                  <span>Text <b>{text || "—"}</b></span>
                  <span>Font <b>{font?.name || "—"}</b></span>
                  <span>Colour <b>{isMojo ? "MOJO SPECTRUM" : color?.name || "—"}</b></span>
                  <span>Size <b>{size?.name || "—"}</b></span>
                  <span>Shapes <b>{shapes.length || "None"}</b></span>
                  <span>Board <b>{backboard?.name || "—"}</b></span>
                </div>
                <div className="ns-price"><small>ESTIMATED PRICE</small><strong>{money(price)}</strong><span>Inclusive of all taxes</span></div>
                <button className="ns-cart-cta" disabled={!complete} onClick={() => alert("Configuration ready. WooCommerce cart wiring is the next integration step.")}>ADD TO CART <ArrowRight /></button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
