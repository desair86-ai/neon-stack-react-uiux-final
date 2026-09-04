const fs = require('fs');

let css = fs.readFileSync('src/styles.css', 'utf8');
css = css.replace(/font-size:\s*11px/g, 'font-size:12px');
css = css.replace(/font-size:\s*9px/g, 'font-size:11px');
fs.writeFileSync('src/styles.css', css);

let jsx = fs.readFileSync('src/main.jsx', 'utf8');
jsx = jsx.replace(/fontSize:\s*'11px'/g, "fontSize: '12px'");
jsx = jsx.replace(/fontSize:\s*'9px'/g, "fontSize: '11px'");
fs.writeFileSync('src/main.jsx', jsx);

console.log('Done');
