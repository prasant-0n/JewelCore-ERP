import { test, expect } from "@playwright/test";

test.describe("Multi-Factor Authentication (TOTP 2FA Authenticator & Backup Codes)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("transitions to 6-digit TOTP challenge step when 2FA is required", async ({
    page,
  }) => {
    // Fill credentials
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    // Check Require 2FA Challenge toggle
    const toggle2FA = page.locator('input[id="require-2fa-toggle"]');
    await toggle2FA.check();
    expect(await toggle2FA.isChecked()).toBe(true);

    // Submit credentials
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify transition to 2FA challenge step
    await expect(
      page.getByRole("heading", { name: "Two-Factor Authentication" }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByText("Enter 6-Digit Authenticator Code")).toBeVisible();

    // 6 digit inputs should be present
    const digit1 = page.getByRole("textbox", { name: "Digit 1" });
    const digit6 = page.getByRole("textbox", { name: "Digit 6" });
    await expect(digit1).toBeVisible();
    await expect(digit6).toBeVisible();
  });

  test("rejects invalid TOTP token with cryptographic security alert", async ({
    page,
  }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const toggle2FA = page.locator('input[id="require-2fa-toggle"]');
    await toggle2FA.check();

    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByRole("heading", { name: "Two-Factor Authentication" }),
    ).toBeVisible();

    // Enter invalid TOTP: 000000
    for (let i = 1; i <= 6; i++) {
      const digitInput = page.getByRole("textbox", { name: `Digit ${i}` });
      await digitInput.fill("0");
    }

    const verifyBtn = page.getByRole("button", {
      name: "Verify & Enter Workstation",
    });
    await verifyBtn.click();

    // Error alert
    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(
      page.getByText("Invalid or expired TOTP security token"),
    ).toBeVisible();
  });

  test("authenticates successfully with valid 6-digit TOTP code 123456", async ({
    page,
  }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const toggle2FA = page.locator('input[id="require-2fa-toggle"]');
    await toggle2FA.check();

    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByRole("heading", { name: "Two-Factor Authentication" }),
    ).toBeVisible();

    // Fill valid TOTP: 123456
    const digits = ["1", "2", "3", "4", "5", "6"];
    for (let i = 0; i < 6; i++) {
      const digitInput = page.getByRole("textbox", { name: `Digit ${i + 1}` });
      await digitInput.fill(digits[i]);
    }

    const verifyBtn = page.getByRole("button", {
      name: "Verify & Enter Workstation",
    });
    await verifyBtn.click();

    // Redirected to workspace
    await page.waitForURL("**/", { timeout: 10000 });
    expect(page.url()).not.toContain("/login");
  });

  test("authenticates using Single-Use Emergency Recovery Backup Code", async ({
    page,
  }) => {
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const toggle2FA = page.locator('input[id="require-2fa-toggle"]');
    await toggle2FA.check();

    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByRole("heading", { name: "Two-Factor Authentication" }),
    ).toBeVisible();

    // Switch to Emergency Backup Recovery Code mode
    const backupToggle = page.getByRole("button", {
      name: "Lost Authenticator Device? Use Emergency Backup Code",
    });
    await backupToggle.click();

    // Enter valid backup code
    const backupInput = page.locator('input[id="backup-code-input"]');
    await expect(backupInput).toBeVisible();
    await backupInput.fill("JC-VAULT-2026");

    const verifyBtn = page.getByRole("button", {
      name: "Verify & Enter Workstation",
    });
    await verifyBtn.click();

    // Successfully entered workspace
    await page.waitForURL("**/", { timeout: 10000 });
    expect(page.url()).not.toContain("/login");
  });

  test("opens Two-Factor Authentication Security Modal from TopHeader", async ({
    page,
  }) => {
    // Navigate to dashboard
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open active operator menu
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // Click Two-Factor Authentication
    const mfaBtn = page.getByRole("button", { name: "Two-Factor Authentication" });
    await expect(mfaBtn).toBeVisible();
    await mfaBtn.click();

    // Two-Factor Modal appears
    const modalHeading = page.getByRole("heading", {
      name: "Two-Factor Authentication (TOTP)",
    });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Verify Secret Key and Recovery codes
    await expect(page.locator("text=JWLCR-2026-ATELIER-HSM-QUORUM")).toBeVisible();
    await expect(page.locator("text=JC-8921-X9A2")).toBeVisible();

    // Test live token verifier with 123456
    const testInput = page.locator('input[placeholder*="Enter 6-digit code"]');
    await testInput.fill("123456");

    const testBtn = page.getByRole("button", { name: "Verify Token" });
    await testBtn.click();

    await expect(page.locator("text=Cryptographic TOTP Token Validated")).toBeVisible({
      timeout: 5000,
    });
  });
});
