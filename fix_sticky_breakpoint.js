const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

code = code.replace('@media (min-width: 1101px)', '@media (min-width: 1251px)');

fs.writeFileSync('src/configurator-final-fixes.css', code);
console.log('Fixed sticky breakpoint');
