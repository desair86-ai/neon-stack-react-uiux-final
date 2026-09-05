
const fs = require('fs');
let content = fs.readFileSync('src/lib/api.js', 'utf8');

content = content.replace(
  'nodes { id name slug image { sourceUrl } }',
  'nodes { id name slug image { sourceUrl } ... on SimpleProduct { regularPrice salePrice } ... on VariableProduct { regularPrice salePrice } }'
);

const newMapping = \(() => {
      let badge = '';
      if (p.salePrice && p.regularPrice) {
        const sale = parseFloat(p.salePrice.replace(/[^0-9.-]+/g, ''));
        const reg = parseFloat(p.regularPrice.replace(/[^0-9.-]+/g, ''));
        if (reg > sale && reg > 0) {
          const discount = Math.round(((reg - sale) / reg) * 100);
          badge = discount + '% OFF';
        }
      }
      return badge;
    })(),
    p.salePrice || p.regularPrice || '4,999'\;

content = content.replace(/'',\s*'4,999'/g, newMapping);
fs.writeFileSync('src/lib/api.js', content, 'utf8');

