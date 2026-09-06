"use client";
import React,{useEffect,useMemo,useRef,useState} from "react";
import {Footer, MobileMenu} from "./components";
import {getConfiguratorOptions} from "./lib/api";
import {AlignCenter,AlignLeft,AlignRight,ArrowLeft,ArrowRight,Check,ChevronDown,Crown,Heart,Menu,Minus,Moon,Plus,Ruler,RotateCcw,Smile,Sparkles,Star,Sun,Sunset,Trash2,Upload,WandSparkles,Zap} from "lucide-react";
import "./configurator.css";
const STEPS=["text","size","shapes","color","backboard","hardware"],LABELS={text:"TEXT",size:"SIZE",shapes:"SHAPES",color:"COLOUR",backboard:"BACKBOARD",hardware:"HARDWARE"};
const COLORS=[{id:"pink",name:"Pink",hex:"#ff2aa8"},{id:"purple",name:"Purple",hex:"#8d3cff"},{id:"blue",name:"Blue",hex:"#198cff"},{id:"cyan",name:"Cyan",hex:"#12dfe5"},{id:"green",name:"Green",hex:"#63df21"},{id:"yellow",name:"Yellow",hex:"#ffd11a"},{id:"orange",name:"Orange",hex:"#ff8618"},{id:"white",name:"White",hex:"#fff"}];
const FALLBACK={options:{colors:COLORS,sizes:[{id:"small",name:"Small",price:5600,description:"39.5 × 10 in"},{id:"medium",name:"Medium",price:9100,description:"51.5 × 13 in"},{id:"large",name:"Large",price:11400,description:"63.5 × 15 in"},{id:"xl",name:"Extra Large",price:14800,description:"87.5 × 17 in"}],shapes:[{id:"heart",name:"Heart",price:300},{id:"star",name:"Star",price:300},{id:"lightning",name:"Lightning",price:300},{id:"crown",name:"Crown",price:300},{id:"moon",name:"Moon",price:300},{id:"smile",name:"Smile",price:300}],backboards:[{id:"cut",name:"Cut to Shape",price:0},{id:"whole",name:"Whole Board / Square",price:1200},{id:"none",name:"No Backing / Minimal",price:0}],hardware:[{id:"screws",name:"Wall Screws",price:0},{id:"wire",name:"Hanging Wire",price:300},{id:"dimmer",name:"Standard Dimmer",price:500},{id:"smart",name:"Smart WiFi / Wireless Remote",price:1000},{id:"indoor",name:"Indoor LED",price:0},{id:"outdoor",name:"IP67 Waterproof Outdoor",price:900}]},fonts:[{id:"neon-script",name:"Neon Script",class:"font-neon-script"},{id:"classic",name:"Classic",class:""}],presentation:{text_color_selection:true,shape_color_mode:"single",shape_color_options:COLORS}};
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
 const [config,setConfig]=useState(null),[loading,setLoading]=useState(true),[step,setStep]=useState(0),[text,setText]=useState("The Neon Stack"),[font,setFont]=useState(null),[align,setAlign]=useState("center"),[size,setSize]=useState(null),[color,setColor]=useState(null),[isMulti,setIsMulti]=useState(false),[letterColors,setLetterColors]=useState({}),[selectedLetter,setSelectedLetter]=useState(null),[shapes,setShapes]=useState([]),[backboard,setBackboard]=useState(null),[hardware,setHardware]=useState(null),[background,setBackground]=useState(BACKGROUNDS[0][1]),[wallFile,setWallFile]=useState(null),[mood,setMood]=useState("day"),[lightOn,setLightOn]=useState(true),[showRuler,setShowRuler]=useState(true),[calibrating,setCalibrating]=useState(false),[calibrationInches,setCalibrationInches]=useState("50"),[calibrationRatio,setCalibrationRatio]=useState(null),[calibrationWidth,setCalibrationWidth]=useState(295),[calibrationPos,setCalibrationPos]=useState({x:.5,y:.52}),[signPos,setSignPos]=useState({x:.5,y:.5}),[fontSize,setFontSize]=useState(80),[bounds,setBounds]=useState(null);
 const previewRef=useRef(null),textRef=useRef(null);
 useEffect(()=>{let active=true;setLoading(true);getConfiguratorOptions(type).then(data=>{if(!active)return;const c=data?.options?data:FALLBACK,o=c.options||FALLBACK.options,fs=c.fonts?.length?c.fonts:FALLBACK.fonts;setConfig(c);setFont(fs[0]);setSize(null);setColor(mojo?null:(o.colors?.[0]||COLORS[0]));setBackboard(null);setHardware(null);setLoading(false)}).catch(()=>{if(!active)return;setConfig(FALLBACK);setFont(FALLBACK.fonts[0]);setSize(null);setColor(mojo?null:COLORS[0]);setBackboard(null);setHardware(null);setLoading(false)});return()=>{active=false}},[type,mojo]);
 const options=config?.options||FALLBACK.options,fonts=config?.fonts?.length?config.fonts:FALLBACK.fonts,presentation=config?.presentation||{},current=STEPS[step],shapeColors=presentation.shape_color_options?.length?presentation.shape_color_options:(options.colors?.length?options.colors:COLORS);
 const valid={text:Boolean(text.trim())&&Boolean(font),size:Boolean(size),shapes:true,color:mojo||Boolean(color),backboard:Boolean(backboard),hardware:Boolean(hardware)},complete=STEPS.every(k=>valid[k]);
 const price=useMemo(()=>Number(size?.price||0)+Number(backboard?.price||0)+Number(hardware?.price||0)+shapes.reduce((n,s)=>n+Number(s.price||0),0),[size,backboard,hardware,shapes]);
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
 useEffect(()=>{const box=previewRef.current;if(!box)return;const fit=()=>{const probe=document.createElement("span"),cs=textRef.current?getComputedStyle(textRef.current):null;
  const leftCount=shapes.filter(s=>s.position==="left").length,rightCount=shapes.filter(s=>s.position==="right").length;
  const leftPad=leftCount?(0.6+(leftCount-1)*0.9+0.5):0,rightPad=rightCount?(0.6+(rightCount-1)*0.9+0.5):0;
  probe.style.cssText=`position:fixed;left:-99999px;top:-99999px;visibility:hidden;white-space:pre;display:inline-block;font-family:${JSON.stringify(fontFamily(font))};font-weight:${cs?.fontWeight||"400"};letter-spacing:${cs?.letterSpacing||"normal"};line-height:1.02;padding-left:${leftPad}em;padding-right:${rightPad}em;`;
  probe.textContent=text||"Preview";document.body.appendChild(probe);const sIdx=options?.sizes?.findIndex(s=>s.id===size?.id)??0,mult=[0.4,0.55,0.7,0.85][Math.min(3,Math.max(0,sIdx))]||0.55,maxWidth=Math.max(140,Math.min(box.clientWidth*mult,calibrationRatio?signW*calibrationRatio:box.clientWidth*mult));const lines=String(text||"").split("\n").length;let low=12,high=190;for(let i=0;i<18;i++){const mid=(low+high)/2;probe.style.fontSize=`${mid}px`;if(probe.scrollWidth<=maxWidth&&probe.scrollHeight<=Math.max(80,box.clientHeight*.5/lines))low=mid;else high=mid}setFontSize(low);document.body.removeChild(probe)};fit();const ro=new ResizeObserver(fit);ro.observe(box);return()=>ro.disconnect()},[text,font,size,calibrationRatio,shapes,options]);
 useEffect(()=>{const box=previewRef.current,el=textRef.current;if(!box||!el)return;const update=()=>{const a=box.getBoundingClientRect(),r=el.getBoundingClientRect();setBounds({left:r.left-a.left,top:r.top-a.top,width:r.width,height:r.height})};update();const ro=new ResizeObserver(update);ro.observe(el);ro.observe(box);return()=>ro.disconnect()},[fontSize,text,align,signPos,shapes]);
 const addShape=s=>setShapes(prev=>{const l=prev.filter(x=>x.position==="left").length,r=prev.filter(x=>x.position==="right").length;return [...prev,{...s,uid:`${s.id}-${Date.now()}-${Math.random()}`,position:l<=r?"left":"right",color:shapeColors[0]||COLORS[0]}]});
 const removeShape=uid=>setShapes(prev=>prev.filter(s=>s.uid!==uid));
 const updateShape=(uid,patch)=>setShapes(prev=>prev.map(s=>s.uid===uid?{...s,...patch}:s));
 const uploadWall=e=>{const f=e.target.files?.[0];if(!f)return;if(wallFile)URL.revokeObjectURL(wallFile);const u=URL.createObjectURL(f);setWallFile(u);setBackground(u);setCalibrationRatio(null)};
 const chooseBackground=u=>{if(wallFile)URL.revokeObjectURL(wallFile);setWallFile(null);setBackground(u);setCalibrationRatio(null)};
 const nextBg = () => { const idx = BACKGROUNDS.findIndex(b => b[1] === background); chooseBackground(BACKGROUNDS[(Math.max(0, idx) + 1) % BACKGROUNDS.length][1]); };
 const prevBg = () => { const idx = BACKGROUNDS.findIndex(b => b[1] === background); chooseBackground(BACKGROUNDS[(Math.max(0, idx) - 1 + BACKGROUNDS.length) % BACKGROUNDS.length][1]); };
 const reset=()=>{if(wallFile)URL.revokeObjectURL(wallFile);setText("The Neon Stack");setShapes([]);setBackground(BACKGROUNDS[0][1]);setWallFile(null);setMood("day");setLightOn(true);setShowRuler(true);setCalibrating(false);setCalibrationRatio(null);setCalibrationWidth(295);setCalibrationPos({x:.5,y:.52});setSignPos({x:.5,y:.5});setStep(0);setIsMulti(false);setLetterColors({});setSelectedLetter(null);setColor(config?.colors?.[0]||COLORS[0])};
 const dragSign=e=>{if(calibrating)return;e.preventDefault();const box=previewRef.current?.getBoundingClientRect();if(!box)return;const sx=e.clientX,sy=e.clientY,ox=signPos.x,oy=signPos.y;const move=ev=>setSignPos({x:Math.max(.08,Math.min(.92,ox+(ev.clientX-sx)/box.width)),y:Math.max(.12,Math.min(.88,oy+(ev.clientY-sy)/box.height))});const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)};
 const dragCalibration=e=>{if(!calibrating)return;e.preventDefault();const box=previewRef.current?.getBoundingClientRect();if(!box)return;const sx=e.clientX,sy=e.clientY,ox=calibrationPos.x,oy=calibrationPos.y;const move=ev=>setCalibrationPos({x:Math.max(.08,Math.min(.92,ox+(ev.clientX-sx)/box.width)),y:Math.max(.08,Math.min(.92,oy+(ev.clientY-sy)/box.height))});const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)};
 const setCalibration=()=>{const inches=Number(calibrationInches);if(inches>0)setCalibrationRatio(calibrationWidth/inches);setCalibrating(false);};
 const neonColor=color?.hex||"#63df21",lighting=LIGHTING[mood],leftShapes=shapes.filter(s=>s.position==="left"),rightShapes=shapes.filter(s=>s.position==="right");
 const darkenHex=h=>{if(!h||!h.startsWith("#"))return "#1a1a24";let r=parseInt(h.slice(1,3),16)*0.2,g=parseInt(h.slice(3,5),16)*0.2,b=parseInt(h.slice(5,7),16)*0.2;return `#${Math.floor(r).toString(16).padStart(2,'0')}${Math.floor(g).toString(16).padStart(2,'0')}${Math.floor(b).toString(16).padStart(2,'0')}`};
 const getShadow=c=>"none";
 const textStyle={fontFamily:fontFamily(font),fontSize:`${fontSize}px`,lineHeight:1.02,whiteSpace:"pre",display:"inline-block",textAlign:align,color:mojo?"transparent":(isMulti?undefined:(lightOn?neonColor:darkenHex(neonColor))),backgroundImage:mojo?"linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)":undefined,WebkitBackgroundClip:mojo?"text":undefined,backgroundSize:mojo?"300% 100%":undefined,animation:mojo?"nsMojoSpectrum 3s linear infinite":undefined,textShadow:mojo?"none":(isMulti?undefined:getShadow(neonColor)),filter:"none",opacity:lightOn?1:.9};
 const renderText=()=>{if(mojo||!isMulti)return text||"Preview";return (text||"Preview").split("").map((char,i)=>{const c=letterColors[i]||color,cHex=lightOn?(c?.hex||"#63df21"):darkenHex(c?.hex||"#63df21");return <span key={i} onClick={(e)=>{if(isMulti){e.stopPropagation();setSelectedLetter(i)}}} style={{color:cHex,textShadow:getShadow(cHex),cursor:isMulti?"pointer":"inherit",display:"inline-block",transform:isMulti&&selectedLetter===i?"scale(1.1)":"none",transition:"transform 0.2s",zIndex:isMulti&&selectedLetter===i?10:1,position:"relative"}}>{char}</span>})};
 const shapePosition=(s,side,index)=>{const offsetGap=0.6+index*0.9;const finalShapeColor=lightOn?(s.color?.hex||neonColor):darkenHex(s.color?.hex||neonColor);return {position:"absolute",top:"50%",left:side==="left"?`calc(0% - ${offsetGap}em)`:`calc(100% + ${offsetGap}em)`,color:mojo?undefined:finalShapeColor,backgroundImage:mojo?"linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)":undefined,WebkitBackgroundClip:mojo?"text":undefined,backgroundSize:mojo?"300% 100%":undefined,animation:mojo?"nsMojoSpectrum 3s linear infinite":undefined,opacity:lightOn?1:.9,transform:"translate(-50%,-50%)",fontSize:Math.max(30,fontSize*.5),filter:"none",textShadow:"none",display:"flex",alignItems:"center",justifyContent:"center"}};
 const ruler=useMemo(()=>{if(!bounds)return null;const gap=Math.max(44,Math.min(78,fontSize*.55)),left=bounds.left-leftShapes.length*gap-gap/2,right=bounds.left+bounds.width+rightShapes.length*gap+gap/2,top=bounds.top-Math.min(24,fontSize*.1),bottom=bounds.top+bounds.height+Math.min(24,fontSize*.1);return {left:Math.max(8,left),top:Math.max(8,top),width:Math.max(100,right-left),height:Math.max(70,bottom-top)}},[bounds,leftShapes.length,rightShapes.length,fontSize]);
  const handleAddToCart = () => { 
    if (complete) {
      try {
        const item = {
          id: Date.now(),
          name: text || "Custom Neon",
          type: type === "mojo_mix" ? "Mojo Mix" : "Custom Neon",
          price: price,
          qty: 1,
          size: size?.name,
          color: mojo ? "Mojo Spectrum" : (color?.name || "Multi-color"),
          font: font?.name,
          image: background
        };
        const cart = JSON.parse(localStorage.getItem('ns_cart') || '[]');
        cart.push(item);
        localStorage.setItem('ns_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {}
      window.location.href='/cart';
    } else {
      const missing = STEPS.find(k => !valid[k]);
      let msg = "Please select all options.";
      if (missing === 'text') msg = "Please enter your text.";
      if (missing === 'size') msg = "Please select a size.";
      if (missing === 'color') msg = "Please select a colour.";
      if (missing === 'backboard') msg = "Please add a backboard.";
      if (missing === 'hardware') msg = "Please add hardware.";
      alert(msg);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  
  if(loading)return <main className="ns-config-loading">Loading your neon builder…</main>;
  return <main className={`ns-configurator${mojo?" ns-mojo":""}`}>
    {mobileMenuOpen && <MobileMenu close={()=>setMobileMenuOpen(false)} onMouseLeave={()=>setMobileMenuOpen(false)}/>}
    <div className="ns-builder-sticky-header" style={{position:'sticky',top:0,zIndex:990,background:'#05060a',borderBottom:'1px solid #161a23',padding:'10px 42px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
         <button className="btn ns-config-hamburger" onMouseEnter={()=>setMobileMenuOpen(true)} onClick={()=>setMobileMenuOpen(true)} style={{padding:'8px', background:'transparent', border:'1px solid transparent', borderRadius:'6px', color:'#fff', cursor:'pointer', transition:'0.2s'}}><Menu size={24}/></button>
         <a href="/"><img src="/images/The Neon Stack Logo without icon.svg" alt="The Neon Stack" style={{height:'54px'}} className="svg-flicker"/></a>
      </div>
      <div className="ns-header-center-tools" style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <button className="btn" onClick={reset} style={{padding:'6px 12px', background:'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><RotateCcw size={14}/> Reset</button>
          <div style={{width:'1px', background:'#2a3040', margin:'0 4px', height:'20px'}}></div>
          <button className={mood==="night"?"btn primary":"btn"} onClick={()=>setMood("night")} style={{padding:'6px 12px', background:mood==="night"?'#752eff':'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><Moon size={14}/> Dark Room</button>
          <button className={mood==="evening"?"btn primary":"btn"} onClick={()=>setMood("evening")} style={{padding:'6px 12px', background:mood==="evening"?'#752eff':'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><Sunset size={14}/> Cozy Evening</button>
          <button className={mood==="day"?"btn primary":"btn"} onClick={()=>setMood("day")} style={{padding:'6px 12px', background:mood==="day"?'#752eff':'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><Sun size={14}/> Daytime</button>
          <div style={{width:'1px', background:'#2a3040', margin:'0 4px', height:'20px'}}></div>
          <button className={lightOn?"btn primary":"btn"} onClick={()=>setLightOn(v=>!v)} style={{padding:'6px 12px', background:lightOn?'#752eff':'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}>{lightOn?"Light ON":"Light OFF"}</button>
          <button className={showRuler?"btn primary":"btn"} onClick={()=>setShowRuler(v=>!v)} style={{padding:'6px 12px', background:showRuler?'#752eff':'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><Ruler size={14}/> {showRuler?'Hide':'Show'} Ruler</button>
          <button className="btn" onClick={()=>setCalibrating(v=>!v)} style={{padding:'6px 12px', background:'#05060a', border:'1px solid #752eff', color:'#fff', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px'}}><Ruler size={14}/> Calibrate</button>
      </div>
      <div className="ns-header-right-cart" style={{display:'flex', alignItems:'center', gap:'20px'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
          <span style={{fontSize:'12px', color:'#a6a8b3'}}>Estimated Price</span>
          <strong style={{fontSize:'22px', color:'#00ffbc'}}>{money(price)}</strong>
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
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Create<br/>Own</span>
         </button>
         <button className={`ns-champ-tab ${step===1?'active':''}`} onClick={()=>setStep(1)} style={{padding:'20px 0', border:'none', background:step===1?'#0a0d14':'transparent', color:step===1?'#00ffbc':'#8992a5', borderRight:step===1?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Ruler size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Select<br/>Size</span>
         </button>
         <button className={`ns-champ-tab ${step===2?'active':''}`} onClick={()=>setStep(2)} style={{padding:'20px 0', border:'none', background:step===2?'#0a0d14':'transparent', color:step===2?'#00ffbc':'#8992a5', borderRight:step===2?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Sparkles size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Neon<br/>Shapes</span>
         </button>
         <button className={`ns-champ-tab ${step===3?'active':''}`} onClick={()=>setStep(3)} style={{padding:'20px 0', border:'none', background:step===3?'#0a0d14':'transparent', color:step===3?'#00ffbc':'#8992a5', borderRight:step===3?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Sunset size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Color</span>
         </button>
         <button className={`ns-champ-tab ${step===4?'active':''}`} onClick={()=>setStep(4)} style={{padding:'20px 0', border:'none', background:step===4?'#0a0d14':'transparent', color:step===4?'#00ffbc':'#8992a5', borderRight:step===4?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Moon size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Back<br/>Board</span>
         </button>
         <button className={`ns-champ-tab ${step===5?'active':''}`} onClick={()=>setStep(5)} style={{padding:'20px 0', border:'none', background:step===5?'#0a0d14':'transparent', color:step===5?'#00ffbc':'#8992a5', borderRight:step===5?'2px solid #00ffbc':'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
            <Zap size={20}/>
            <span style={{fontSize:'10px', textAlign:'center', lineHeight:1.2, fontFamily:'Space Grotesk', fontWeight:600}}>Power &<br/>Hardw.</span>
         </button>
      </aside>

      {/* 2. CONTROLS PANEL */}
      <aside className="ns-champ-controls" style={{width:'340px', flexShrink:0, background:'#0a0d14', borderRight:'1px solid #161a23', overflowY:'auto', padding:'25px 20px'}}>
         {step===0 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>CREATE YOUR OWN {valid.text&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-field"><label>YOUR TEXT <small>{text.length}/50</small></label><textarea value={text} maxLength={50} rows={3} onChange={e=>setText(e.target.value)}/><small style={{display:"block",marginTop:6,color:"#8992a5"}}>Press Enter only when you want another line.</small></div>
            <div className="ns-field" style={{position:'relative'}}>
               <label>FONT STYLE <small>{fonts.length} Fonts</small></label>
               <div onClick={()=>setFontPickerOpen(!fontPickerOpen)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#05060a',border:fontPickerOpen?'1px solid #752eff':'1px solid #161a23',padding:'14px 16px',borderRadius:'6px',cursor:'pointer', transition:'0.2s'}}>
                  <span style={{fontFamily: fontFamily(font), fontSize:'20px', color: '#fff'}}>{font?.name || "Select Font"}</span>
                  <ChevronDown size={18} color="#b8bfd8" style={{transform: fontPickerOpen?'rotate(180deg)':'none', transition:'0.2s'}}/>
               </div>
               {fontPickerOpen && (
                 <div className="ns-custom-scroll" style={{position:'absolute',top:'100%',left:0,right:0,zIndex:200,background:'#0a0d14',border:'1px solid #752eff',borderRadius:'6px',marginTop:'4px',padding:'12px',maxHeight:'340px',overflowY:'auto',display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'8px',boxShadow:'0 10px 30px rgba(0,0,0,0.5)'}}>
                   {fonts.map(f => (
                      <button key={f.id||f.name} onClick={()=>{setFont(f);setFontPickerOpen(false);}} style={{background:font?.name===f.name?'#161a23':'#05060a',border:font?.name===f.name?'1px solid #8b4cff':'1px solid #161a23',borderRadius:'4px',padding:'14px 4px',cursor:'pointer',color:font?.name===f.name?'#00ffbc':'#fff',textAlign:'center',transition:'0.2s',display:'flex',alignItems:'center',justifyContent:'center',minHeight:'55px'}}>
                         <span style={{fontFamily: fontFamily(f), fontSize:'18px'}}>{f.name}</span>
                      </button>
                   ))}
                 </div>
               )}
            </div>
            <div className="ns-field"><label>ALIGNMENT</label><div className="ns-align"><button className={align==="left"?"selected":""} onClick={()=>setAlign("left")}><AlignLeft/></button><button className={align==="center"?"selected":""} onClick={()=>setAlign("center")}><AlignCenter/></button><button className={align==="right"?"selected":""} onClick={()=>setAlign("right")}><AlignRight/></button></div></div>
            <button className="btn primary" onClick={()=>setStep(1)} style={{width:'100%', marginTop:20}}>NEXT: SELECT SIZE</button>
         </div>}
         
         {step===1 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>SELECT SIZE</h2>
            <div className="ns-field"><label>SIZE</label><div className="ns-option-list">{options.sizes?.map(s=><button key={s.id} className={size?.id===s.id?"selected":""} onClick={()=>setSize(s)}><span><b>{s.name}</b><small>{s.description}</small></span><strong>{money(s.price)}</strong></button>)}</div></div>
            <button className="btn primary" onClick={()=>setStep(2)} style={{width:'100%', marginTop:20}}>NEXT: NEON SHAPES</button>
         </div>}

         {step===2 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>NEON SHAPES {valid.shapes&&shapes.length>0&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-section-title"><div><small>Each shape has its own colour and position.</small></div></div><div className="ns-shape-list">{options.shapes?.map(s=>{const count=shapes.filter(x=>x.id===s.id).length;return <div className="ns-shape-row" key={s.id}><span className="ns-shape-label">{shapeIcon(s.name,24)}<b>{s.name}</b></span><button className="ns-icon-btn" onClick={()=>addShape(s)}><Plus size={16}/></button><span className="ns-count">{count}</span><button className="ns-icon-btn" onClick={()=>{const last=[...shapes].reverse().find(x=>x.id===s.id);if(last)removeShape(last.uid)}}><Minus size={16}/></button></div>})}</div>{shapes.length>0&&<div className="ns-shape-configs"><h3>POSITION &amp; COLOUR</h3>{shapes.map((s,i)=><div className="ns-shape-config" key={s.uid}><div className="ns-shape-config-top"><b>{s.name} {i+1}</b><button className="ns-icon-btn" onClick={()=>removeShape(s.uid)}><Trash2 size={15}/></button></div><div className="ns-position"><button className={s.position==="left"?"selected":""} onClick={()=>updateShape(s.uid,{position:"left"})}>Left</button><button className={s.position==="right"?"selected":""} onClick={()=>updateShape(s.uid,{position:"right"})}>Right</button></div><div className="ns-mini-color-row">{shapeColors.map(c=><button key={c.id||c.name} className={s.color?.id===c.id?"selected":""} style={{background:c.hex}} onClick={()=>updateShape(s.uid,{color:c})} title={c.name}/>)}</div></div>)}</div>}
            <button className="btn primary" onClick={()=>setStep(3)} style={{width:'100%', marginTop:20}}>NEXT: COLOR</button>
         </div>}

         {step===3 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>COLOR {valid.color&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            {!mojo&&<div className="ns-field"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><label style={{margin:0}}>TEXT COLOUR</label><button onClick={()=>{setIsMulti(!isMulti);if(!isMulti&&selectedLetter===null)setSelectedLetter(0)}} style={{background:isMulti?"#8b4cff":"transparent",color:isMulti?"#fff":"#8b4cff",border:"1px solid #8b4cff",borderRadius:6,fontSize:9,padding:"4px 8px",fontWeight:800,cursor:"pointer"}}>{isMulti?"SINGLE COLOUR":"MULTI COLOUR"}</button></div>{isMulti&&<div style={{background:"#0a0d14",padding:12,borderRadius:8,marginBottom:15,border:"1px solid #2a3040"}}><div style={{fontSize:10,color:"#aeb5c4",marginBottom:10}}>Click a letter below, then choose a colour.</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(text||"Preview").split("").map((char,i)=>{if(char.trim()==="")return null;const isSel=selectedLetter===i,c=letterColors[i]||color,cHex=c?.hex||"#63df21";return <button key={i} onClick={()=>setSelectedLetter(i)} style={{width:32,height:32,borderRadius:6,background:isSel?"#752eff":"#161a24",border:isSel?"1px solid #9a6cff":"1px solid #333",color:isSel?"#fff":cHex,fontSize:14,fontWeight:"bold",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{char}</button>})}</div></div>}<div className="ns-color-grid">{(options.colors?.length?options.colors:COLORS).map(c=>{const isSelected=isMulti?letterColors[selectedLetter]?.id===c.id:color?.id===c.id;return <button key={c.id||c.name} className={isSelected?"selected":""} style={{background:c.hex}} onClick={()=>{if(isMulti){if(selectedLetter!==null)setLetterColors(prev=>({...prev,[selectedLetter]:c}))}else{setColor(c)}}} title={c.name}/>})}</div></div>}
            {mojo&&<div className="ns-field"><label>MOJO SPECTRUM</label><p style={{color:"#aeb5c4",lineHeight:1.6}}>Mojo Mix uses a continuous moving multicolour spectrum. The text and shapes animate independently from Custom Neon colours.</p></div>}
            <button className="btn primary" onClick={()=>setStep(4)} style={{width:'100%', marginTop:20}}>NEXT: BACKBOARD</button>
         </div>}

         {step===4 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>BACKBOARD {valid.backboard&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-field"><div className="ns-option-list">{options.backboards?.map(x=><button key={x.id} className={backboard?.id===x.id?"selected":""} onClick={()=>setBackboard(x)}><span><b>{x.name}</b></span><strong>{money(x.price)}</strong></button>)}</div></div>
            <button className="btn primary" onClick={()=>setStep(5)} style={{width:'100%', marginTop:20}}>NEXT: HARDWARE</button>
         </div>}

         {step===5 && <div className="ns-champ-panel">
            <h2 style={{fontSize:'16px', fontWeight:800, marginBottom:'20px', color:'#fff', fontFamily:'Space Grotesk'}}>POWER & HARDWARE {valid.hardware&&<Check size={16} color="#00ffbc" style={{marginLeft:6, verticalAlign:'text-bottom'}}/>}</h2>
            <div className="ns-field"><div className="ns-option-list">{options.hardware?.map(x=><button key={x.id} className={hardware?.id===x.id?"selected":""} onClick={()=>setHardware(x)}><span><b>{x.name}</b></span><strong>{money(x.price)}</strong></button>)}</div></div>
            <button className="btn primary ns-add-to-cart" disabled={!complete} onClick={handleAddToCart} style={{width:'100%', marginTop:20}}>ADD TO CART</button>
         </div>}
      </aside>

      {/* 3. PREVIEW CANVAS */}
      <section className="ns-champ-preview ns-grid-bg" style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background:'#edf2f7'}}>
         
         {/* Tools moved to sticky header */}
         
         <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding: '40px'}}>
             <div className="ns-canvas ns-champ-canvas-inner" ref={previewRef} style={{width: '100%', maxWidth: '60%', maxHeight: '55vh', aspectRatio: '814 / 536', position:'relative', flexShrink:0, overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.15)', borderRadius: '4px'}}>
                <img className="ns-canvas-background" src={background} alt="Room preview" style={{filter:lighting.filter, width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, zIndex:0}}/>
                
                {/* Mobile Light ON/OFF Toggle */}
                <div className="ns-mobile-light-toggle" style={{display:'none', position:'absolute', top:12, left:12, zIndex:20}}>
                   <button onClick={()=>setLightOn(v=>!v)} style={{display:'flex', alignItems:'center', background:lightOn?'#79b313':'#444', border:'none', borderRadius:'20px', padding:'4px 6px', paddingLeft:'10px', color:'#fff', fontWeight:700, fontSize:'10px', cursor:'pointer', gap:'6px'}}>
                      {lightOn?'ON':'OFF'}
                      <div style={{width:16, height:16, background:'#fff', borderRadius:'50%', transition:'transform 0.2s', transform:lightOn?'translateX(2px)':'translateX(-2px)'}}/>
                   </button>
                </div>
                
                {showRuler&&ruler&&<div className="ns-sign-ruler" style={{left:ruler.left,top:ruler.top,width:ruler.width,height:ruler.height}}><div className="ns-sign-ruler-h"><i/><b>{signW.toFixed(2)}&quot;</b><i/></div><div className="ns-sign-ruler-v"><i/><b>{signH.toFixed(2)}&quot;</b><i/></div></div>}
                <div className="ns-neon-art" style={{left:`${signPos.x*100}%`,top:`${signPos.y*100}%`,transform:"translate(-50%,-50%)",width:"100%",height:"100%",position:"absolute",pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                   <div ref={textRef} className={`ns-neon-text${mojo?" spectrum":""}`} style={{...textStyle,position:"relative",pointerEvents:"auto",cursor:isMulti?"inherit":"grab",userSelect:"none"}} onPointerDown={e=>{if(!isMulti) dragSign(e)}}>{leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}{renderText()}{rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}</div>
                </div>
                {calibrating&&<div className="ns-calibration-live" style={{position:"absolute",inset:0,zIndex:50,pointerEvents:"none"}}><div onPointerDown={dragCalibration} style={{position:"absolute",left:`${calibrationPos.x*100}%`,top:`${calibrationPos.y*100}%`,width:calibrationWidth,height:6,transform:"translate(-50%,-50%)",background:"#ff3355",boxShadow:"0 0 16px rgba(255,51,85,.8)",cursor:"move",pointerEvents:"auto"}}><span style={{position:"absolute",left:"50%",top:-24,transform:"translateX(-50%)",color:"#fff",fontWeight:800,whiteSpace:"nowrap"}}>{Math.round(calibrationWidth)} px — drag over a known object</span><i style={{position:"absolute",left:-8,top:-8,width:22,height:22,borderRadius:"50%",background:"#ff3355"}}/><i style={{position:"absolute",right:-8,top:-8,width:22,height:22,borderRadius:"50%",background:"#ff3355"}}/></div><div style={{position:"absolute",left:12,bottom:12,zIndex:51,padding:12,background:"rgba(5,6,10,.94)",border:"1px solid #752eff",borderRadius:12,pointerEvents:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><b style={{color:"#a8f2cc",fontSize:11}}>CALIBRATE ROOM SIZE</b><span style={{color:"#8992a5",fontSize:10}}>Place red line over a real object, then enter its width.</span><input value={calibrationInches} onChange={e=>setCalibrationInches(e.target.value)} type="number" min="1" style={{height:38,width:110,background:"#111",color:"#fff",border:"1px solid #444",borderRadius:7,padding:"0 10px"}}/><button onClick={setCalibration} style={{height:38,background:"#752eff",color:"#fff",border:0,borderRadius:7,padding:"0 15px",fontWeight:800}}>SET SCALE</button><button onClick={()=>setCalibrating(false)} style={{height:38,background:"#161a24",color:"#fff",border:"1px solid #333",borderRadius:7,padding:"0 12px"}}>CANCEL</button></div></div>}
             </div>
         </div>
         
         <div className="ns-champ-bottom-bar" style={{background:'#05060a', display:'flex', flexDirection:'column', padding:'20px 30px', borderTop:'1px solid #161a23'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                 <strong style={{fontSize:'14px', color:'#fff', fontFamily:'Space Grotesk', fontWeight:700}}>ROOM / WALL BACKGROUND</strong>
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
  </main>;
}
