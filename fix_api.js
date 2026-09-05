const fs = require('fs');
let code = fs.readFileSync('src/lib/api.js', 'utf8');
code = code.replace(/export async function getProducts\(\) \{/, 'export async function getProducts(categorySlug = null) {');
code = code.replace(/products\(first: 50\) \{/, 'products(first: 100, where: { categoryIn: categorySlug ? [categorySlug] : undefined }) {');
// That's invalid GraphQL. I'll just write it manually.
