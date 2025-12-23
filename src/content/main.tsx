import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import styles from "./index.css?inline";
import App from "./views/app.tsx";

// Create host element for Shadow DOM
const host = document.createElement("div");
host.id = "browser-command-palette-root";
document.body.appendChild(host);

// Attach Shadow DOM for style isolation
const shadow = host.attachShadow({ mode: "open" });

// Inject styles into Shadow DOM
const styleElement = document.createElement("style");
styleElement.textContent = styles;
shadow.appendChild(styleElement);

// Create container for React app
const container = document.createElement("div");
container.id = "browser-command-palette-container";
shadow.appendChild(container);

// Render React app
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
