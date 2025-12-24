import { expect, test } from "./fixtures/extension";

const HOST_SELECTOR = "#browser-command-palette-root";

// Helper to get locators for Shadow DOM elements
function getShadowLocators(page: import("@playwright/test").Page) {
  const host = page.locator(HOST_SELECTOR);
  return {
    host,
    backdrop: page.locator(".command-palette-backdrop"),
    input: page.locator("[cmdk-input]"),
    items: page.locator("[cmdk-item]"),
  };
}

test.describe("Command Palette", () => {
  test("extension loads correctly", async ({ extensionId }) => {
    expect(extensionId).toBeTruthy();
    expect(extensionId).toMatch(/^[a-z]{32}$/);
  });

  test("command palette opens", async ({ context, openCommandPalette }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    await openCommandPalette(page);

    const { backdrop, input } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();
    await expect(input).toBeVisible();
  });

  test("command palette displays commands", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    await openCommandPalette(page);

    const { backdrop, items } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();

    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test("search filters commands", async ({ context, openCommandPalette }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    await openCommandPalette(page);

    const { backdrop, input, items } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();

    await input.fill("reload");

    const count = await items.count();
    expect(count).toBeLessThan(11);

    const reloadItem = page.locator("[cmdk-item]", { hasText: "Reload Page" });
    await expect(reloadItem).toBeVisible();
  });

  test("command executes on selection", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    // Make the page scrollable by adding content
    await page.evaluate(() => {
      document.body.style.height = "200vh";
    });
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForFunction(() => window.scrollY > 0);

    await openCommandPalette(page);

    const { backdrop, input } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();

    await input.fill("Scroll to Top");
    await page.keyboard.press("Enter");

    await page.waitForFunction(() => window.scrollY === 0, null, {
      timeout: 3000,
    });
  });

  test("palette closes on Escape", async ({ context, openCommandPalette }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    await openCommandPalette(page);

    const { host, backdrop } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(host).not.toBeAttached({ timeout: 1000 });
  });

  test("palette closes on backdrop click", async ({
    context,
    openCommandPalette,
  }) => {
    const page = await context.newPage();
    await page.goto("https://example.com");

    await openCommandPalette(page);

    const { host, backdrop } = getShadowLocators(page);
    await expect(backdrop).toBeVisible();

    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(host).not.toBeAttached({ timeout: 1000 });
  });
});
