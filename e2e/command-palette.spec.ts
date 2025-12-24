import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures/extension";

const HOST_SELECTOR = "#browser-command-palette-root";
const TEST_URL = "https://example.com";
const EXTENSION_ID_PATTERN = /^[a-z]{32}$/;
const COMMAND_TITLES = {
  reload: "Reload Page",
  scrollTop: "Scroll to Top",
  scrollBottom: "Scroll to Bottom",
  goBack: "Go Back",
} as const;

interface PaletteLocators {
  host: Locator;
  backdrop: Locator;
  input: Locator;
  items: Locator;
  empty: Locator;
}

// Helper to get locators for palette elements (Playwright pierces open shadow DOM)
function getPaletteLocators(page: Page): PaletteLocators {
  const host = page.locator(HOST_SELECTOR);
  return {
    host,
    backdrop: page.locator(".command-palette-backdrop"),
    input: page.locator("[cmdk-input]"),
    items: page.locator("[cmdk-item]"),
    empty: page.locator("[cmdk-empty]"),
  };
}

async function createTestPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto(TEST_URL, { waitUntil: "domcontentloaded" });
  return page;
}

async function openPaletteOnPage(
  page: Page,
  openCommandPalette: (page: Page) => Promise<void>
): Promise<PaletteLocators> {
  await openCommandPalette(page);
  const palette = getPaletteLocators(page);
  await expect(palette.backdrop).toBeVisible();
  await expect(palette.input).toBeVisible();
  return palette;
}

test.describe("Command Palette", () => {
  test("extension loads correctly", ({ extensionId }) => {
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(EXTENSION_ID_PATTERN);
  });

  test("command palette opens", async ({ context, openCommandPalette }) => {
    const page = await createTestPage(context);

    const { input } = await openPaletteOnPage(page, openCommandPalette);
    await expect(input).toBeFocused();
  });

  test("command palette displays commands", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await createTestPage(context);

    await openPaletteOnPage(page, openCommandPalette);

    await expect(
      page.locator("[cmdk-item]", { hasText: COMMAND_TITLES.reload })
    ).toBeVisible();
    await expect(
      page.locator("[cmdk-item]", { hasText: COMMAND_TITLES.goBack })
    ).toBeVisible();
    await expect(
      page.locator("[cmdk-item]", { hasText: COMMAND_TITLES.scrollBottom })
    ).toBeVisible();
  });

  test("search filters commands", async ({ context, openCommandPalette }) => {
    const page = await createTestPage(context);

    const { input, empty } = await openPaletteOnPage(page, openCommandPalette);

    const reloadItem = page.locator("[cmdk-item]", {
      hasText: COMMAND_TITLES.reload,
    });
    const scrollItem = page.locator("[cmdk-item]", {
      hasText: COMMAND_TITLES.scrollTop,
    });

    await input.fill("reload");

    await expect(reloadItem).toBeVisible();
    await expect(scrollItem).toBeHidden();
    await expect(empty).toBeHidden();

    await input.fill("zzzz-not-a-command");
    await expect(empty).toBeVisible();
  });

  test("command executes on selection", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await createTestPage(context);

    // Make the page scrollable by adding content
    await page.evaluate(() => {
      document.body.style.height = "200vh";
    });
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForFunction(() => window.scrollY > 0);

    const { input } = await openPaletteOnPage(page, openCommandPalette);

    await input.fill(COMMAND_TITLES.scrollTop);
    await page.keyboard.press("Enter");

    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("palette closes on Escape", async ({ context, openCommandPalette }) => {
    const page = await createTestPage(context);
    const { host } = await openPaletteOnPage(page, openCommandPalette);

    await page.keyboard.press("Escape");

    await expect(host).not.toBeAttached({ timeout: 1000 });
  });

  test("palette closes on backdrop click", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await createTestPage(context);
    const { host, backdrop } = await openPaletteOnPage(
      page,
      openCommandPalette
    );

    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(host).not.toBeAttached({ timeout: 1000 });
  });
});
