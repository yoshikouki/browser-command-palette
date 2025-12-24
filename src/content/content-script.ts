import { createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CommandPalette } from "@/components/command-palette";
import styles from "./content-script.css?inline";

const HOST_ID = "browser-command-palette-root";

// Toggle command palette
const existing = document.getElementById(HOST_ID);
if (existing) {
  existing.remove();
} else {
  // Create host element
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  // Attach Shadow DOM for style isolation
  const shadow = host.attachShadow({ mode: "open" });

  // Inject styles
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  shadow.appendChild(styleElement);

  // Create container for React
  const container = document.createElement("div");
  container.id = "browser-command-palette-container";
  shadow.appendChild(container);

  // Render React app using createElement instead of JSX
  const root = createRoot(container);
  root.render(
    createElement(
      StrictMode,
      null,
      createElement(CommandPalette, {
        onClose: () => {
          root.unmount();
          host.remove();
        },
      })
    )
  );
}
