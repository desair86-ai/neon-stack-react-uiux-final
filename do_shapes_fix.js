const fs=require('fs');
let c=fs.readFileSync('src/ConfiguratorExperience.jsx','utf8');

const newShapePosition = 'const shapePosition=(s,side,index)=>{const offsetGap=0.6+index*0.9;const finalShapeColor=lightOn?(s.color?.hex||neonColor):darkenHex(s.color?.hex||neonColor);return {position:"absolute",top:"50%",left:side==="left"?`calc(0% - ${offsetGap}em)`:`calc(100% + ${offsetGap}em)`,color:mojo?undefined:finalShapeColor,backgroundImage:mojo?"linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)":undefined,WebkitBackgroundClip:mojo?"text":undefined,backgroundSize:mojo?"300% 100%":undefined,animation:mojo?"nsMojoSpectrum 3s linear infinite":undefined,opacity:lightOn?1:.9,transform:"translate(-50%,-50%)",fontSize:Math.max(30,fontSize*.5),filter:"none",textShadow:"none",display:"flex",alignItems:"center",justifyContent:"center"}};\n';

c = c.replace(/const shapePosition=\(s,side,index\)=>\{[^\}]+\}\};\r?\n/, newShapePosition);

const newRenderHTML = '<div className="ns-neon-art" style={{left:`${signPos.x*100}%`,top:`${signPos.y*100}%`,transform:"translate(-50%,-50%)",width:"100%",height:"100%",position:"absolute",pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><div ref={textRef} className={`ns-neon-text${mojo?" spectrum":""}`} style={{...textStyle,position:"relative",pointerEvents:"auto",cursor:isMulti?"inherit":"grab",userSelect:"none"}} onPointerDown={e=>{if(!isMulti) dragSign(e)}}>{leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}{renderText()}{rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}</div></div>';

c = c.replace(/<div className="ns-neon-art" [^>]+><div className="ns-art-shapes">.*?<\/div><div ref=\{textRef\}.*?\{renderText\(\)\}<\/div><\/div>/, newRenderHTML);

fs.writeFileSync('src/ConfiguratorExperience.jsx',c);
