const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

jsx = jsx.replace(/transform: 'scale\(1\.8\)'/, "transform: 'scale(2.5)'");

fs.writeFileSync('src/main.jsx', jsx);
