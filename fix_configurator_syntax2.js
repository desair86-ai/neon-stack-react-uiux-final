const fs = require('fs');
let code = fs.readFileSync('src/ConfiguratorExperience.jsx', 'utf8');

code = code.replace("{ if(complete) window.location.href='/cart'; }", "(complete ? window.location.href='/cart' : null)");

fs.writeFileSync('src/ConfiguratorExperience.jsx', code);
console.log('Fixed syntax again');
