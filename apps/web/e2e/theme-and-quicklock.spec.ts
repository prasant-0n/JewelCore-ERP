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

  test("displays authenticated operator profile and session details in top header", async ({
    page,
  }) => {
    // Locate the user profile button in top header
    const personaBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(personaBtn).toBeVisible({ timeout: 10000 });
    await personaBtn.click();

    // Verify user profile dropdown is visible with authenticated operator details
    await expect(page.locator("text=Active Operator Profile")).toBeVisible();
    await expect(page.getByText("Authenticated", { exact: true })).toBeVisible();

    // Verify current user details (default hydrated staff: Rachel R.)
    await expect(page.locator("text=Rachel R.").first()).toBeVisible();
    await expect(page.locator("text=rachel.r@jewelcore.internal")).toBeVisible();
    await expect(
      page
        .locator("text=Full Atelier Access & Corporate Governance")
        .or(page.locator("text=Full Atelier PBAC")),
    ).toBeVisible();

    // Verify multi-user persona switcher is NOT present (only logged-in user is displayed)
    await expect(page.locator("text=Switch Operational Persona")).toHaveCount(0);

    // Verify Sign Out button is visible
    await expect(page.locator("text=Sign Out of Workstation")).toBeVisible();
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

  test("switches branch store and multi-tenant vault context in top header", async ({
    page,
  }) => {
    // Locate the branch store selector button in top header
    const storeBtn = page.locator('button[title*="Switch Active Store"]');
    await expect(storeBtn).toBeVisible({ timeout: 10000 });
    await expect(storeBtn.locator("text=Downtown Showroom")).toBeVisible();
    await expect(storeBtn.locator("text=INV-11")).toBeVisible();

    // Open store dropdown
    await storeBtn.click();
    await expect(page.locator("text=Branch Store & Vault Hubs")).toBeVisible();
    await expect(page.locator("text=3 Online")).toBeVisible();

    // Switch to Central Treasury Vault Hub (VAULT-01)
    const vaultOption = page.locator("text=Central Treasury Vault Hub").first();
    await expect(vaultOption).toBeVisible();
    await vaultOption.click();

    // Verify header button reflects Central Treasury Vault Hub
    await expect(storeBtn.locator("text=Central Treasury Vault Hub")).toBeVisible();
    await expect(storeBtn.locator("text=VAULT-01")).toBeVisible();

    // Verify toast confirmation
    await expect(
      page.locator("text=Active Branch: Central Treasury Vault Hub"),
    ).toBeVisible();

    // Verify dashboard greeting reflects switched branch
    await expect(
      page.locator("text=Central Treasury Vault Hub (VAULT-01)"),
    ).toBeVisible();

    // Switch to Uptown Luxury Boutique (SHOW-02)
    await storeBtn.click();
    const uptownOption = page.locator("text=Uptown Luxury Boutique").first();
    await expect(uptownOption).toBeVisible();
    await uptownOption.click();

    // Verify header reflects SHOW-02
    await expect(storeBtn.locator("text=Uptown Luxury Boutique")).toBeVisible();
    await expect(storeBtn.locator("text=SHOW-02")).toBeVisible();
    await expect(
      page.locator("text=Active Branch: Uptown Luxury Boutique"),
    ).toBeVisible();
  });
});
