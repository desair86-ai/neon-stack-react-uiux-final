const fs = require('fs');
let lines = fs.readFileSync('src/components.jsx', 'utf8').split('\n');

// 1. Find function CatalogGrid() and replace with function CatalogGrid({ category })
// 2. Find useCatalogData() inside CatalogGrid and replace with useCatalogData(category)
// 3. Find <CatalogGrid/> inside Category and replace with <CatalogGrid category={params.name}/>

let inCatalog = false;
let inCategory = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function CatalogGrid()')) {
        lines[i] = lines[i].replace('function CatalogGrid()', 'function CatalogGrid({ category })');
        inCatalog = true;
    }
    
    if (inCatalog && lines[i].includes('useCatalogData()')) {
        lines[i] = lines[i].replace('useCatalogData()', 'useCatalogData(category)');
        inCatalog = false; // Done with CatalogGrid modification
    }
    
    if (lines[i].includes('export function Category({name})')) {
        inCategory = true;
    }
    
    if (inCategory && lines[i].includes('<CatalogGrid/>')) {
        lines[i] = lines[i].replace('<CatalogGrid/>', '<CatalogGrid category={params.name}/>');
        inCategory = false; // Done
    }
}

fs.writeFileSync('src/components.jsx', lines.join('\n'));
console.log('Fixed lines.');
