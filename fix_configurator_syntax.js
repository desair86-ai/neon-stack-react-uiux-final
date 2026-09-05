const fs = require('fs');
let code = fs.readFileSync('src/ConfiguratorExperience.jsx', 'utf8');

code = code.replace("complete&&window.location.href='/cart'", "{ if(complete) window.location.href='/cart'; }");

fs.writeFileSync('src/ConfiguratorExperience.jsx', code);
console.log('Fixed syntax');
