const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');
const start = jsx.indexOf('<section className="businessBand container">');
if(start > -1) {
  const end = jsx.indexOf('</section>', start) + 10;
  jsx = jsx.substring(0, start) + jsx.substring(end);
  fs.writeFileSync('src/main.jsx', jsx);
  console.log('Removed successfully.');
}
