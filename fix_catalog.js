const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');
code = code.replace(/function CatalogGrid\(\)\{/, 'function CatalogGrid({ category }){');
code = code.replace(/useCatalogData\(\);/, 'useCatalogData(category);');
code = code.replace(/<CatalogGrid\/>/, '<CatalogGrid category={params.name}/>');
fs.writeFileSync('src/components.jsx', code);
console.log('Fixed.');
