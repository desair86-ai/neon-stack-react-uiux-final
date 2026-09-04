import "../src/styles.css";
export const metadata = { title: "Neon Stack", description: "Premium LED Neon Signs" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
