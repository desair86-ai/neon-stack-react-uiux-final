const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// Replace exactly inside Collections component
code = code.replace(/export function Collections\(\)\{(.+?)<CatalogGrid category=\{params.name\}\/><\/main><Footer\/><\/>\}/s, 'export function Collections(){<CatalogGrid/></main><Footer/></>}');

fs.writeFileSync('src/components.jsx', code);
console.log('Done Collections.');
