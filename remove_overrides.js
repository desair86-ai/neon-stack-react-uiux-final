const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

// The block we added:
/*
@media (max-width: 1250px) {
    .ns-summary { grid-template-columns: 1fr 1fr !important; }
    ...
}
*/
const startIndex = code.indexOf('@media (max-width: 1250px) {\r\n    .ns-summary {');
if (startIndex !== -1) {
    code = code.substring(0, startIndex).trim();
    fs.writeFileSync('src/configurator-final-fixes.css', code);
    console.log('Removed messy overrides');
} else {
    // try searching for generic 1250px
    const index2 = code.indexOf('@media (max-width: 1250px) {');
    if (index2 !== -1) {
        code = code.substring(0, index2).trim();
        fs.writeFileSync('src/configurator-final-fixes.css', code);
        console.log('Removed messy overrides by substring');
    } else {
        console.log('Could not find the block to remove');
    }
}
