const fs=require('fs');
let c=fs.readFileSync('src/ConfiguratorExperience.jsx','utf8');
c = c.replace(/<div className="ns-art-shapes">.*?<\/div><div ref={textRef} className=\{\
s-neon-text\$\{mojo\?" spectrum":""\}\\} style=\{\{\.\.\.textStyle,pointerEvents:"auto",cursor:isMulti\?"inherit":"grab",userSelect:"none"\}\} onPointerDown=\{e=>\{if\(!isMulti\) dragSign\(e\)\}\}>\{renderText\(\)\}<\/div>/, '<div ref={textRef} className={
s-neon-text} style={{...textStyle,position:"relative",pointerEvents:"auto",cursor:isMulti?"inherit":"grab",userSelect:"none"}} onPointerDown={e=>{if(!isMulti) dragSign(e)}}>{leftShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"left",i)}>{shapeIcon(s.name,"1em")}</span>)}{renderText()}{rightShapes.map((s,i)=><span key={s.uid} style={shapePosition(s,"right",i)}>{shapeIcon(s.name,"1em")}</span>)}</div>');
fs.writeFileSync('src/ConfiguratorExperience.jsx',c);
