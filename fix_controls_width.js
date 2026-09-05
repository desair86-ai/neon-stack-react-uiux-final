const fs = require('fs');
let code = fs.readFileSync('src/configurator.css', 'utf8');

code = code.replace('.ns-controls{position:relative;top:0}', '.ns-controls{position:relative;top:0;width:100%;max-width:100%}');

fs.writeFileSync('src/configurator.css', code);
console.log('Fixed ns-controls width');
