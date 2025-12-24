import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    24: "public/logo.png",
  },
  action: {
    default_icon: {
      24: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  permissions: ["activeTab", "storage", "scripting"],
  commands: {
    "toggle-command-palette": {
      suggested_key: {
        default: "Ctrl+Shift+P",
        mac: "Command+Shift+P",
      },
      description: "Toggle command palette",
    },
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
});
