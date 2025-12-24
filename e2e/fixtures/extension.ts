import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type BrowserContext,
  test as base,
  chromium,
  type Page,
  type Worker,
} from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, "../../dist");
const MANIFEST_PATH = path.join(EXTENSION_PATH, "manifest.json");

interface ExtensionManifest {
  background?: {
    service_worker?: string;
  };
}

function readManifest(): ExtensionManifest {
  const manifestRaw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(manifestRaw) as ExtensionManifest;
}

function resolveDistPath(relativePath: string): string {
  return path.resolve(EXTENSION_PATH, relativePath.replace(/^\//, ""));
}

function getServiceWorkerModulePath(manifest: ExtensionManifest): string {
  const loaderPath = manifest.background?.service_worker;
  if (!loaderPath) {
    throw new Error("Service worker loader not found in manifest.json");
  }

  const loaderAbsPath = resolveDistPath(loaderPath);
  const loaderSource = fs.readFileSync(loaderAbsPath, "utf-8");
  const importMatch = loaderSource.match(/import\s+["'](.+?)["']/);
  if (!importMatch?.[1]) {
    throw new Error(
      `Service worker module not found in ${path.basename(loaderPath)}`
    );
  }

  return path.resolve(path.dirname(loaderAbsPath), importMatch[1]);
}

function getContentScriptLoaderPath(): string {
  const manifest = readManifest();
  const serviceWorkerModulePath = getServiceWorkerModulePath(manifest);
  const serviceWorkerSource = fs.readFileSync(serviceWorkerModulePath, "utf-8");

  const loaderMatch = serviceWorkerSource.match(
    /["'](\/assets\/[^"']*content-script[^"']*loader[^"']*\.js)["']/
  );
  if (!loaderMatch?.[1]) {
    throw new Error("Content script loader not found in service worker bundle");
  }

  const loaderPath = loaderMatch[1].replace(/^\//, "");
  const loaderAbsPath = resolveDistPath(loaderPath);
  if (!fs.existsSync(loaderAbsPath)) {
    throw new Error(`Content script loader not found: ${loaderPath}`);
  }

  return loaderPath;
}

interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  openCommandPalette: (page: Page) => Promise<void>;
}

export const test = base.extend<ExtensionFixtures>({
  context: async (_fixtures, use) => {
    // Default to headless, use HEADED=true to show browser
    const headless = process.env.HEADED !== "true";

    const context = await chromium.launchPersistentContext("", {
      headless,
      channel: "chromium",
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }
    await use(serviceWorker);
  },

  extensionId: async ({ serviceWorker }, use) => {
    const extensionId = serviceWorker.url().split("/")[2];
    await use(extensionId);
  },

  openCommandPalette: async ({ serviceWorker }, use) => {
    // Get loader path at fixture setup time
    const loaderPath = getContentScriptLoaderPath();

    const openPalette = async (page: Page) => {
      await page.bringToFront();
      // Get tab ID by querying tabs and matching URL
      const pageUrl = page.url();
      const tabId = await serviceWorker.evaluate(async (url: string) => {
        const activeTabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (activeTabs[0]?.id) {
          return activeTabs[0].id;
        }

        if (url) {
          const urlTabs = await chrome.tabs.query({ url });
          if (urlTabs[0]?.id) {
            return urlTabs[0].id;
          }
        }

        const allTabs = await chrome.tabs.query({});
        return allTabs[0]?.id ?? null;
      }, pageUrl);

      if (!tabId) {
        throw new Error(`Could not find tab ID for URL: ${pageUrl}`);
      }

      // Inject the content script via the service worker
      await serviceWorker.evaluate(
        async ({
          tabId,
          loaderPath,
        }: {
          tabId: number;
          loaderPath: string;
        }) => {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: [loaderPath],
          });
        },
        { tabId, loaderPath }
      );

      // Wait for the command palette to be visible
      await page.locator(".command-palette-backdrop").waitFor({
        state: "visible",
        timeout: 5000,
      });
    };

    await use(openPalette);
  },
});

export { expect } from "@playwright/test";
