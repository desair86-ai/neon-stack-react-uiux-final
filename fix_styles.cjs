
const fs = require("fs");
let content = fs.readFileSync("src/styles.css", "utf8");

content = content.replace(/\.headerActions em\{([^}]+)background:var\(--pink\);([^}]+)\}/g, ".headerActions em{$1background:#752eff;$2}");

content = content.replace(/\.primary\{background:linear-gradient\(90deg,#00ffbc,#752eff\)/g, ".primary{background:linear-gradient(90deg,#752eff,#00ffbc)");

content = content.replace(/(\.heroBtns \.btn,\.btn\.primary\{[^}]+)background:linear-gradient\(90deg,#00ffbc,#752eff\)/g, "$1background:linear-gradient(90deg,#752eff,#00ffbc)");

fs.writeFileSync("src/styles.css", content, "utf8");
console.log("Fixed styles");

