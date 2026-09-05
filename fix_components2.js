const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

code = code.replace(/alert\('Added'\)/g, "window.location.href='/cart'");

fs.writeFileSync('src/components.jsx', code);
console.log('Fixed ProductCard Add to Cart');
