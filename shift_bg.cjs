const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

jsx = jsx.replace(
  /backgroundSize: 'cover', backgroundPosition: 'center right'/,
  "backgroundSize: '130%', backgroundPosition: '115% center'"
);

fs.writeFileSync('src/main.jsx', jsx);
