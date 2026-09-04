
const fs = require("fs");

fs.writeFileSync("app/layout.jsx", "import \"../src/styles.css\";\nexport const metadata = { title: \"Neon Stack\", description: \"Premium LED Neon Signs\" };\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}\n");

fs.writeFileSync("app/page.jsx", "import { Home } from \"../src/components\";\nexport default function Page() { return <Home />; }");
fs.writeFileSync("app/collections/page.jsx", "import { Collections } from \"../../src/components\";\nexport default function Page() { return <Collections />; }");
fs.writeFileSync("app/category/[name]/page.jsx", "import { Category } from \"../../../src/components\";\nexport default function Page() { return <Category />; }");
fs.writeFileSync("app/custom-neon/page.jsx", "import { CustomNeon } from \"../../src/components\";\nexport default function Page() { return <CustomNeon />; }");
fs.writeFileSync("app/about/page.jsx", "import { About } from \"../../src/components\";\nexport default function Page() { return <About />; }");
fs.writeFileSync("app/contact/page.jsx", "import { Contact } from \"../../src/components\";\nexport default function Page() { return <Contact />; }");
fs.writeFileSync("app/mojo-mix/page.jsx", "import { Generic } from \"../../src/components\";\nexport default function Page() { return <Generic title=\"MOJO MIX\" />; }");
fs.writeFileSync("app/uv-printed/page.jsx", "import { Generic } from \"../../src/components\";\nexport default function Page() { return <Generic title=\"UV PRINTED NEON\" />; }");
fs.writeFileSync("app/blogs/page.jsx", "import { Generic } from \"../../src/components\";\nexport default function Page() { return <Generic title=\"BLOGS\" />; }");

console.log("Pages created.");

