const fs = require('fs');
let html = '<html><body style="background:#222;color:white">';
const files = fs.readdirSync('public/images').filter(f => f.endsWith('.png'));
files.forEach(f => {
  const stat = fs.statSync('public/images/' + f);
  if (stat.size < 800000) {
    html += `<div><h3>${f}</h3><img src="/images/${f}" style="max-height:200px"/></div>`;
  }
});
html += '</body></html>';
fs.writeFileSync('public/test_imgs.html', html);
