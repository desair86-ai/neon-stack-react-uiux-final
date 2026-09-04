
const fs = require("fs");
let content = fs.readFileSync("src/components.jsx", "utf8");

content = "\"use client\";\n" + content;
content = content.replace(/import \{[^}]*\} from [\"']react-router-dom[\"'];/, "import Link from \"next/link\";\nimport { useParams, usePathname } from \"next/navigation\";");

content = content.replace(/<Link([^>]+)to=/g, "<Link$1href=");
content = content.replace(/<Link to=/g, "<Link href=");

content = content.replace(/const location = useLocation\(\);/g, "const pathname = usePathname();");
content = content.replace(/location\.pathname/g, "pathname");

content = content.replace(/function App\(\)\{[\s\S]*?\}\s*ReactDOM\.createRoot\([^)]+\)\.render\([\s\S]*?\);?/g, "");

const componentsToExport = ["Home", "Collections", "Category", "CustomNeon", "About", "Contact", "Generic"];
for (const comp of componentsToExport) {
    content = content.replace("function " + comp + "(", "export function " + comp + "(");
}

fs.writeFileSync("src/components.jsx", content, "utf8");
console.log("Refactored components.jsx");

