const fs = require('fs');
let code = fs.readFileSync('src/ConfiguratorExperience.jsx', 'utf8');

code = code.replace(/alert\("Configuration ready[^"]+"\)/, "window.location.href='/cart'");

fs.writeFileSync('src/ConfiguratorExperience.jsx', code);
console.log('Fixed Configurator');
