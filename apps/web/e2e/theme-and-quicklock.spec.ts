import { test, expect } from "@playwright/test";

test.describe("Theme Toggle, Privacy Mode & QuickLock Terminal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("toggles theme between Dark Obsidian and Ivory Atelier Light Mode", async ({
    page,
  }) => {
    const html = page.locator("html");
    const themeBtn = page.getByRole("button", { name: "Toggle theme" });
    await expect(themeBtn).toBeVisible({ timeout: 10000 });

    // Check initial state (default is dark)
    const initialClass = await html.getAttribute("class");
    const isInitiallyDark = initialClass?.includes("dark");

    // Click toggle
    await themeBtn.click();
    await page.waitForTimeout(300);

    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Click again to return
    await themeBtn.click();
    await page.waitForTimeout(300);

    if (isInitiallyDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });

  test("triggers QuickLock terminal modal and unlocks with showroom PIN 1234", async ({
    page,
  }) => {
    // Click Quick Lock Padlock in header
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await expect(lockBtn).toBeVisible({ timeout: 10000 });
    await lockBtn.click();

    // Verify QuickLock modal is displayed
    const modalTitle = page.getByRole("heading", { name: "Terminal Locked" });
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // Key in default PIN '1234' using the on-screen keypad buttons
    const digit1 = page.getByRole("button", { name: "1", exact: true });
    const digit2 = page.getByRole("button", { name: "2", exact: true });
    const digit3 = page.getByRole("button", { name: "3", exact: true });
    const digit4 = page.getByRole("button", { name: "4", exact: true });

    await digit1.click();
    await digit2.click();
    await digit3.click();
    await digit4.click();

    // Modal should unlock and close automatically
    await expect(modalTitle).not.toBeVisible({ timeout: 5000 });
  });

  test("toggles cost privacy mode in top header", async ({ page }) => {
    // Locate the privacy toggle button
    const privacyBtn = page.locator('button[title*="Customer Privacy Mode"]');
    await expect(privacyBtn).toBeVisible({ timeout: 10000 });

    // Initial state: "Enable Customer Privacy Mode"
    const initialTitle = await privacyBtn.getAttribute("title");
    expect(initialTitle).toContain("Enable Customer Privacy Mode");

    // Click to enable privacy mode
    await privacyBtn.click();
    const activeTitle = await privacyBtn.getAttribute("title");
    expect(activeTitle).toContain("Disable Customer Privacy Mode");

    // Click again to disable
    await privacyBtn.click();
    const finalTitle = await privacyBtn.getAttribute("title");
    expect(finalTitle).toContain("Enable Customer Privacy Mode");
  });

  test("switches operational persona and governance roles in top header", async ({
    page,
  }) => {
    // Locate the persona button in top header
    const personaBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(personaBtn).toBeVisible({ timeout: 10000 });
    await personaBtn.click();

    // Verify persona dropdown is visible
    await expect(page.locator("text=Switch Operational Persona")).toBeVisible();

    // Switch to Vikram M. (Compliance Director)
    const vikramOption = page.locator("text=Vikram M.").first();
    await expect(vikramOption).toBeVisible();
    await vikramOption.click();

    // Verify persona button reflects Vikram M.
    const activeHeaderUser = page.locator(
      'button[title*="Switch User Identity"]',
    );
    await expect(activeHeaderUser.locator("text=Vikram M.")).toBeVisible();
    await expect(
      activeHeaderUser.locator("text=Compliance Director"),
    ).toBeVisible();

    // Toast notification should appear
    await expect(
      page.locator("text=Identity Switched to Vikram M."),
    ).toBeVisible();
  });

  test("renders official JewelCore Atelier brand logo in top header and favicon link", async ({
    page,
  }) => {
    // Check header logo mark and text
    const headerLogo = page.locator('header a[title*="Control Tower"]');
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo.locator("text=JEWELCORE")).toBeVisible();
    await expect(headerLogo.locator("text=ATELIER ERP")).toBeVisible();
    await expect(
      headerLogo.locator('svg[aria-label="JewelCore Atelier Logo Mark"]'),
    ).toBeVisible();

    // Check favicon in document head
    const faviconLink = page.locator('link[rel="icon"][href*="icon.svg"]');
    await expect(faviconLink).toHaveCount(1);
  });
});
