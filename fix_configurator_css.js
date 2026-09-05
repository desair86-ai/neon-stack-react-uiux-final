const fs = require('fs');
let code = fs.readFileSync('src/configurator.css', 'utf8');

// Replace @media(max-width:1100px) with @media(max-width:1250px)
code = code.replace('@media(max-width:1100px)', '@media(max-width:1250px)');

// And add flex-direction: column-reverse
code = code.replace('.ns-config-layout{grid-template-columns:1fr}', '.ns-config-layout{display:flex;flex-direction:column-reverse}');

fs.writeFileSync('src/configurator.css', code);
console.log('Fixed configurator.css media query');
