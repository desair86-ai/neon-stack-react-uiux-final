const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

const s1 = /<img src="\/images\/32 \(2\)\.png" alt="Custom Neon"[^>]+>/;
const r1 = `<div style={{width: '100%', height: '170px', overflow: 'hidden', borderRadius: '8px'}}><img src="/images/better_together.jpg" alt="Custom Neon" style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.8)', transformOrigin: 'center center'}} /></div>`;
jsx = jsx.replace(s1, r1);

const s2 = /<img src="\/images\/43 \(1\)\.png" alt="Mojo Mix"[^>]+>/;
const r2 = `<img src="/images/234 (7).png" alt="Mojo Mix" style={{width: '100%', height: '170px', objectFit: 'contain'}} />`;
jsx = jsx.replace(s2, r2);

const s3 = /<img src="\/images\/1111 \(1\)\.png" alt="UV Printed"[^>]+>/;
const r3 = `<img src="/images/4.png" alt="UV Printed" style={{width: '100%', height: '170px', objectFit: 'contain'}} />`;
jsx = jsx.replace(s3, r3);

fs.writeFileSync('src/main.jsx', jsx);
console.log('Images updated with new requested files.');
