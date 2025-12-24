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
  return loaderFile ? `/assets/${loaderFile}` : "";
}

interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  openCommandPalette: (page: Page) => Promise<void>;
}

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
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
    const loaderPath = getContentScriptLoaderPath();

    const openPalette = async (page: Page) => {
      const pageUrl = page.url();

      // Inject the content script loader via service worker
      const result = await serviceWorker.evaluate(
        async ({ url, scriptPath }: { url: string; scriptPath: string }) => {
          try {
            const tabs = await chrome.tabs.query({ url });
            if (tabs.length === 0 || !tabs[0].id) {
              return { success: false, error: "No tabs found" };
            }
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: [scriptPath],
            });
            return { success: true };
          } catch (e) {
            return {
              success: false,
              error: e instanceof Error ? e.message : String(e),
            };
          }
        },
        { url: pageUrl, scriptPath: loaderPath }
      );

      if (!result.success) {
        throw new Error(`Failed to inject command palette: ${result.error}`);
      }

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
