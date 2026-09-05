const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// Replace exactly inside Category component
code = code.replace(/<CatalogGrid\/><\/main><Footer\/><\/>\}/g, '<CatalogGrid category={params.name}/></main><Footer/></>}');

fs.writeFileSync('src/components.jsx', code);
console.log('Done.');
