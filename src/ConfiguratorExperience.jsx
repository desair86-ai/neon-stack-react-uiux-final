"use client";
import React,{useEffect,useMemo,useRef,useState} from "react";
import {Footer, MobileMenu} from "./components";
import {AlignCenter,AlignLeft,AlignRight,ArrowLeft,ArrowRight,Check,ChevronDown,Crown,Heart,Menu,Minus,Moon,Plus,Ruler,RotateCcw,Share2,Smile,Sparkles,Star,Sun,Sunset,Trash2,Upload,WandSparkles,X,Zap} from "lucide-react";
import "./configurator.css";
import { useNeonConfig, useNeonConfigRevision } from "./hooks/useNeonConfig";
import { useNeonQuote } from "./hooks/useNeonQuote";
import { uploadNeonScreenshot, createNeonShare, getNeonShare } from "./api/neonStackApi";
import { loadConfiguratorFont, onFontLoaded } from "./ConfiguratorFontLoader";
const STEPS=["text","size","shapes","color","backboard","hardware"],LABELS={text:"TEXT",size:"SIZE",shapes:"SHAPES",color:"COLOUR",backboard:"BACKBOARD",hardware:"HARDWARE"};
const COLORS=[{id:"pink",name:"Pink",hex:"#ff2aa8"},{id:"purple",name:"Purple",hex:"#8d3cff"},{id:"blue",name:"Blue",hex:"#198cff"},{id:"cyan",name:"Cyan",hex:"#12dfe5"},{id:"green",name:"Green",hex:"#63df21"},{id:"yellow",name:"Yellow",hex:"#ffd11a"},{id:"orange",name:"Orange",hex:"#ff8618"},{id:"white",name:"White",hex:"#fff"}];
const BACKGROUNDS=[
  ["Brick Wall","/images/backgrounds/brick wall.webp"],
  ["Office 1","/images/backgrounds/office 1.webp"],
  ["Bedroom 1","/images/backgrounds/bedroom 1.webp"],
  ["Bedroom 2","/images/backgrounds/bedroom 2.webp"],
  ["Bedroom 3","/images/backgrounds/bedroom 3.webp"],
  ["Home Gym 1","/images/backgrounds/homegym 1.webp"],
  ["Home Gym 2","/images/backgrounds/homegym 2.webp"],
  ["Kids Room 1","/images/backgrounds/kidsroom 1.webp"],
  ["Kids Room 2","/images/backgrounds/kidsroom 2.webp"],
  ["Kids Room 3","/images/backgrounds/kidsroom 3.webp"],
  ["Kids Room 4","/images/backgrounds/kidsroom 4.webp"],
  ["Cafe 1","/images/backgrounds/cafe1.webp"],
  ["Cafe 2","/images/backgrounds/cafe 2.webp"],
  ["Cafe 3","/images/backgrounds/cafe 3.webp"],
  ["Bar 1","/images/backgrounds/bar 1.webp"],
  ["Bar 2","/images/backgrounds/bar 2.webp"]
];
const LIGHTING={night:{label:"Dark Room",filter:"brightness(.38) contrast(1.25)"},evening:{label:"Cozy Evening",filter:"brightness(.62) contrast(1.1) sepia(.12)"},day:{label:"Daytime",filter:"brightness(.95) contrast(1)"}};
const money=v=>`₹${Number(v||0).toLocaleString("en-IN")}`;
const physicalWidth=s=>{const m=String(s?.description||"").match(/([\d.]+)\s*[×x]/);return m?Number(m[1]):50};
const physicalHeight=s=>{const m=String(s?.description||"").match(/[×x]\s*([\d.]+)/);return m?Number(m[1]):10};
const fontFamily=f=>f?.class||f?.family||f?.name||"inherit";
function shapeIcon(name,size=28){const p={size,strokeWidth:1.7},n=String(name||"").toLowerCase();if(n.includes("heart"))return <Heart {...p}/>;if(n.includes("star"))return <Star {...p}/>;if(n.includes("moon"))return <Moon {...p}/>;if(n.includes("crown"))return <Crown {...p}/>;if(n.includes("smile"))return <Smile {...p}/>;if(n.includes("light"))return <Zap {...p}/>;return <Sparkles {...p}/>}
export function ConfiguratorExperience({type="custom_neon"}){
  const mojo=type==="mojo_mix";
  const { config: wpConfig, revision, loading, error: configError, disabled: configDisabled, refetch } = useNeonConfig(type);
  const { revision: liveRevision, version } = useNeonConfigRevision(type, 30000);
  const { pricing, loading: pricingLoading, quote, debouncedQuote } = useNeonQuote(type);
  const [shareLoading, setShareLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(new URLSearchParams(window.location.search).get('share'));
    }
    return false;
  });
  const [step,setStep]=useState(0),[text,setText]=useState("The Neon Stack"),[font,setFont]=useState(null),[fontReadyCount,setFontReadyCount]=useState(0),[align,setAlign]=useState("center"),[size,setSize]=useState(null),[color,setColor]=useState(null),[isMulti,setIsMulti]=useState(false),[letterColors,setLetterColors]=useState({}),[selectedLetter,setSelectedLetter]=useState(null),[shapes,setShapes]=useState([]),[backboard,setBackboard]=useState(null),[hardware,setHardware]=useState(null),[background,setBackground]=useState(BACKGROUNDS[0][1]),[wallFile,setWallFile]=useState(null),[mood,setMood]=useState("day"),[lightOn,setLightOn]=useState(true),[showRuler,setShowRuler]=useState(true),[calibrating,setCalibrating]=useState(false),[calibrationInches,setCalibrationInches]=useState("50"),[calibrationRatio,setCalibrationRatio]=useState(null),[calibrationWidth,setCalibrationWidth]=useState(295),[calibrationPos,setCalibrationPos]=useState({x:.5,y:.52}),[signPos,setSignPos]=useState({x:.5,y:.5}),[fontSize,setFontSize]=useState(80),[bounds,setBounds]=useState(null),[notification,setNotification]=useState(null),[sharing,setSharing]=useState(false);
  const previewRef=useRef(null),textRef=useRef(null),sharedDesignLoadedRef=useRef(false),sharePromiseRef=useRef(null);

  const [, setFontUpdateTicker] = useState(0);

  // Subscribe to font loading completions so font picker previews update live
  useEffect(() => {
    return onFontLoaded(() => {
      setFontUpdateTicker(t => t + 1);
    });
  }, []);

  // On-demand font loading: when active font changes, load it immediately and trigger re-measure
  useEffect(() => {
    if (!font) return;
    let active = true;
    loadConfiguratorFont(font).then((loaded) => {
      if (active && loaded) {
        setFontReadyCount(c => c + 1);
      }
    });
    return () => { active = false; };
  }, [font]);


  // Start fetching share token immediately on mount in parallel with wpConfig!
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = new URLSearchParams(window.location.search).get('share');
    if (token && !sharePromiseRef.current) {
      console.log("[NEON SHARE] token detected", token);
      sharePromiseRef.current = getNeonShare(token).catch(err => {
        console.error("[NEON SHARE] parallel fetch error:", err);
        return null;
      });
    }
  }, []);

  useEffect(() => {
    if (!wpConfig || typeof window === 'undefined') return;
    if (sharedDesignLoadedRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('share');

    const o = wpConfig.options || {};
    const fs = wpConfig.fonts?.length ? wpConfig.fonts : [];

    if (!token) {
      // Normal visit: initialize with WordPress defaults
      sharedDesignLoadedRef.current = true;
      const defaultFont = fs[0] || null;
      setFont(defaultFont);
      if (defaultFont) {
        loadConfiguratorFont(defaultFont);
      }
      setSize(prev => {
        const sizes = o.sizes || [];
        if (prev && sizes.find(s => s.id === prev.id)) return prev;
        return sizes[0] || null;
      });
      setColor(mojo ? null : (o.colors?.[0] || null));
      setBackboard(null);
      setHardware(null);
      setShareLoading(false);
      return;
    }

    sharedDesignLoadedRef.current = true;
    let isCancelled = false;

    (async () => {
      try {
        const sharePromise = sharePromiseRef.current || getNeonShare(token);
        const res = await sharePromise;
        console.log("[NEON SHARE] response", res);

        if (isCancelled || !res || !res.success || !res.design) {
          // If share fetch failed or was invalid, fallback to defaults
          if (!isCancelled) {
            setFont(fs[0] || null);
            setSize(o.sizes?.[0] || null);
            setColor(mojo ? null : (o.colors?.[0] || null));
            setBackboard(null);
            setHardware(null);
            setShareLoading(false);
          }
          return;
        }

        // Check if design belongs to a different configurator
        const shareType = res.configurator || res.design?.configurator;
        if (shareType && shareType !== type) {
          const targetPath = shareType === 'mojo_mix' ? '/mojo-mix' : '/custom-neon';
          window.location.href = `${targetPath}?share=${encodeURIComponent(token)}`;
          return;
        }

        const d = res.design;
        console.log("[NEON SHARE] restoring design", d);

        // 1. Restore text
        if (typeof d.text === 'string') {
          setText(d.text);
        }

        // 2. Restore font
        const fontKey = d.fontId || d.font;
        let chosenFont = fs[0] || null;
        if (fontKey) {
          const rawFk = typeof fontKey === 'object' ? (fontKey.id || fontKey.name) : String(fontKey);
          const cleanFk = String(rawFk).toLowerCase().trim().replace(/[\s_-]+/g, '');
          const matchedFont = fs.find(f => {
            const fId = String(f.id || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
            const fName = String(f.name || '').toLowerCase().trim().replace(/[\s_-]+/g, '');
            return fId === cleanFk || fName === cleanFk || f.id === rawFk || f.name?.toLowerCase() === String(rawFk).toLowerCase();
          });
          if (matchedFont) {
            chosenFont = matchedFont;
          }
        }
        setFont(chosenFont);
        if (chosenFont) {
          await loadConfiguratorFont(chosenFont);
        }

        // 3. Restore size
        const sizeKey = typeof d.size === 'object' ? (d.size?.id || d.size?.name) : d.size;
        if (sizeKey) {
          const rawSk = String(sizeKey).toLowerCase().trim();
          const matchedSize = (o.sizes || []).find(s => {
            const sId = String(s.id || '').toLowerCase().trim();
            const sName = String(s.name || '').toLowerCase().trim();
            return sId === rawSk || sName === rawSk || sId.replace(/_/g, '') === rawSk.replace(/_/g, '') || sName.startsWith(rawSk);
          });
          if (matchedSize) {
            setSize(matchedSize);
          } else {
            setSize(o.sizes?.[0] || null);
          }
        } else {
          setSize(o.sizes?.[0] || null);
        }

        // 4. Restore color (for Custom Neon)
        if (!mojo) {
          const colorsList = o.colors?.length ? o.colors : COLORS;
          const colorKey = typeof d.color === 'object' ? (d.color?.id || d.color?.name || d.color?.hex) : d.color;
          const textColorKey = d.textColor;
          let matchedColor = null;

          if (colorKey) {
            const rawCk = String(colorKey).toLowerCase().trim();
            matchedColor = colorsList.find(c => 
              String(c.id || '').toLowerCase() === rawCk || 
              String(c.name || '').toLowerCase() === rawCk || 
              (c.hex && c.hex.toLowerCase() === rawCk)
            );
          }
          if (!matchedColor && textColorKey) {
            const rawTk = String(textColorKey).toLowerCase().trim();
            matchedColor = colorsList.find(c => 
              c.hex && c.hex.toLowerCase() === rawTk
            );
          }
          setColor(matchedColor || colorsList[0] || null);
        }

        // 5. Restore backboard
        // BACKBOARD IS IMPORTANT:
        // If sharedDesign.backboard is "cut_to_shape", select Cut to Shape.
        // If "whole_board", select Whole Board / Square.
        // If "no_backing", select No Backing / Minimal.
        if (d.backboard) {
          const rawBb = typeof d.backboard === 'object' ? (d.backboard?.id || d.backboard?.name) : String(d.backboard);
          const bbKey = String(rawBb).toLowerCase().trim();
          const backboards = o.backboards || [];

          let matchedBackboard = backboards.find(b => 
            b.id?.toLowerCase() === bbKey || 
            b.name?.toLowerCase() === bbKey
          );

          if (!matchedBackboard) {
            if (bbKey.includes('cut')) {
              matchedBackboard = backboards.find(b => b.id === 'cut_to_shape' || b.name?.toLowerCase().includes('cut'));
            } else if (bbKey.includes('whole') || bbKey.includes('square')) {
              matchedBackboard = backboards.find(b => b.id === 'whole_board' || b.name?.toLowerCase().includes('whole') || b.name?.toLowerCase().includes('square'));
            } else if (bbKey.includes('no_backing') || bbKey.includes('minimal') || bbKey.includes('none')) {
              matchedBackboard = backboards.find(b => b.id === 'no_backing' || b.name?.toLowerCase().includes('no back') || b.name?.toLowerCase().includes('minimal'));
            }
          }

          if (matchedBackboard) {
            setBackboard(matchedBackboard);
          }
        }

        // 6. Restore hardware
        if (d.hardware) {
          const rawHw = typeof d.hardware === 'object' ? (d.hardware?.id || d.hardware?.name) : String(d.hardware);
          const hwKey = String(rawHw).toLowerCase().trim();
          const hardwares = o.hardware || [];

          let matchedHardware = hardwares.find(h => 
            h.id?.toLowerCase() === hwKey || 
            h.name?.toLowerCase() === hwKey
          );

          if (!matchedHardware) {
            if (hwKey.includes('wifi') || hwKey.includes('remote')) {
              matchedHardware = hardwares.find(h => h.id === 'smart_wifi' || h.name?.toLowerCase().includes('wifi'));
            } else if (hwKey.includes('screw') || hwKey.includes('drill')) {
              matchedHardware = hardwares.find(h => h.id === 'wall_screws' || h.name?.toLowerCase().includes('screw'));
            } else if (hwKey.includes('wire') || hwKey.includes('hang')) {
              matchedHardware = hardwares.find(h => h.id === 'hanging_wire' || h.name?.toLowerCase().includes('wire'));
            } else if (hwKey.includes('dimmer')) {
              matchedHardware = hardwares.find(h => h.id === 'standard_dimmer' || h.name?.toLowerCase().includes('dimmer'));
            } else if (hwKey.includes('waterproof') || hwKey.includes('outdoor') || hwKey.includes('ip67')) {
              matchedHardware = hardwares.find(h => h.id === 'ip67' || h.name?.toLowerCase().includes('waterproof'));
            } else if (hwKey.includes('indoor')) {
              matchedHardware = hardwares.find(h => h.id === 'indoor' || h.name?.toLowerCase().includes('indoor'));
            }
          }

          if (matchedHardware) {
            setHardware(matchedHardware);
          }
        }

        // 7. Restore alignment
        if (d.align && ['left', 'center', 'right'].includes(d.align)) {
          setAlign(d.align);
        }

        // 8. Restore mood
        if (d.mood && LIGHTING[d.mood]) {
          setMood(d.mood);
        }

        // 9. Restore background
        if (d.background && BACKGROUNDS.some(b => b[1] === d.background)) {
          setBackground(d.background);
        }

        // 10. Restore multi-color and letterColors
        if (typeof d.isMulti === 'boolean') {
          setIsMulti(d.isMulti);
        }
        if (d.letterColors && typeof d.letterColors === 'object') {
          setLetterColors(d.letterColors);
        }

        // 11. Restore shapes
        if (Array.isArray(d.shapes) && d.shapes.length > 0) {
          const colorsList = o.colors?.length ? o.colors : COLORS;
          const restoredShapes = d.shapes.map((s, idx) => {
            const shapeColorKey = typeof s.color === 'object' ? (s.color?.id || s.color?.name || s.color?.hex) : s.color;
            let matchedShapeColor = null;
            if (shapeColorKey) {
              const rawSck = String(shapeColorKey).toLowerCase().trim();
              matchedShapeColor = colorsList.find(c => 
                String(c.id || '').toLowerCase() === rawSck || 
                String(c.name || '').toLowerCase() === rawSck ||
                (c.hex && c.hex.toLowerCase() === rawSck)
              );
            }
            if (!matchedShapeColor && s.colorObj) {
              matchedShapeColor = s.colorObj;
            }

            return {
              id: s.id,
              name: s.name,
              uid: s.uid || `${s.id}-${Date.now()}-${idx}-${Math.random()}`,
              position: s.position || (idx % 2 === 0 ? "left" : "right"),
              color: matchedShapeColor || colorsList[0] || COLORS[0],
              price: s.price || 0,
            };
          });
          setShapes(restoredShapes);
        } else if (Array.isArray(d.shapes)) {
          setShapes([]);
        }

        console.log("[NEON SHARE] restored");
      } catch (err) {
        console.error("[NEON SHARE] error restoring design:", err);
      } finally {
        if (!isCancelled) {
          setShareLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [wpConfig, type, mojo]);
  const options=wpConfig?.options||{},fonts=wpConfig?.fonts?.length?wpConfig.fonts:[],presentation=wpConfig?.presentation||{},current=STEPS[step],baseShapeColors=presentation.shape_color_options?.length?presentation.shape_color_options:(options.colors?.length?options.colors:COLORS),shapeColors=mojo?[{id:"mojo",name:"Mojo Mix (Animated)",hex:"linear-gradient(135deg, #ff007b, #00d4ff)"},...baseShapeColors]:baseShapeColors;
  const valid={text:Boolean(text.trim())&&Boolean(font),size:Boolean(size),shapes:true,color:mojo||Boolean(color),backboard:Boolean(backboard),hardware:Boolean(hardware)},complete=STEPS.every(k=>valid[k]);
  const clientPrice=useMemo(()=>{
    const billableLetters=(text||"").match(/[\p{L}\p{N}]/gu)?.length||0;
    const sizePrice=billableLetters>0
      ? Number(size?.first_letter_price||0)+Math.max(0,billableLetters-1)*Number(size?.additional_letter_price||0)
      : 0;
    return sizePrice+Number(backboard?.price||0)+Number(hardware?.price||0)+shapes.reduce((n,s)=>n+Number(s.price||0),0);
  },[text,size,backboard,hardware,shapes]);
  const serverPrice = pricing?.unit_price ?? pricing?.final_unit_price ?? null;
  const displayPrice = serverPrice ?? clientPrice;
  const linesArray = (text || "").split('\n');
  const linesCount = Math.max(1, linesArray.length);
  const baseW = physicalWidth(size), baseH = physicalHeight(size);
  const maxLineW = Math.max(...linesArray.map(line => {
    const c = line.replace(/\s/g, '').length;
    const s = (line.match(/ /g) || []).length;
    return (c * (baseW/12)) + (s * 1.75);
  }));
  const signW = Math.max(baseW/12, maxLineW) + (shapes.length * 6);
  const signH = (linesCount * baseH) + ((linesCount - 1) * 3);

  // WordPress config can change without a React deploy. Poll the revision and
  // auto-refetch the authoritative configuration when the admin updates it.
  useEffect(() => {
    if (!liveRevision || !revision) return;
    if (liveRevision !== revision) {
      refetch();
    }
  }, [liveRevision, revision, refetch]);
  useEffect(()=>{const box=previewRef.current;if(!box)return;const fit=()=>{const probe=document.createElement("span"),cs=textRef.current?getComputedStyle(textRef.current):null;
   const leftCount=shapes.filter(s=>s.position==="left").length,rightCount=shapes.filter(s=>s.position==="right").length;
   const leftPad=leftCount?(0.6+(leftCount-1)*0.9+0.5):0,rightPad=rightCount?(0.6+(rightCount-1)*0.9+0.5):0;
   probe.style.cssText=`position:fixed;left:-99999px;top:-99999px;visibility:hidden;white-space:pre;display:inline-block;font-family:${JSON.stringify(fontFamily(font))};font-weight:${cs?.fontWeight||"400"};letter-spacing:${cs?.letterSpacing||"normal"};line-height:1.02;padding-left:${leftPad}em;padding-right:${rightPad}em;`;
   probe.textContent=text||"Preview";document.body.appendChild(probe);const sIdx=options?.sizes?.findIndex(s=>s.id===size?.id);const sizeRatios=[0.75,1.0,1.25,1.5];const ratio=(sIdx!==undefined&&sIdx>=0&&sIdx<sizeRatios.length)?sizeRatios[sIdx]:(physicalHeight(size)?physicalHeight(size)/13:1.0);const lines=String(text||"").split("\n").length;const isDesktop=typeof window!=="undefined"?window.innerWidth>800:true;const hardMaxW=isDesktop?(box.clientWidth*0.68):(box.clientWidth*0.70);const hardMaxH=isDesktop?(box.clientHeight*0.45/lines):(box.clientHeight*0.48/lines);const targetW=Math.min(hardMaxW,Math.max(60,box.clientWidth*(isDesktop?0.48:0.50)*ratio));const targetH=Math.min(hardMaxH,Math.max(28,(box.clientHeight*(isDesktop?0.32:0.34)/lines)*ratio));let low=6,high=200;for(let i=0;i<20;i++){const mid=(low+high)/2;probe.style.fontSize=`${mid}px`;if(probe.scrollWidth<=targetW&&probe.scrollHeight<=targetH)low=mid;else high=mid}setFontSize(Math.max(6,Math.floor(low)));document.body.removeChild(probe)};fit();const ro=new ResizeObserver(fit);ro.observe(box);return()=>ro.disconnect()},[text,font,size,shapes,options,fontReadyCount]);
  useEffect(()=>{const box=previewRef.current,el=textRef.current;if(!box||!el)return;const update=()=>{const a=box.getBoundingClientRect(),r=el.getBoundingClientRect();setBounds({left:r.left-a.left,top:r.top-a.top,width:r.width,height:r.height})};update();const ro=new ResizeObserver(update);ro.observe(el);ro.observe(box);return()=>ro.disconnect()},[fontSize,text,align,signPos,shapes]);
  useEffect(()=>{
    // Do not call the quote endpoint until the design contains every required
    // selection. During a shared-link restore React applies state asynchronously;
    // firing here with only text/font/size produces a 400 from WordPress.
    if(!wpConfig || !text.trim() || !size || !font || !backboard || !hardware) return;

    const design={
      text:text||"",
      fontId:font?.id||font?.name,
      language:"english",
      size:size?.id||size?.name,
      textColor:mojo?"#ff007b":(color?.hex||"#fff"),
      // glowStyle is intentionally omitted here. The WordPress configurator
      // currently exposes steady/pulse/flash/chase, not "classic".
      // Sending the old "classic" value causes the quote endpoint to return 400.
      colors:color ? [{id:color.id,name:color.name,hex:color.hex}] : [],
      shapes:shapes.map(s=>({id:s.id,name:s.name,position:s.position,color:s.color?.id||s.color?.name||"white"})),
      backboard:backboard?.id||backboard?.name,
      hardware:hardware?.id||hardware?.name
    };

    debouncedQuote(design,250);
  },[type,text,font,size,color,shapes,backboard,hardware,mojo,wpConfig,debouncedQuote]);
  const addShape=s=>setShapes(prev=>{const l=prev.filter(x=>x.position==="left").length,r=prev.filter(x=>x.position==="right").length;return [...prev,{...s,uid:`${s.id}-${Date.now()}-${Math.random()}`,position:l<=r?"left":"right",color:shapeColors[0]||COLORS[0]}]});
  const removeShape=uid=>setShapes(prev=>prev.filter(s=>s.uid!==uid));
  const updateShape=(uid,patch)=>setShapes(prev=>prev.map(s=>s.uid===uid?{...s,...patch}:s));
  const uploadWall=e=>{const f=e.target.files?.[0];if(!f)return;if(wallFile)URL.revokeObjectURL(wallFile);const u=URL.createObjectURL(f);setWallFile(u);setBackground(u);setCalibrationRatio(null)};
  const chooseBackground=u=>{if(wallFile)URL.revokeObjectURL(wallFile);setWallFile(null);setBackground(u);setCalibrationRatio(null)};
  const nextBg = () => { const idx = BACKGROUNDS.findIndex(b => b[1] === background); chooseBackground(BACKGROUNDS[(Math.max(0, idx) + 1) % BACKGROUNDS.length][1]); };
  const prevBg = () => { const idx = BACKGROUNDS.findIndex(b => b[1] === background); chooseBackground(BACKGROUNDS[(Math.max(0, idx) - 1 + BACKGROUNDS.length) % BACKGROUNDS.length][1]); };
  const reset=()=>{
    if(wallFile)URL.revokeObjectURL(wallFile);
    setText("The Neon Stack");
    setShapes([]);
    setBackground(BACKGROUNDS[0][1]);
    setWallFile(null);
    setMood("day");
    setLightOn(true);
    setShowRuler(true);
    setCalibrating(false);
    setCalibrationRatio(null);
    setCalibrationWidth(295);
    setCalibrationPos({x:.5,y:.52});
    setSignPos({x:.5,y:.5});
    setStep(0);
    setIsMulti(false);
    setLetterColors({});
    setSelectedLetter(null);
    setColor(options.colors?.[0]||COLORS[0]);
    if (typeof window !== 'undefined' && window.location.search.includes('share=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };
  const dragSign=e=>{if(calibrating)return;e.preventDefault();const box=previewRef.current?.getBoundingClientRect();if(!box)return;const sx=e.clientX,sy=e.clientY,ox=signPos.x,oy=signPos.y;const move=ev=>setSignPos({x:Math.max(.08,Math.min(.92,ox+(ev.clientX-sx)/box.width)),y:Math.max(.12,Math.min(.88,oy+(ev.clientY-sy)/box.height))});const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)};
  const dragCalibration=e=>{if(!calibrating)return;e.preventDefault();const box=previewRef.current?.getBoundingClientRect();if(!box)return;const sx=e.clientX,sy=e.clientY,ox=calibrationPos.x,oy=calibrationPos.y;const move=ev=>setCalibrationPos({x:Math.max(.08,Math.min(.92,ox+(ev.clientX-sx)/box.width)),y:Math.max(.08,Math.min(.88,oy+(ev.clientY-sy)/box.height))});const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)};
  const setCalibration=()=>{const inches=Number(calibrationInches);if(inches>0)setCalibrationRatio(calibrationWidth/inches);setCalibrating(false);};
  const neonColor=color?.hex||"#63df21",lighting=LIGHTING[mood],leftShapes=shapes.filter(s=>s.position==="left"),rightShapes=shapes.filter(s=>s.position==="right");
  const cutToShapeColor = '#b7b8c2';
  const darkenHex=h=>{if(!h||!h.startsWith("#"))return "#1a1a24";let r=parseInt(h.slice(1,3),16)*0.2,g=parseInt(h.slice(3,5),16)*0.2,b=parseInt(h.slice(5,7),16)*0.2;return `#${Math.floor(r).toString(16).padStart(2,'0')}${Math.floor(g).toString(16).padStart(2,'0')}${Math.floor(b).toString(16).padStart(2,'0')}`};
  const getShadow=c=>"none";
  const textStyle={fontFamily:fontFamily(font),fontSize:`${fontSize}px`,lineHeight:1.02,whiteSpace:"pre",display:"inline-block",textAlign:align,color:mojo?"transparent":(isMulti?undefined:(lightOn?neonColor:darkenHex(neonColor))),backgroundImage:mojo?"linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)":undefined,WebkitBackgroundClip:mojo?"text":undefined,backgroundSize:mojo?"300% 100%":undefined,animation:mojo?"nsMojoSpectrum 3s linear infinite":undefined,textShadow:mojo?"none":(isMulti?undefined:getShadow(neonColor)),filter:"none",opacity:lightOn?1:.9};
  const renderText=()=>{if(mojo||!isMulti)return text||"Preview";return (text||"Preview").split("").map((char,i)=>{const c=letterColors[i]||color,cHex=lightOn?(c?.hex||"#63df21"):darkenHex(c?.hex||"#63df21");return <span key={i} onClick={(e)=>{if(isMulti){e.stopPropagation();setSelectedLetter(i)}}} style={{color:cHex,textShadow:getShadow(cHex),cursor:isMulti?"pointer":"inherit",display:"inline-block",transform:isMulti&&selectedLetter===i?"scale(1.1)":"none",transition:"transform 0.2s",zIndex:isMulti&&selectedLetter===i?10:1,position:"relative"}}>{char}</span>})};
  const shapePosition=(s,side,index)=>{
     const offsetGap=0.6+index*0.9;
     const isShapeMojo = mojo && (!s.color || s.color.id === 'mojo');
     const finalShapeColor = lightOn ? (s.color?.hex||neonColor) : darkenHex(s.color?.hex||neonColor);
     return {
       position:"absolute",
       top:"50%",
       left:side==="left"?`calc(0% - ${offsetGap}em)`:`calc(100% + ${offsetGap}em)`,
       color: isShapeMojo ? (lightOn ? "#ff007b" : "#4a0024") : finalShapeColor,
       animation: isShapeMojo && lightOn ? "nsMojoSpectrumColor 3s linear infinite" : undefined,
       opacity:lightOn?1:.9,
       transform:"translate(-50%,-50%)",
       fontSize:Math.max(30,fontSize*.5),
       filter: isShapeMojo && lightOn ? "drop-shadow(0 0 2px #fff) drop-shadow(0 0 7px currentColor)" : "none",
       textShadow:"none",
       display:"flex",
       alignItems:"center",
       justifyContent:"center"
     };
  };
  const ruler=useMemo(()=>{if(!bounds)return null;const gap=Math.max(44,Math.min(78,fontSize*.55)),left=bounds.left-leftShapes.length*gap-gap/2,right=bounds.left+bounds.width+rightShapes.length*gap+gap/2,top=bounds.top-Math.min(24,fontSize*.1),bottom=bounds.top+bounds.height+Math.min(24,fontSize*.1);return {left:Math.max(8,left),top:Math.max(8,top),width:Math.max(100,right-left),height:Math.max(70,bottom-top)}},[bounds,leftShapes.length,rightShapes.length,fontSize]);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const designPayload = {
        configurator: type,
        text: text || "",
        fontId: font?.id || font?.name,
        font: font?.id || font?.name,
        language: "english",
        size: size?.id || size?.name,
        textColor: mojo ? "#ff007b" : (color?.hex || "#fff"),
        color: mojo ? "mojo_mix" : (color?.id || color?.name),
        isMulti,
        letterColors,
        shapes: shapes.map(s => ({
          id: s.id,
          name: s.name,
          position: s.position,
          color: s.color?.id || s.color?.name || "white",
          colorObj: s.color,
          price: s.price || 0,
        })),
        backboard: backboard?.id || backboard?.name,
        hardware: hardware?.id || hardware?.name,
        align,
        mood,
        background: wallFile ? BACKGROUNDS[0][1] : background,
      };

      const result = await createNeonShare(designPayload);
      if (result?.success && result?.token) {
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(result.token)}`;
        let copied = false;
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            copied = true;
          }
        } catch (clipErr) {
          console.warn("Clipboard copy failed, fallback prompt", clipErr);
        }

        setNotification({
          title: "Link Copied!",
          message: copied
            ? "Your persistent neon design link has been copied to your clipboard. Anyone opening this link will see your exact custom neon design!"
            : `Here is your shareable link:\n${shareUrl}`,
          actionLabel: "GOT IT"
        });
      } else {
        setNotification({
          title: "Share Error",
          message: result?.message || result?.error || "Could not generate share link. Please try again.",
          actionLabel: "CLOSE"
        });
      }
    } catch (err) {
      console.error("Error creating share:", err);
      setNotification({
        title: "Share Error",
        message: "Failed to generate share link. Please try again later.",
        actionLabel: "CLOSE"
      });
    } finally {
      setSharing(false);
    }
  };

  const handleAddToCart = async () => {
     if (complete) {
       const woocommerce = {
         product_id: wpConfig?.product_id,
         sku: wpConfig?.product_sku,
         ...(wpConfig?.woocommerce || {})
       };
       const productId = Number(wpConfig?.product_id) || Number(woocommerce?.product_id);
       if (!Number.isInteger(productId) || productId < 1) {
         setNotification({ title: "Configuration Notice", message: "This configurator is not connected to a WooCommerce product yet.", actionLabel: "GOT IT" });
         return;
       }

       // Show loading indicator on button
       const btn = document.querySelector('.ns-add-to-cart-btn');
       if (btn) btn.innerHTML = 'UPLOADING PREVIEW...';
       try {
         let screenshotToken = null;
         let cartThumb = background;
         if (previewRef.current) {
           try {
             if (mojo && textRef.current) {
               textRef.current.classList.remove('spectrum');
               textRef.current.style.setProperty('color', '#ff007b', 'important');
               textRef.current.style.setProperty('background-image', 'none', 'important');
               textRef.current.style.setProperty('-webkit-background-clip', 'initial', 'important');
             }

             const html2canvas = (await import('html2canvas')).default;
             
             // Generate high-res blob for WordPress
             const screenshotCanvasOptions = {
               useCORS: true,
               scale: 2,
               backgroundColor: null,
               // html2canvas does not reliably render SVG/CSS filters. The live
               // configurator uses an SVG filter for the cut-to-shape board,
               // so make a screenshot-safe version of that layer in the clone.
               onclone: (clonedDoc) => {
                 const cutBoard = clonedDoc.querySelector('.ns-cut-to-shape-board');
                 if (cutBoard) {
                   cutBoard.style.filter = 'none';
                   cutBoard.style.opacity = '1';
                   cutBoard.style.color = '#b7b8c2';
                   cutBoard.style.webkitTextFillColor = '#b7b8c2';
                   cutBoard.style.webkitTextStroke = '10px #b7b8c2';
                   cutBoard.style.paintOrder = 'stroke fill';
                   cutBoard.style.textShadow = '0 4px 8px rgba(0,0,0,0.18)';

                   // Force the duplicated text/shapes used for the backing to
                   // use the board colour so inline neon colours do not leak
                   // into the screenshot.
                   cutBoard.querySelectorAll('*').forEach((el) => {
                     el.style.color = '#b7b8c2';
                     el.style.webkitTextFillColor = '#b7b8c2';
                     if (el.tagName === 'SPAN') {
                       el.style.webkitTextStroke = '10px #b7b8c2';
                       el.style.paintOrder = 'stroke fill';
                       el.style.textShadow = 'none';
                     }
                   });
                 }

                 // Whole-board is already a normal HTML layer. Preserve it in
                 // the screenshot clone, above the room and below the neon.
                 const wholeBoard = clonedDoc.querySelector('.ns-backboard-visualizer');
                 if (wholeBoard) {
                   wholeBoard.style.zIndex = '1';
                   wholeBoard.style.display = 'block';
                 }
               }
             };

             const canvas = await html2canvas(previewRef.current, screenshotCanvasOptions);
             const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
             
             // Generate crisp base64 for local cart UI
             const tinyCanvas = await html2canvas(previewRef.current, {
               ...screenshotCanvasOptions,
               scale: 1.5
             });
             cartThumb = tinyCanvas.toDataURL('image/png', 0.9);
             
             if (mojo && textRef.current) {
               textRef.current.classList.add('spectrum');
               textRef.current.style.removeProperty('color');
               textRef.current.style.removeProperty('background-image');
               textRef.current.style.removeProperty('-webkit-background-clip');
             }
             
             try {
               const result = await uploadNeonScreenshot(blob);
               if (result.success && result.token) {
                 screenshotToken = result.token;
               } else {
                 console.error("Failed to save neon preview:", result);
               }
             } catch (error) {
               console.error("Failed to save neon preview:", error);
             }
           } catch(e) {
             console.error("Canvas/Upload error", e);
           }
         }
         
         const item = {
           id: Date.now(),
           name: text || "Custom Neon",
           type: type === "mojo_mix" ? "Mojo Mix" : "Custom Neon",
           configurator: type,
           product_id: productId,
           product_sku: woocommerce?.sku || null,
           price: displayPrice,
           qty: 1,
           size: size?.name,
           color: mojo ? "Mojo Spectrum" : (color?.name || "Multi-color"),
           font: font?.name,
           neon_stack: {
             configurator: type,
             text,
             font: font?.id || font?.name,
             size: size?.id || size?.name,
             color: mojo ? "mojo_mix" : (color?.id || color?.name),
             shapes,
             backboard: backboard?.id || backboard?.name,
             hardware: hardware?.id || hardware?.name,
           },
           screenshot_token: screenshotToken,
           image: cartThumb
         };
         item.neon_stack.screenshot_token = screenshotToken;
         const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
         const existing = cart.find(x => x.name === item.name && x.type === item.type && x.size === item.size && x.color === item.color && x.font === item.font && x.screenshot_token === item.screenshot_token);
         if (existing) existing.qty = (existing.qty || 1) + 1;
         else cart.push(item);
         localStorage.setItem('ns_cart', JSON.stringify(cart));
         window.dispatchEvent(new Event('cartUpdated'));
       } catch (err) {
         console.error("Cart error", err);
       }
       if (btn) btn.innerHTML = 'ADD TO CART';
       window.location.href='/cart';
     } else {
       const LABELS = { text: 'TEXT', size: 'SIZE', color: 'COLOUR', backboard: 'BACKBOARD', hardware: 'HARDWARE' };
       const missing = STEPS.find(k => !valid[k]);
       let msg = "Please complete all configuration steps to proceed.";
       let targetStep = 0;
       if (missing === 'text') { msg = "Please enter your custom text to design your sign."; targetStep = 0; }
       if (missing === 'size') { msg = "Please select a size for your neon sign."; targetStep = 1; }
       if (missing === 'color') { msg = "Please choose a colour for your neon sign."; targetStep = 3; }
       if (missing === 'backboard') { msg = "Please select a backboard style."; targetStep = 4; }
       if (missing === 'hardware') { msg = "Please choose your power & hardware option."; targetStep = 5; }
       setNotification({
         title: "Almost There!",
         message: msg,
         step: targetStep,
         actionLabel: missing ? `CHOOSE ${LABELS[missing] || "OPTION"}` : "GOT IT"
       });
     }
   };


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const neonContent = (
    <div ref={textRef} className={`ns-neon-text${mojo?" spectrum":""}`} style={{...textStyle,position:"relative",pointerEvents:"auto",cursor:isMulti?"inherit":"grab",userSelect:"none"}} onPointerDown={e=>{if(!isMulti) dragSign(e)}}>
      {leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}
      {renderText()}
      {rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}
    </div>
  );

  if(loading || shareLoading)return <main className="ns-config-loading">Loading your neon builder…</main>;
  if(configError)return <main className="ns-config-loading">Unable to load configurator. Please refresh or try again later.</main>;
  if(configDisabled)return <main className="ns-config-loading">This configurator is currently unavailable.</main>;

  return <main className={`ns-configurator${mojo?" ns-mojo":""}`}>
    {mobileMenuOpen && <MobileMenu close={()=>setMobileMenuOpen(false)} onMouseLeave={()=>setMobileMenuOpen(false)}/>}
    <div className="ns-builder-sticky-header">
      <div className="ns-header-left" style={{display:'flex', alignItems:'center', gap:'20px', flexShrink:0}}>
         <button className="btn ns-config-hamburger" onMouseEnter={()=>setMobileMenuOpen(true)} onClick={()=>setMobileMenuOpen(true)} style={{padding:'12px 20px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(135deg, #752eff, #00ffbc) border-box', border:'1px solid transparent', borderRadius:'8px', color:'#fff', cursor:'pointer', transition:'0.2s', display:'flex', alignItems:'center', justifyContent:'center'}}><Menu size={24}/></button>
         <a href="/"><img src="/images/The Neon Stack Logo SVG.svg" alt="The Neon Stack" style={{height:'54px'}} className="svg-flicker"/></a>
      </div>
      <div className="ns-header-center-tools" style={{display:'flex', alignItems:'center', gap:'24px'}}>
          <div className="ns-header-mood-group" style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <button onClick={()=>setMood("night")} title="Dark Room" style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:mood==="night"?'#fff':'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><Moon size={12}/> <span className="ns-tool-label-full">Dark Room</span><span className="ns-tool-label-short">Dark</span></button>
            <button onClick={()=>setMood("evening")} title="Cozy Evening" style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:mood==="evening"?'#fff':'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><Sunset size={12}/> <span className="ns-tool-label-full">Cozy Evening</span><span className="ns-tool-label-short">Cozy</span></button>
            <button onClick={()=>setMood("day")} title="Daytime" style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:mood==="day"?'#fff':'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><Sun size={12}/> <span className="ns-tool-label-full">Daytime</span><span className="ns-tool-label-short">Day</span></button>
          </div>
          <div className="ns-header-action-group" style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <button onClick={()=>setLightOn(v=>!v)} title={`Light ${lightOn?'on':'off'}`} style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:lightOn?'#fff':'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><Zap size={12}/> <span className="ns-tool-label-full">Light {lightOn?'on':'off'}</span><span className="ns-tool-label-short">Light</span></button>
            <button onClick={()=>setShowRuler(v=>!v)} title={`${showRuler?'Hide':'Show'} ruler`} style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:showRuler?'#fff':'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><Ruler size={12}/> <span className="ns-tool-label-full">{showRuler?'Hide':'Show'} ruler</span><span className="ns-tool-label-short">Ruler</span></button>
            <button onClick={handleShare} disabled={sharing} title="Share Design" style={{padding:'5px 14px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:'#fff', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:sharing?'wait':'pointer'}}><Share2 size={12}/> <span>{sharing?'Sharing...':'Share'}</span></button>
            <button onClick={reset} title="Reset Design" style={{padding:'5px 10px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'999px', color:'#b8bfd8', fontSize:'11px', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer'}}><RotateCcw size={12}/></button>
          </div>
      </div>
      <div className="ns-header-right-cart" style={{display:'flex', alignItems:'center', gap:'20px', flexShrink:0}}>
           <div className="ns-header-price-block" style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
             <span style={{fontSize:'12px', color:'#a6a8b3'}}>{serverPrice ? 'Price' : 'Estimated Price'}</span>
             <strong style={{fontSize:'22px', color:'#00ffbc'}}>{money(displayPrice)}{pricingLoading ? '...' : ''}</strong>
           </div>
        <button className="ns-add-to-cart-btn" onClick={handleAddToCart} style={{
          padding:'12px 32px', 
          fontSize:'15px', 
          fontWeight:700, 
          borderRadius:'50px', 
          background: complete ? 'linear-gradient(90deg, #98eccb, #7f5ef9)' : '#2a3040', 
          color: complete ? '#000' : '#8992a5', 
          border:'none', 
          cursor:'pointer', 
          letterSpacing:'1px',
          transition:'0.3s'
        }}>ADD TO CART</button>
      </div>
    </div>
    
    <section className="ns-champ-container" style={{display:'flex', flex:1, height: 'calc(100vh - 70px)', overflow:'hidden'}}>
      
      {/* 1. NARROW SIDEBAR */}
      <aside className="ns-champ-sidebar" style={{width:'80px', flexShrink:0, background:'#05060a', borderRight:'1px solid #161a23', display:'flex', flexDirection:'column', overflowY:'auto'}}>
         <button className={`ns-champ-tab ${step===0?'active':''}`} onClick={()=>setStep(0)} style={{padding:'20px 0', border:'none', background:step===0?'#0a0d14':'transparent', color:step===0?'#00ffbc':'#8992a5', borderRight:step===0?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <WandSparkles size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Create<br/>Own</span>
         </button>
         <button className={`ns-champ-tab ${step===1?'active':''}`} onClick={()=>setStep(1)} style={{padding:'20px 0', border:'none', background:step===1?'#0a0d14':'transparent', color:step===1?'#00ffbc':'#8992a5', borderRight:step===1?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Ruler size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Select<br/>Size</span>
         </button>
         <button className={`ns-champ-tab ${step===2?'active':''}`} onClick={()=>setStep(2)} style={{padding:'20px 0', border:'none', background:step===2?'#0a0d14':'transparent', color:step===2?'#00ffbc':'#8992a5', borderRight:step===2?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Sparkles size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Neon<br/>Shapes</span>
         </button>
         <button className={`ns-champ-tab ${step===3?'active':''}`} onClick={()=>setStep(3)} style={{padding:'20px 0', border:'none', background:step===3?'#0a0d14':'transparent', color:step===3?'#00ffbc':'#8992a5', borderRight:step===3?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Sunset size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Color</span>
         </button>
         <button className={`ns-champ-tab ${step===4?'active':''}`} onClick={()=>setStep(4)} style={{padding:'20px 0', border:'none', background:step===4?'#0a0d14':'transparent', color:step===4?'#00ffbc':'#8992a5', borderRight:step===4?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Moon size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Back<br/>Board</span>
         </button>
         <button className={`ns-champ-tab ${step===5?'active':''}`} onClick={()=>setStep(5)} style={{padding:'20px 0', border:'none', background:step===5?'#0a0d14':'transparent', color:step===5?'#00ffbc':'#8992a5', borderRight:step===5?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Zap size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Poppins', fontWeight:600}}>Power &<br/>Hardw.</span>
         </button>
      </aside>

      {/* 2. CONTROLS PANEL */}
      <aside className="ns-champ-controls" style={{width:'340px', flexShrink:0, background:'#0a0d14', borderRight:'1px solid #161a23', overflowY:'auto', padding:'25px 20px'}}>
         {step===0 && <div className="ns-champ-panel">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h2 style={{fontSize:'16px', fontWeight:800, margin:0, color:'#fff', fontFamily:'Poppins'}}>CREATE YOUR OWN {valid.text&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
              <button onClick={handleShare} disabled={sharing} title="Share Design" style={{padding:'4px 10px', background:'linear-gradient(#05060a, #05060a) padding-box, linear-gradient(90deg, #00ffbc, #8b4cff) border-box', border:'1px solid transparent', borderRadius:'6px', color:'#00ffbc', fontSize:'11px', display:'flex', alignItems:'center', gap:'5px', cursor:sharing?'wait':'pointer', fontWeight:600}}><Share2 size={12}/> {sharing?'Sharing...':'Share'}</button>
            </div>
            <div className="ns-field"><label>YOUR TEXT <small>{text.length}/50</small></label><textarea value={text} maxLength={50} rows={3} onChange={e=>setText(e.target.value)}/><small style={{display:"block",marginTop:6,color:"#8992a5"}}>Press Enter only when you want another line.</small></div>
            <div className="ns-field ns-font-field" style={{position:'relative'}}>
               <label>FONT STYLE <small>{fonts.length} Fonts</small></label>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#05060a',border:'1px solid #752eff',padding:'14px 16px',borderRadius:'6px'}}>
                  <span style={{fontFamily: fontFamily(font), fontSize:'20px', color: '#fff'}}>{font?.name || "Select Font"}</span>
                <ChevronDown size={18} color="#b8bfd8" style={{transform:'rotate(180deg)'}}/>
               </div>
               <div 
                    className="ns-custom-scroll ns-font-picker-list"
                    onMouseEnter={() => { /* intentionally do not preload fonts */ }}
                    onTouchStart={() => { /* intentionally do not preload fonts */ }}
               >
                    {fonts.map(f => (
                    <button 
                      type="button" 
                      key={f.id||f.name} 
                      onPointerEnter={() => loadConfiguratorFont(f)}
                      onClick={() => { setFont(f); loadConfiguratorFont(f); }} 
                      style={{background:font?.name===f.name?'#161a23':'#05060a',border:font?.name===f.name?'1px solid #8b4cff':'1px solid #161a23',borderRadius:'4px',padding:'14px 4px',cursor:'pointer',color:font?.name===f.name?'#00ffbc':'#fff',textAlign:'center',transition:'0.2s',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'55px'}}
                    >
                          <span style={{fontFamily: fontFamily(f), fontSize:'18px'}}>{f.name}</span>
                       </button>
                    ))}
               </div>
            </div>
            <div className="ns-field"><label>ALIGNMENT</label><div className="ns-align"><button className={align==="left"?"selected":""} onClick={()=>setAlign("left")}><AlignLeft/></button><button className={align==="center"?"selected":""} onClick={()=>setAlign("center")}><AlignCenter/></button><button className={align==="right"?"selected":""} onClick={()=>setAlign("right")}><AlignRight/></button></div></div>
            <button className="btn primary" onClick={()=>setStep(1)} style={{width:'100%', marginTop:20}}>NEXT: SELECT SIZE</button>
         </div>}
         
         {step===1 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Poppins'}}>SELECT SIZE</h2>
            <div className="ns-field"><label>SIZE</label><div className="ns-option-list">{options.sizes?.map(s=><button key={s.id} className={size?.id===s.id?"selected":""} onClick={()=>setSize(s)}><span><b>{s.name}</b><small>{s.description}</small></span></button>)}</div></div>
            <button className="btn primary" onClick={()=>setStep(2)} style={{width:'100%', marginTop:20}}>NEXT: NEON SHAPES</button>
         </div>}

         {step===2 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Poppins'}}>NEON SHAPES {valid.shapes&&shapes.length>0&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-section-title"><div><small>Each shape has its own colour and position.</small></div></div><div className="ns-shape-list">{options.shapes?.map(s=>{const count=shapes.filter(x=>x.id===s.id).length;return <div className="ns-shape-row" key={s.id}><span className="ns-shape-label">{shapeIcon(s.name,24)}<b>{s.name}</b></span><button className="ns-icon-btn" onClick={()=>addShape(s)}><Plus size={16}/></button><span className="ns-count">{count}</span><button className="ns-icon-btn" onClick={()=>{const last=[...shapes].reverse().find(x=>x.id===s.id);if(last)removeShape(last.uid)}}><Minus size={16}/></button></div>})}</div>{shapes.length>0&&<div className="ns-shape-configs"><h3>POSITION &amp; COLOUR</h3>{shapes.map((s,i)=><div className="ns-shape-config" key={s.uid}><div className="ns-shape-config-top"><b>{s.name} {i+1}</b><button className="ns-icon-btn" onClick={()=>removeShape(s.uid)}><Trash2 size={15}/></button></div><div className="ns-position"><button className={s.position==="left"?"selected":""} onClick={()=>updateShape(s.uid,{position:"left"})}>Left</button><button className={s.position==="right"?"selected":""} onClick={()=>updateShape(s.uid,{position:"right"})}>Right</button></div><div className="ns-mini-color-row">{shapeColors.map(c=><button key={c.id||c.name} className={s.color?.id===c.id?"selected":""} style={{background:c.hex}} onClick={()=>updateShape(s.uid,{color:c})} title={c.name}/>)}</div></div>)}</div>}
            <button className="btn primary" onClick={()=>setStep(3)} style={{width:'100%', marginTop:20}}>NEXT: COLOR</button>
         </div>}

         {step===3 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Poppins'}}>COLOR {valid.color&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            {!mojo&&<div className="ns-field"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><label style={{margin:0}}>TEXT COLOUR</label><button onClick={()=>{setIsMulti(!isMulti);if(!isMulti&&selectedLetter===null)setSelectedLetter(0)}} style={{background:isMulti?"#8b4cff":"transparent",color:isMulti?"#fff":"#8b4cff",border:"1px solid #8b4cff",borderRadius:6,fontSize:9,padding:"4px 8px",fontWeight:800,cursor:"pointer"}}>{isMulti?"SINGLE COLOUR":"MULTI COLOUR"}</button></div>{isMulti&&<div style={{background:"#0a0d14",padding:12,borderRadius:8,marginBottom:15,border:"1px solid #2a3040"}}><div style={{fontSize:10,color:"#aeb5c4",marginBottom:10}}>Click a letter below, then choose a colour.</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(text||"Preview").split("").map((char,i)=>{if(char.trim()==="")return null;const isSel=selectedLetter===i,c=letterColors[i]||color,cHex=c?.hex||"#63df21";return <button key={i} onClick={()=>setSelectedLetter(i)} style={{width:32,height:32,borderRadius:6,background:isSel?"#752eff":"#161a24",border:isSel?"1px solid #9a6cff":"1px solid #333",color:isSel?"#fff":cHex,fontSize:14,fontWeight:"bold",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{char}</button>})}</div></div>}<div className="ns-color-grid">{(options.colors?.length?options.colors:COLORS).map(c=>{const isSelected=isMulti?letterColors[selectedLetter]?.id===c.id:color?.id===c.id;return <button key={c.id||c.name} className={isSelected?"selected":""} style={{background:c.hex}} onClick={()=>{if(isMulti){if(selectedLetter!==null)setLetterColors(prev=>({...prev,[selectedLetter]:c}))}else{setColor(c)}}} title={c.name}/>})}</div></div>}
            {mojo&&<div className="ns-field"><label>MOJO SPECTRUM</label><p style={{color:"#aeb5c4",lineHeight:1.6}}>Mojo Mix uses a continuous moving multicolour spectrum. The text and shapes animate independently from Custom Neon colours.</p></div>}
            <button className="btn primary" onClick={()=>setStep(4)} style={{width:'100%', marginTop:20}}>NEXT: BACKBOARD</button>
         </div>}

         {step===4 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Poppins'}}>BACKBOARD {valid.backboard&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-field"><div className="ns-option-list">{options.backboards?.map(x=><button key={x.id} className={backboard?.id===x.id?"selected":""} onClick={()=>setBackboard(x)}><span><b>{x.name}</b></span><strong>{money(x.price)}</strong></button>)}</div></div>
            <button className="btn primary" onClick={()=>setStep(5)} style={{width:'100%', marginTop:20}}>NEXT: HARDWARE</button>
         </div>}

         {step===5 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Poppins'}}>POWER & HARDWARE {valid.hardware&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-field"><div className="ns-option-list">{options.hardware?.map(x=><button key={x.id} className={hardware?.id===x.id?"selected":""} onClick={()=>setHardware(x)}><span><b>{x.name}</b></span><strong>{money(x.price)}</strong></button>)}</div></div>
            <button 
              className="ns-add-to-cart-btn" 
              onClick={handleAddToCart} 
              style={{
                width: '100%', 
                marginTop: 20,
                padding: '14px 32px', 
                fontSize: '15px', 
                fontWeight: 700, 
                borderRadius: '50px', 
                background: complete ? 'linear-gradient(90deg, #98eccb, #7f5ef9)' : '#2a3040', 
                color: complete ? '#000' : '#8992a5', 
                border: 'none', 
                cursor: 'pointer', 
                letterSpacing: '1px',
                transition: '0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ADD TO CART
            </button>
         </div>}
      </aside>

      {/* 3. PREVIEW CANVAS */}
      <section className="ns-champ-preview ns-grid-bg" style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background:'#edf2f7'}}>

      {/* SVG Filter for Cut-to-Shape Backboard */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="cut-to-shape-filter" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius="12" result="expanded" />
            <feGaussianBlur in="expanded" stdDeviation="7" result="softened" />
            <feComponentTransfer in="softened" result="solidMask">
              <feFuncA type="table" tableValues="0 0.82 0.94 0.98 1" />
            </feComponentTransfer>
            <feFlood floodColor={cutToShapeColor} floodOpacity="0.52" result="boardColor" />
            <feComposite in="boardColor" in2="solidMask" operator="in" result="board" />
            <feDropShadow in="board" dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.18" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="board" />
            </feMerge>
          </filter>
        </defs>
      </svg>

         
         {/* Tools moved to sticky header */}
         
         <div className="ns-champ-canvas-wrapper" style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding: 'clamp(10px, 2.5vw, 40px)', minWidth:0, minHeight:0}}>
             <div className="ns-canvas ns-champ-canvas-inner" ref={previewRef} style={{width: '100%', maxWidth: 'min(100%, 840px)', maxHeight: 'min(55vh, 520px)', aspectRatio: '814 / 536', position:'relative', flexShrink:0, overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.15)', borderRadius: '4px'}}>
                <img className="ns-canvas-background" src={background} alt="Room preview" style={{filter:lighting.filter, width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, zIndex:0}}/>
                
                {/* Mobile Light ON/OFF Toggle */}
                <div className="ns-mobile-light-toggle" style={{display:'none', position:'absolute', top:12, left:12, zIndex:20}}>
                   <button onClick={()=>setLightOn(v=>!v)} style={{display:'flex', alignItems:'center', background:lightOn?'#79b313':'#444', border:'none', borderRadius:'20px', padding:'4px 6px', paddingLeft:'10px', color:'#fff', fontWeight:700, fontSize:'10px', cursor:'pointer', gap:'6px'}}>
                      {lightOn?'ON':'OFF'}
                      <div style={{width:16, height:16, background:'#fff', borderRadius:'50%', transition:'transform 0.2s', transform:lightOn?'translateX(2px)':'translateX(-2px)'}}/>
                   </button>
                </div>
                
                {/* Mobile Share Button */}
                <div className="ns-mobile-share-toggle" style={{display:'none', position:'absolute', top:12, right:12, zIndex:20}}>
                   <button onClick={handleShare} disabled={sharing} style={{display:'flex', alignItems:'center', background:'rgba(5, 6, 10, 0.85)', border:'1px solid rgba(0, 255, 188, 0.5)', borderRadius:'20px', padding:'5px 12px', color:'#fff', fontWeight:700, fontSize:'10px', cursor:sharing?'wait':'pointer', gap:'5px', backdropFilter:'blur(4px)'}}>
                      <Share2 size={12} color="#00ffbc"/>
                      {sharing ? 'SHARING...' : 'SHARE'}
                   </button>
                </div>

                {showRuler&&ruler&&<div className="ns-sign-ruler" style={{left:ruler.left,top:ruler.top,width:ruler.width,height:ruler.height}}><div className="ns-sign-ruler-h"><i/><b>{signW.toFixed(2)}&quot;</b><i/></div><div className="ns-sign-ruler-v"><i/><b>{signH.toFixed(2)}&quot;</b><i/></div></div>}
                {/*                 {/* Whole Board Backboard Layer
                    Centre the board on the actual neon bounds.
                    The ruler has minimum dimensions, so using ruler.top/left
                    directly can make the board appear vertically offset. */}
                {backboard && (backboard.id === 'whole_board' || backboard.name === 'Whole Board' || backboard.name === 'Square') && ruler && bounds && (
                    <div
                        className="ns-backboard-visualizer"
                        style={{
                            position: 'absolute',
                            left: bounds.left + (bounds.width / 2) - (ruler.width / 2),
                            top: bounds.top + (bounds.height / 2) - (ruler.height / 2),
                            width: ruler.width,
                            height: ruler.height,
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05), 0 4px 15px rgba(0,0,0,0.1)',
                            pointerEvents: 'none',
                            zIndex: 1,
                            backdropFilter: 'blur(2px) contrast(0.9)',
                            WebkitBackdropFilter: 'blur(2px) contrast(0.9)',
                            boxSizing: 'border-box',
                        }}
                    />
                )}

                <div className="ns-neon-art" style={{left:`${signPos.x*100}%`,top:`${signPos.y*100}%`,transform:"translate(-50%,-50%)",width:"100%",height:"100%",position:"absolute",pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",zIndex: 2}}>

                   {/* Cut to Shape Backboard Layer */}
                     {backboard && backboard.id !== 'whole_board' && backboard.name !== 'Whole Board' && backboard.name !== 'Square' && backboard.id !== 'no_backing' && backboard.name !== 'No Backing' && (
                       <div className="ns-cut-to-shape-board" style={{...textStyle, position: "absolute", filter: 'url(#cut-to-shape-filter)', zIndex: 1, pointerEvents: "none", color: cutToShapeColor, WebkitTextFillColor: cutToShapeColor, backgroundImage: 'none', WebkitBackgroundClip: 'initial', textShadow: 'none', opacity: 1}}>
                           {leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}{renderText()}{rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}
                       </div>
                   )}
                   <div ref={textRef} className={`ns-neon-text${mojo?" spectrum":""}`} style={{...textStyle,position:"relative",pointerEvents:"auto",cursor:isMulti?"inherit":"grab",userSelect:"none"}} onPointerDown={e=>{if(!isMulti) dragSign(e)}}>{leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}{renderText()}{rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}</div>
                </div>
                {calibrating&&<div className="ns-calibration-live" style={{position:"absolute",inset:0,zIndex:50,pointerEvents:"none"}}><div onPointerDown={dragCalibration} style={{position:"absolute",left:`${calibrationPos.x*100}%`,top:`${calibrationPos.y*100}%`,width:calibrationWidth,height:6,transform:"translate(-50%,-50%)",background:"#ff3355",boxShadow:"0 0 16px rgba(255,51,85,.8)",cursor:"move",pointerEvents:"auto"}}><span style={{position:"absolute",left:"50%",top:-24,transform:"translateX(-50%)",color:"#fff",fontWeight:800,whiteSpace:"nowrap"}}>{Math.round(calibrationWidth)} px — drag over a known object</span><i style={{position:"absolute",left:-8,top:-8,width:22,height:22,borderRadius:"50%",background:"#ff3355"}}/><i style={{position:"absolute",right:-8,top:-8,width:22,height:22,borderRadius:"50%",background:"#ff3355"}}/></div><div style={{position:"absolute",left:12,bottom:12,zIndex:51,padding:12,background:"rgba(5,6,10,.94)",border:"1px solid #752eff",borderRadius:12,pointerEvents:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:"#a8f2cc",fontSize:11}}>CALIBRATE ROOM SIZE</b><span style={{color:"#8992a5",fontSize:10}}>Place red line over a real object, then enter its width.</span><input value={calibrationInches} onChange={e=>setCalibrationInches(e.target.value)} type="number" min="1" style={{height:38,width:110,background:"#111",color:"#fff",border:"1px solid #444",borderRadius:7,padding:"0 10px"}}/><button onClick={setCalibration} style={{height:38,background:"#752eff",color:"#fff",border:0,borderRadius:7,padding:"0 15px",fontWeight:800}}>SET SCALE</button><button onClick={()=>setCalibrating(false)} style={{height:38,background:"#161a24",color:"#fff",border:"1px solid #333",borderRadius:7,padding:"0 12px"}}>CANCEL</button></div></div>}
             </div>
         </div>
         
         <div className="ns-champ-bottom-bar" style={{background:'#05060a', display:'flex', flexDirection:'column', padding:'20px 30px', borderTop:'1px solid #161a23'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                 <strong style={{fontSize:'14px', color:'#fff', fontFamily:'Poppins', fontWeight:700}}>ROOM / WALL BACKGROUND</strong>
                 <label className="btn" style={{padding:'8px 16px', fontSize:'12px', background:'transparent', color:'#fff', border:'1px solid #00ffbc', borderRadius:'6px', display:'inline-flex', alignItems:'center', cursor:'pointer'}}><Upload size={14} style={{marginRight:8}}/> UPLOAD YOUR WALL<input type="file" accept="image/*, image/webp, .webp" onChange={uploadWall} style={{display:'none'}}/></label>
             </div>
             <div className="ns-background-horiz-scroll" style={{display:'flex', gap:15, overflowX:'auto', paddingBottom:5, alignItems:'center'}}>
                 {BACKGROUNDS.map(([name,url])=><button key={url} className={background===url?"selected":""} onClick={()=>chooseBackground(url)} style={{flexShrink:0, width:90, background:'transparent', border:background===url?'1px solid #8b4cff':'1px solid #161a23', borderRadius:'10px', overflow:'hidden', position:'relative', cursor:'pointer', padding:'4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
                     <img src={url} alt={name} style={{width:'100%', height:'54px', objectFit:'cover', borderRadius:'6px'}}/>
                     <span style={{color:background===url?'#fff':'#a6a8b3', fontSize:'11px', textAlign:'center', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden', width:'100%', paddingBottom:'4px'}}>{name}</span>
                 </button>)}
             </div>
         </div>
         
      </section>
    </section>

    {/* Premium UI/UX Notification Modal */}
    {notification && (
      <div 
        onClick={() => setNotification(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 4, 8, 0.78)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, #0d1017 0%, #06080e 100%)',
            border: '1.5px solid #752eff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(117, 46, 255, 0.3)',
            borderRadius: '20px',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '390px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          <button 
            onClick={() => setNotification(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#8992a5',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: '0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#8992a5'}
          >
            <X size={18} />
          </button>

          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(0, 255, 188, 0.08)',
            border: '1.5px solid rgba(0, 255, 188, 0.35)',
            boxShadow: '0 0 20px rgba(0, 255, 188, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00ffbc',
            marginBottom: '16px'
          }}>
            <Sparkles size={24} />
          </div>

          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 8px 0',
            letterSpacing: '0.02em'
          }}>
            {notification.title}
          </h3>

          <p style={{
            fontSize: '14px',
            color: '#aeb5c4',
            lineHeight: 1.55,
            margin: '0 0 22px 0'
          }}>
            {notification.message}
          </p>

          <button
            onClick={() => {
              if (typeof notification.step === 'number') {
                setStep(notification.step);
              }
              setNotification(null);
            }}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: 'linear-gradient(90deg, #752eff, #00ffbc)',
              border: 'none',
              borderRadius: '12px',
              color: '#05060a',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 255, 188, 0.35)',
              transition: 'transform 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {notification.actionLabel || "GOT IT"}
          </button>
        </div>
      </div>
    )}
  </main>;
}
