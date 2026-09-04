const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

// Replace the Special component background gradient to be bottom-to-top instead of left-to-right
jsx = jsx.replace(
  /linear-gradient\(90deg, [^\)]+\)/,
  "linear-gradient(0deg, rgba(7,9,16,1) 0%, rgba(7,9,16,0.85) 45%, rgba(7,9,16,0) 90%)"
);

// Reset background size and position
jsx = jsx.replace(/backgroundSize: '130%', backgroundPosition: '115% center'/, "backgroundSize: 'cover', backgroundPosition: 'center top'");

fs.writeFileSync('src/main.jsx', jsx);

let css = fs.readFileSync('src/styles.css', 'utf8');
// Update .special layout to align text at the bottom and make the card taller
css = css.replace(/align-items:center;/, 'align-items:flex-end;');
css = css.replace(/min-height:180px;/, 'min-height:300px;');
css = css.replace(/\.special > div \{ width: 55%; \}/, '.special > div { width: 100%; }');

fs.writeFileSync('src/styles.css', css);
console.log('Updated to bottom-aligned text overlay');
