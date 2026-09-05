const fs = require('fs');
let code = fs.readFileSync('src/configurator.css', 'utf8');

code = code.replace('.ns-config-layout{display:flex;flex-direction:column-reverse;gap:20px}', '.ns-config-layout{display:flex;flex-direction:column-reverse;gap:20px;align-items:stretch;width:100%}');

fs.writeFileSync('src/configurator.css', code);
console.log('Fixed flex stretch');
