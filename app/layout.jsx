import "../src/styles.css";
import "../src/configurator-brand-overrides.css";
import "../src/configurator-final-fixes.css";
import { ConfiguratorFontLoader } from "../src/ConfiguratorFontLoader";
import { NeonChatBot } from "../src/NeonChatBot";

export const metadata = { title: "Neon Stack", description: "Premium LED Neon Signs" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfiguratorFontLoader />
        {children}
        <NeonChatBot />
      </body>
    </html>
  );
}
