const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

// 1. Update useCatalogData definition
code = code.replace('function useCatalogData() {', 'function useCatalogData(categorySlug = null) {');
code = code.replace('getProducts().then(fetched => {', 'getProducts(categorySlug).then(fetched => {');
code = code.replace('}, []);', '}, [categorySlug]);');

// 2. Update CatalogGrid definition
code = code.replace('function CatalogGrid(){', 'function CatalogGrid({ category }){');
code = code.replace('const { items: products, maxPrice, sizes } = useCatalogData();', 'const { items: products, maxPrice, sizes } = useCatalogData(category);');

// 3. Update Category component only (find the exact one)
code = code.replace('export function Category({name}){const params=useParams();', 'export function Category({name}){const params=useParams();'); // Just to anchor
code = code.replace('</div><CatalogGrid/></main><Footer/></>}', '</div><CatalogGrid category={params.name}/></main><Footer/></>}');

fs.writeFileSync('src/components.jsx', code);
console.log('Final fix done.');
