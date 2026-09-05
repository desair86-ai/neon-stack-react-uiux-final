import "../src/styles.css";
import "../src/configurator-brand-overrides.css";
import { NeonChatBot } from "../src/NeonChatBot";

export const metadata = { title: "Neon Stack", description: "Premium LED Neon Signs" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <NeonChatBot />
      </body>
    </html>
  );
}
