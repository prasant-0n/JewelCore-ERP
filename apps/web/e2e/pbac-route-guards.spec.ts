import { test, expect } from "@playwright/test";

test.describe("Atelier PBAC Route Protection & Workstation Governance (Step 1)", () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.goto("/login");
  });

  test("unauthenticated employee session is redirected to /login with redirect query param", async ({
    page,
  }) => {
    // Explicitly set logged-out state
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("jewelcore_logged_out", "true");
    });

    // Attempt to access protected accounting workstation directly
    await page.goto("/accounting");

    // RouteGuard should intercept and redirect to /login?redirect=%2Faccounting
    await page.waitForURL("**/login?redirect=%2Faccounting", { timeout: 10000 });
    expect(page.url()).toContain("/login?redirect=%2Faccounting");

    // Log in with valid credentials
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should honor the redirect param and land directly on /accounting!
    await page.waitForURL("**/accounting", { timeout: 10000 });
    expect(page.url()).toContain("/accounting");
    await expect(page.locator("text=Accounting & Statutory GST")).toBeVisible();
  });

  test("Showroom POS Cashier role is restricted from Stock Gate & Quorum (/governance)", async ({
    page,
  }) => {
    // Quick-fill Arjun K. (Showroom POS Cashier)
    const arjunChip = page.locator("button:has-text('Arjun K.')");
    await arjunChip.click();

    const passwordInput = page.locator('input[id="password"]');
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL("**/", { timeout: 10000 });

    // Verify sidebar displays Locked badge on restricted stations
    const sidebar = page.locator("aside, div.overflow-y-auto");
    await expect(sidebar.locator("text=Stock Gate")).toBeVisible();
    await expect(sidebar.locator("text=Locked").first()).toBeVisible();

    // Navigate to /governance directly
    await page.goto("/governance");

    // RouteGuard should render Access Denied Screen
    await expect(page.locator("text=Workstation Access Restricted")).toBeVisible();
    await expect(page.locator("text=PBAC Access Control Policy")).toBeVisible();
    await expect(page.locator("text=Target Workstation:")).toBeVisible();
    await expect(page.locator("text=Stock Gate & Dual-Key Quorum (/governance)")).toBeVisible();
    await expect(page.locator("text=Your Assigned Role:")).toBeVisible();
    await expect(page.locator("text=Showroom POS Cashier").first()).toBeVisible();

    // Click "Return to Authorized Station" -> navigates to /pos
    const returnBtn = page.locator("button:has-text('Return to Authorized Station')");
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    await page.waitForURL("**/pos", { timeout: 10000 });
    expect(page.url()).toContain("/pos");
    await expect(page.locator("text=Point of Sale (POS) Showroom Terminal")).toBeVisible();
  });

  test("Separation of Duties: Compliance Director is restricted from Accounting Ledger (/accounting)", async ({
    page,
  }) => {
    // Quick-fill Vikram M. (Compliance Director)
    const vikramChip = page.locator("button:has-text('Vikram M.')");
    await vikramChip.click();

    const passwordInput = page.locator('input[id="password"]');
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL("**/", { timeout: 10000 });

    // Verify Vikram has full access to /governance
    await page.goto("/governance");
    await expect(page.locator("text=Multi-Signatory Quorum & Cryptographic Merkle Ledger")).toBeVisible();
    await expect(page.locator("text=Workstation Access Restricted")).toHaveCount(0);

    // Attempt to access Accounting & Statutory GST (/accounting)
    await page.goto("/accounting");

    // RouteGuard should block under Separation of Duties
    await expect(page.locator("text=Workstation Access Restricted")).toBeVisible();
    await expect(page.locator("text=Target Workstation:")).toBeVisible();
    await expect(page.locator("text=Accounting & Statutory GST (/accounting)")).toBeVisible();
    await expect(page.getByText(/Compliance Director|Inventory Controller/i).first()).toBeVisible();

    // Control Tower fallback button works cleanly
    const controlTowerBtn = page.locator("button:has-text('Control Tower')");
    await controlTowerBtn.click();
    await page.waitForURL("**/", { timeout: 10000 });
    expect(page.url()).not.toContain("/accounting");
  });

  test("Store Manager holds broad operational authorization across all workstations", async ({
    page,
  }) => {
    // Quick-fill Rachel R. (Store Manager)
    const rachelChip = page.locator("button:has-text('Rachel R.')");
    await rachelChip.click();

    const passwordInput = page.locator('input[id="password"]');
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL("**/", { timeout: 10000 });

    // Store Manager should be able to access /pos, /accounting, /governance, and /storage without restriction
    await page.goto("/accounting");
    await expect(page.locator("text=Accounting & Statutory GST")).toBeVisible();
    await expect(page.locator("text=Workstation Access Restricted")).toHaveCount(0);

    await page.goto("/governance");
    await expect(page.locator("text=Multi-Signatory Quorum & Cryptographic Merkle Ledger")).toBeVisible();
    await expect(page.locator("text=Workstation Access Restricted")).toHaveCount(0);
  });
});
