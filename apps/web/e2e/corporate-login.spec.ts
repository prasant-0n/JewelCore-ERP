import { test, expect } from "@playwright/test";

test.describe("Corporate Staff Authentication & Session Governance (Option A)", () => {
  test("renders luxury /login workstation portal with all brand controls", async ({
    page,
  }) => {
    await page.goto("/login");

    // Brand and Title Verification
    await expect(page.locator("text=JewelCore Atelier")).toBeVisible();
    await expect(
      page.locator("text=Workstation Authentication"),
    ).toBeVisible();
    await expect(
      page.locator("text=Showroom & Vault Enterprise Portal"),
    ).toBeVisible();

    // Form elements
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const storeSelect = page.locator('select[id="store"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(storeSelect).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Security compliance badges
    await expect(page.locator("text=OWASP Argon2id")).toBeVisible();
    await expect(page.locator("text=PBAC Scoped")).toBeVisible();
  });

  test("toggles password plaintext visibility using eye toggle button", async ({
    page,
  }) => {
    await page.goto("/login");

    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");

    const eyeToggleBtn = page.locator('button[aria-label="Show password"]');
    await eyeToggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    const eyeOffToggleBtn = page.locator('button[aria-label="Hide password"]');
    await eyeOffToggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("quick-fill autofills staff credentials upon clicking a staff badge", async ({
    page,
  }) => {
    await page.goto("/login");

    const vikramChip = page.locator("button:has-text('Vikram M.')");
    await expect(vikramChip).toBeVisible();
    await vikramChip.click();

    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toHaveValue("vikram.m@jewelcore.internal");

    const devikaChip = page.locator("button:has-text('Devika S.')");
    await devikaChip.click();
    await expect(emailInput).toHaveValue("devika.s@jewelcore.internal");
  });

  test("displays error alert when invalid password is submitted", async ({
    page,
  }) => {
    await page.goto("/login");

    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("WrongPassword999");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error banner is displayed
    await expect(page.locator("text=Access Denied")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Invalid email or password credentials")).toBeVisible();
  });

  test("signs in successfully with valid credentials and signs out cleanly", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill valid credentials
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should redirect to dashboard /
    await page.waitForURL("**/", { timeout: 10000 });
    expect(page.url()).not.toContain("/login");

    // TopHeader should render Rachel R.
    const activeHeaderUser = page.locator(
      'button[title*="Switch User Identity"]',
    );
    await expect(activeHeaderUser).toBeVisible();

    // Open User menu and Sign Out
    await activeHeaderUser.click();
    const signOutBtn = page.locator("text=Sign Out of Workstation");
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Should redirect cleanly back to /login
    await page.waitForURL("**/login", { timeout: 10000 });
    expect(page.url()).toContain("/login");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test("exclusive user session: logging in as Vikram M. strictly displays only Vikram M. in TopHeader profile and no multi-persona switcher", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click Vikram staff quick-fill chip
    const vikramChip = page.locator("button:has-text('Vikram M.')");
    await vikramChip.click();

    // Verify fields populated
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toHaveValue("vikram.m@jewelcore.internal");

    // Fill password and submit
    const passwordInput = page.locator('input[id="password"]');
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Redirected to workspace
    await page.waitForURL("**/", { timeout: 10000 });
    expect(page.url()).not.toContain("/login");

    // TopHeader should show Vikram M. exclusively
    const activeHeaderUser = page.locator(
      'button[title*="Switch User Identity"]',
    );
    await expect(activeHeaderUser).toBeVisible();
    await expect(activeHeaderUser.locator("text=Vikram M.")).toBeVisible();
    await expect(activeHeaderUser.locator("text=Inventory Controller")).toBeVisible();

    // Click operator profile dropdown
    await activeHeaderUser.click();

    // Verify Active Operator Profile shows only Vikram M.
    await expect(page.locator("text=Active Operator Profile")).toBeVisible();
    await expect(page.getByText("Authenticated", { exact: true })).toBeVisible();
    await expect(page.locator("text=vikram.m@jewelcore.internal")).toBeVisible();

    // Strictly ensure no multi-persona switcher is present
    await expect(page.locator("text=Switch Operational Persona")).toHaveCount(0);
    await expect(page.locator("text=Rachel R.")).toHaveCount(0);
    await expect(page.locator("text=Devika S.")).toHaveCount(0);
    await expect(page.locator("text=Arjun K.")).toHaveCount(0);

    // Sign out cleanly
    const signOutBtn = page.locator("text=Sign Out of Workstation");
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();
    await page.waitForURL("**/login", { timeout: 10000 });
    expect(page.url()).toContain("/login");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });
});
