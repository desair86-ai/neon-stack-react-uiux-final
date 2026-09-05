const fs = require('fs');
const files = ['src/styles.css', 'src/configurator.css', 'src/configurator-brand-overrides.css'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let css = fs.readFileSync(file, 'utf8');
    
    // We will find blocks like selector { ... font-size: Xpx ... }
    // A simple way is to match font-size: \d+px everywhere and manually check if it's a header.
    // Actually, it's safer to just regex replace font-size:\s*(\d+)px.
    // Let's first just find all occurrences of font-size: \d+px and see where they are.
    
    // Let's parse with a simple regex for blocks: ([^{]+)\{([^}]+)\}
    let newCss = css.replace(/([^{]+)\{([^}]+)\}/g, (match, selector, body) => {
        if (selector.match(/h[1-6]/i) || selector.match(/heroNeon/i) || selector.match(/neonText/i)) {
            // Don't touch headers or the neon text sizes (which should scale based on config)
            return match;
        }
        
        let newBody = body.replace(/font-size:\s*(\d+)px/g, (m, size) => {
            let s = parseInt(size, 10);
            return 'font-size: ' + (s + 2) + 'px';
        });
        return selector + '{' + newBody + '}';
    });
    
    fs.writeFileSync(file, newCss);
}
console.log('Fonts updated.');
