const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// fix Collections
code = code.replace(/<CatalogGrid category=\{params.name\}\/>/, '<CatalogGrid/>');

// fix Category
code = code.replace(/<CatalogGrid\/>/, '<CatalogGrid category={params.name}/>');

fs.writeFileSync('src/components.jsx', code);
console.log('Fixed.');
