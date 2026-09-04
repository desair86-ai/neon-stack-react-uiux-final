const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

const oldFunc = 'function Special({title,text,action,art}){return <article className="special"><div><h3>{title}</h3><p>{text}</p><Link to="/custom-neon">{action} <ArrowRight/></Link></div><div className="specialArt">{art}</div></article>}';

const newFunc = `function Special({title,text,action,bg,linkTo}){return <article className="special" style={{backgroundImage: "linear-gradient(90deg, rgba(7,9,16,1) 0%, rgba(7,9,16,0.9) 30%, rgba(7,9,16,0.3) 60%, rgba(7,9,16,0) 100%), url('" + bg + "')", backgroundSize: 'cover', backgroundPosition: 'center right'}}><div><h3>{title}</h3><p>{text}</p><Link className="btn ghost" to={linkTo}>{action} <ArrowRight/></Link></div></article>}`;

jsx = jsx.replace(oldFunc, newFunc);

jsx = jsx.replace(
  /<Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork\." action="CUSTOMIZE NOW" art=\{[\s\S]*?\} \/>/g,
  '<Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork." action="CUSTOMIZE NOW" linkTo="/custom-neon" bg="/images/better_together.jpg" />'
);
jsx = jsx.replace(
  /<Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200\+ effects, music sync & app control\." action="EXPLORE MOJO" art=\{[\s\S]*?\} \/>/g,
  '<Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200+ effects, music sync & app control." action="EXPLORE MOJO" linkTo="/mojo-mix" bg="/images/234 (7).png" />'
);
jsx = jsx.replace(
  /<Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish\." action="EXPLORE UV" art=\{[\s\S]*?\} \/>/g,
  '<Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish." action="EXPLORE UV" linkTo="/uv-printed" bg="/images/4.png" />'
);

fs.writeFileSync('src/main.jsx', jsx);
console.log('Fixed Special tags!');
