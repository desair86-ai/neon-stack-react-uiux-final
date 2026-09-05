const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

const index = code.indexOf('/* Move preview to top on mobile */');
if (index !== -1) {
    code = code.substring(0, index).trim();
    fs.writeFileSync('src/configurator-final-fixes.css', code);
    console.log('Removed fully');
}
