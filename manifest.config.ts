import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

// Production permissions (minimal)
const prodPermissions = ["activeTab", "storage", "scripting"] as const;

// Development permissions (includes tabs for E2E testing)
const devPermissions = [...prodPermissions, "tabs"] as const;

// Use E2E env var for test builds, or check if not explicitly production
const isTestBuild = process.env.E2E === "true";

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
  permissions: isTestBuild ? [...devPermissions] : [...prodPermissions],
  // host_permissions required for E2E tests (programmatic script injection)
  ...(isTestBuild && { host_permissions: ["<all_urls>"] }),
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
