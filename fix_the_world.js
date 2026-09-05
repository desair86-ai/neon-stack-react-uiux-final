const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// 1. Update useCatalogData
code = code.replace('function useCatalogData() {', 'function useCatalogData(categorySlug = null) {');
code = code.replace('getProducts().then(fetched => {', 'getProducts(categorySlug).then(fetched => {');
code = code.replace('}, []);', '}, [categorySlug]);');

// 2. Update CatalogGrid
code = code.replace('function CatalogGrid(){', 'function CatalogGrid({ category }){');
code = code.replace('const { items: products, maxPrice, sizes } = useCatalogData();', 'const { items: products, maxPrice, sizes } = useCatalogData(category);');

// 3. Update Category exactly
// Find the exact block starting with xport function Category up to the next } 
code = code.replace(/export function Category\(\{name\}\)\{(.+?)<CatalogGrid\/>/s, 'export function Category({name}){<CatalogGrid category={params.name}/>');

fs.writeFileSync('src/components.jsx', code);
console.log('Fixed.');
