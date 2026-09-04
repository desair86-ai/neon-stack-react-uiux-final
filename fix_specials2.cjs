const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

const s1 = `<img src="/images/better_together.jpg" alt="Custom Neon" style={{width: '100%', height: '150px', objectFit: 'contain'}} />`;
const r1 = `<img src="/images/32 (2).png" alt="Custom Neon" style={{width: '100%', height: '170px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255, 46, 166, 0.4))'}} />`;
jsx = jsx.replace(s1, r1);

const s2 = `<img src="/images/mojo_bg_clean.jpg" alt="Mojo Mix" style={{width: '100%', height: '150px', objectFit: 'contain', borderRadius: '8px'}} />`;
const r2 = `<img src="/images/43 (1).png" alt="Mojo Mix" style={{width: '100%', height: '170px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))'}} />`;
jsx = jsx.replace(s2, r2);

const s3 = `<img src="/images/astro_with_moon.png" alt="UV Printed" style={{width: '100%', height: '150px', objectFit: 'contain'}} />`;
const r3 = `<img src="/images/1111 (1).png" alt="UV Printed" style={{width: '100%', height: '170px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(100, 100, 255, 0.4))'}} />`;
jsx = jsx.replace(s3, r3);

fs.writeFileSync('src/main.jsx', jsx);
console.log('Images updated safely.');
