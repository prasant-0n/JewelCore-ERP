import { test, expect } from "@playwright/test";

test.describe("Milestone 8: Break-Glass Emergency Bypass Protocol (NIST SP 800-53 / SOC-2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("workspace-shell")).toBeVisible({ timeout: 10000 });
  });

  test("opens Break-Glass Emergency modal from TopHeader and renders NIST SP 800-53 criteria", async ({
    page,
  }) => {
    // 1. Open operator profile menu
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // 2. Click "Break-Glass Emergency" action
    const breakGlassBtn = page.getByRole("button", { name: /Break-Glass Emergency/i });
    await expect(breakGlassBtn).toBeVisible();
    await breakGlassBtn.click();

    // 3. Verify Break-Glass modal opens
    const modal = page.getByTestId("break-glass-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Break-Glass Emergency Protocol")).toBeVisible();
    await expect(modal.getByText("NIST SP 800-53", { exact: true })).toBeVisible();
    await expect(modal.getByText(/SOC-2 & NIST SP 800-53 Compliance Warning/i)).toBeVisible();

    // 4. Verify form inputs
    await expect(modal.getByPlaceholder(/INC-2026/i)).toBeVisible();
    await expect(modal.getByPlaceholder(/State the crisis reason/i)).toBeVisible();
    await expect(modal.getByPlaceholder(/Enter Master Passphrase/i)).toBeVisible();
    await expect(modal.getByRole("button", { name: "30m" })).toBeVisible();
  });

  test("rejects activation when invalid master emergency passphrase is submitted", async ({
    page,
  }) => {
    // 1. Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();
    await page.getByRole("button", { name: /Break-Glass Emergency/i }).click();

    const modal = page.getByTestId("break-glass-modal");
    await expect(modal).toBeVisible();

    // 2. Enter invalid master passphrase
    const passphraseInput = modal.getByPlaceholder(/Enter Master Passphrase/i);
    await passphraseInput.fill("fraudulent-passphrase-attempt");

    // 3. Check mandatory acknowledgment
    const ackCheckbox = modal.locator('input[type="checkbox"]');
    await ackCheckbox.check();

    // 4. Submit
    const submitBtn = modal.getByRole("button", { name: "Authorize Emergency Clearance" });
    await submitBtn.click();

    // 5. Verify error notification
    await expect(
      page.getByText("Emergency Clearance Rejected"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("successfully activates Break-Glass clearance with valid master passphrase and verifies top alert banner", async ({
    page,
  }) => {
    // 1. Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();
    await page.getByRole("button", { name: /Break-Glass Emergency/i }).click();

    const modal = page.getByTestId("break-glass-modal");
    await expect(modal).toBeVisible();

    // 2. Set Incident Reference & Justification
    const refInput = modal.getByPlaceholder(/INC-2026/i);
    await refInput.fill("INC-2026-8800");

    const reasonInput = modal.getByPlaceholder(/State the crisis reason/i);
    await reasonInput.fill("Hardware biometric authenticator failure during urgent high-value diamond intake");

    // 3. Enter valid master emergency passphrase
    const passphraseInput = modal.getByPlaceholder(/Enter Master Passphrase/i);
    await passphraseInput.fill("JEWELCORE-BREAK-GLASS-2026");

    // 4. Check acknowledgment checkbox
    const ackCheckbox = modal.locator('input[type="checkbox"]');
    await ackCheckbox.check();

    // 5. Click Authorize Emergency Clearance
    const submitBtn = modal.getByRole("button", { name: "Authorize Emergency Clearance" });
    await submitBtn.click();

    // 6. Verify success alert
    await expect(
      page.getByText(/Break-Glass Emergency Clearance Activated/i),
    ).toBeVisible({ timeout: 5000 });

    // 7. Verify persistent top banner appears with pulsing alert & countdown timer
    const banner = page.getByTestId("break-glass-top-banner");
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner.getByText("BREAK-GLASS EMERGENCY CLEARANCE ACTIVE")).toBeVisible();
    await expect(banner.getByText("INC-2026-8800")).toBeVisible();
    await expect(banner.getByRole("button", { name: "Relinquish" })).toBeVisible();
  });

  test("relinquishes Break-Glass emergency clearance early and restores normal controls", async ({
    page,
  }) => {
    // 1. First activate emergency clearance via API/storage simulation
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();
    await page.getByRole("button", { name: /Break-Glass Emergency/i }).click();

    const modal = page.getByTestId("break-glass-modal");
    await expect(modal).toBeVisible();

    await modal.getByPlaceholder(/Enter Master Passphrase/i).fill("JEWELCORE-BREAK-GLASS-2026");
    await modal.locator('input[type="checkbox"]').check();
    await modal.getByRole("button", { name: "Authorize Emergency Clearance" }).click();

    const banner = page.getByTestId("break-glass-top-banner");
    await expect(banner).toBeVisible({ timeout: 5000 });

    // 2. Click Relinquish button on the top banner
    const relinquishBtn = banner.getByRole("button", { name: "Relinquish" });
    await relinquishBtn.click();

    // 3. Verify notification and banner removal
    await expect(
      page.getByText(/Break-Glass Emergency Clearance Relinquished/i),
    ).toBeVisible({ timeout: 5000 });

    await expect(banner).not.toBeVisible();
  });
});
