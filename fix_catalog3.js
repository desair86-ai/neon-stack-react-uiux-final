const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// The exact string to replace in Collections:
code = code.replace('<CatalogGrid category={params.name}/></main><Footer/></>}', '<CatalogGrid/></main><Footer/></>}');

// The exact string to replace in Category:
code = code.replace('</div><CatalogGrid/></main><Footer/></>}', '</div><CatalogGrid category={params.name}/></main><Footer/></>}');

fs.writeFileSync('src/components.jsx', code);
console.log('Fixed.');
