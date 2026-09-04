const fs = require('fs');
let jsx = fs.readFileSync('src/main.jsx', 'utf8');

jsx = jsx.replace(
  /<img src="\/images\/better_together\.jpg" alt="Custom Neon" style=\{\{width: '100%', height: '150px', objectFit: 'contain'\}\} \/>/g,
  '<img src="/images/32 (2).png" alt="Custom Neon" style={{width: \\'100%\\', height: \\'160px\\', objectFit: \\'contain\\', filter: \\'drop-shadow(0 0 10px rgba(255, 46, 166, 0.4))\\'}} />'
);

jsx = jsx.replace(
  /<img src="\/images\/mojo_bg_clean\.jpg" alt="Mojo Mix" style=\{\{width: '100%', height: '150px', objectFit: 'contain', borderRadius: '8px'\}\} \/>/g,
  '<img src="/images/43 (1).png" alt="Mojo Mix" style={{width: \\'100%\\', height: \\'160px\\', objectFit: \\'contain\\', filter: \\'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))\\'}} />'
);

jsx = jsx.replace(
  /<img src="\/images\/astro_with_moon\.png" alt="UV Printed" style=\{\{width: '100%', height: '150px', objectFit: 'contain'\}\} \/>/g,
  '<img src="/images/1111 (1).png" alt="UV Printed" style={{width: \\'100%\\', height: \\'160px\\', objectFit: \\'contain\\', filter: \\'drop-shadow(0 0 10px rgba(100, 100, 255, 0.4))\\'}} />'
);

fs.writeFileSync('src/main.jsx', jsx);
console.log('Images updated.');
