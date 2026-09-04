const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

// 1. Replace the Special component definition
jsx = jsx.replace(
  /function Special\(\{title,text,action,art\}\)\{return <div className="special"><div><h4>\{title\}<\/h4><p>\{text\}<\/p><Link className="btn ghost" to="#">\{action\} <ArrowRight\/><\/Link><\/div>\{art\}<\/div>\}/g,
  `function Special({title,text,action,bg}){return <div className="special" style={{backgroundImage: \\\`linear-gradient(to right, rgba(7,9,16,1) 0%, rgba(7,9,16,0.85) 45%, rgba(7,9,16,0.1) 100%), url('\${bg}')\\\`, backgroundSize: 'cover', backgroundPosition: 'center right'}}><div><h4>{title}</h4><p>{text}</p><Link className="btn ghost" to="#">{action} <ArrowRight/></Link></div></div>}`
);

// 2. Replace the usages of Special
// Usage 1
jsx = jsx.replace(
  /<Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork\." action="CUSTOMIZE NOW" art=\{<div[^>]+><img src="\/images\/better_together\.jpg"[^>]+><\/div>\} \/>/g,
  `<Special title="CUSTOM NEON SIGN" text="Design your own text, logo or artwork." action="CUSTOMIZE NOW" bg="/images/better_together.jpg" />`
);

// Usage 2
jsx = jsx.replace(
  /<Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200\+ effects, music sync & app control\." action="EXPLORE MOJO" art=\{<img src="\/images\/234 \(7\)\.png"[^>]+>\} \/>/g,
  `<Special title="MOJO MIX NEON SIGN" text="Next-gen RGB neon with 200+ effects, music sync & app control." action="EXPLORE MOJO" bg="/images/234 (7).png" />`
);

// Usage 3
jsx = jsx.replace(
  /<Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish\." action="EXPLORE UV" art=\{<img src="\/images\/4\.png"[^>]+>\} \/>/g,
  `<Special title="UV PRINTED NEON" text="Intricate designs with UV printed backing for a premium finish." action="EXPLORE UV" bg="/images/4.png" />`
);

fs.writeFileSync('src/main.jsx', jsx);
console.log('Done replacing Special component.');
