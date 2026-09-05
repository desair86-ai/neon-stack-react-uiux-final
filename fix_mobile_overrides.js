const fs = require('fs');
let code = fs.readFileSync('src/configurator-final-fixes.css', 'utf8');

code += \n
@media (max-width: 1250px) {
    .ns-summary {
        grid-template-columns: 1fr 1fr !important;
    }
    .ns-summary-title {
        border-right: 0 !important;
    }
    .ns-price {
        border-left: 0 !important;
        border-top: 1px solid var(--line) !important;
        padding: 15px !important;
    }
    .ns-cart-cta {
        margin: 12px !important;
    }
    .ns-bg-grid {
        grid-template-columns: repeat(4, 1fr) !important;
    }
}
;

fs.writeFileSync('src/configurator-final-fixes.css', code);
console.log('Added 1250px overrides');
