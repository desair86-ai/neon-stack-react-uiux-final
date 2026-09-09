import "../src/styles.css";
import "../src/configurator-brand-overrides.css";
import "../src/configurator-final-fixes.css";
import "../src/configurator-behavior-fixes.css";
import { ConfiguratorFontLoader } from "../src/ConfiguratorFontLoader";
import { ConfiguratorBehaviorPatch } from "../src/ConfiguratorBehaviorPatch";
import { NeonChatBot } from "../src/NeonChatBot";
import { CursorSpotlight } from "../src/CursorSpotlight";
import { WishlistProvider } from "../src/context/WishlistContext";
export const metadata = { title: "Neon Stack", description: "Premium LED Neon Signs" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CursorSpotlight />
        <ConfiguratorFontLoader />
        <ConfiguratorBehaviorPatch />
        <WishlistProvider>
          {children}
        </WishlistProvider>
        <NeonChatBot />
      </body>
    </html>
  );
}
