const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

code = code.replace('@media (min-width: 1251px) {\n    .ns-preview-panel {\n        position: sticky;\n        top: 20px; /* Adjust if there is a sticky header */\n        height: calc(100vh - 40px);\n        display: flex;\n        flex-direction: column;\n        border-radius: 12px;\n        overflow: hidden;\n    }', '.ns-preview-panel {\n        display: flex;\n        flex-direction: column;\n        border-radius: 12px;\n        overflow: hidden;\n        width: 100%;\n    }\n\n    @media (min-width: 1251px) {\n    .ns-preview-panel {\n        position: sticky;\n        top: 20px;\n        height: calc(100vh - 40px);\n    }');

fs.writeFileSync('src/configurator-final-fixes.css', code);
console.log('Fixed preview panel flex globally');
