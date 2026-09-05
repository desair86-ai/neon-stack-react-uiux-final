const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

code = code.replace('@media (max-width: 1100px) {', '@media (max-width: 1250px) {');

fs.writeFileSync('src/configurator-final-fixes.css', code);
console.log('Updated to 1250px');
