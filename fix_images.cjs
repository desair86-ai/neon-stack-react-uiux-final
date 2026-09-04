const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

// Fix the mangled backgroundImage
jsx = jsx.replace(
  /style={{backgroundImage: "linear-gradient[^"]+", backgroundSize: 'cover', backgroundPosition: 'center top'}}/g,
  `style={{backgroundImage: "linear-gradient(0deg, rgba(7,9,16,1) 0%, rgba(7,9,16,0.85) 45%, rgba(7,9,16,0) 90%), url('" + bg + "')", backgroundSize: 'cover', backgroundPosition: 'center top'}}`
);

fs.writeFileSync('src/main.jsx', jsx);

let css = fs.readFileSync('src/styles.css', 'utf8');

// Replace the glowing border with a plain dark border and transition
css = css.replace(
  /border:1px solid rgba\(255, 60, 168, 0\.4\);border-radius:12px;box-shadow:0 0 15px rgba\(255, 60, 168, 0\.12\), inset 0 0 10px rgba\(255, 60, 168, 0\.08\);/g,
  "border:1px solid #191c25;border-radius:12px;transition:all 0.3s ease;"
);

// Add the hover effect for the border
css += "\n.special:hover { border-color: rgba(255, 60, 168, 0.5); box-shadow: 0 0 15px rgba(255, 60, 168, 0.15), inset 0 0 10px rgba(255, 60, 168, 0.1); }\n";

fs.writeFileSync('src/styles.css', css);
console.log('Fixed background images and hover border');
