const fs = require('fs');
let code = fs.readFileSync('src/components.jsx', 'utf8');

code = code.replace('<button className="account"><UserRound/></button>', '<Link href="/account" className="account"><UserRound/></Link>');
code = code.replace('<button><ShoppingCart/><em>2</em></button>', '<Link href="/cart"><ShoppingCart/></Link>');

fs.writeFileSync('src/components.jsx', code);
console.log('Fixed Header');
