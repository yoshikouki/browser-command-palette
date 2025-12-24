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

function getContentScriptLoaderPath(): string {
  const assetsDir = path.join(EXTENSION_PATH, "assets");
  const files = fs.readdirSync(assetsDir);
  const loaderFile = files.find(
    (f) => f.includes("content-script") && f.includes("loader")
  );
  return loaderFile ? `assets/${loaderFile}` : "";
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
    if (!loaderPath) {
      throw new Error("Content script loader not found in dist/assets");
    }

    const openPalette = async (page: Page) => {
      // Get tab ID by querying tabs and matching URL
      const pageUrl = page.url();
      const tabId = await serviceWorker.evaluate(async (url: string) => {
        const tabs = await chrome.tabs.query({ url });
        return tabs[0]?.id ?? null;
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
