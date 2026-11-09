import { test, expect } from "@playwright/test";

test.describe("Step-Up High-Assurance Vault & Pricing Quorum (Milestone 7)", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Authenticate as Store Manager (Rachel R.)
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    await page.locator('input[id="email"]').fill("rachel.r@jewelcore.internal");
    await page.locator('input[id="password"]').fill("JewelCore@2026");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/", { timeout: 10000 });
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("challenges high-value vault custody transfer and verifies via FIDO2 passkey assertion", async ({
    page,
  }) => {
    // 1. Navigate to Vault & Storage Directory
    await page.goto("/storage");
    await page.waitForLoadState("domcontentloaded");

    // 2. Locate Transfer button in CompartmentInspector
    const transferBtn = page.getByTestId("transfer-compartment-btn");
    await expect(transferBtn).toBeVisible({ timeout: 15000 });
    await transferBtn.click();

    // 3. Verify Step-Up Quorum modal opens with high-assurance context
    const modal = page.getByTestId("step-up-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("High-Assurance Step-Up Quorum")).toBeVisible();
    await expect(modal.getByText("High-Value Vault Custody Transfer")).toBeVisible();
    await expect(modal.getByText("SEC-LEVEL-3")).toBeVisible();

    // 4. Click Passkey touch authorization button
    const passkeyBtn = page.getByTestId("verify-passkey-btn");
    await expect(passkeyBtn).toBeVisible();
    await passkeyBtn.click();

    // 5. Verify modal closes and authorized badge appears in compartment inspector
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    const verifiedBadge = page.getByTestId("step-up-verified-badge");
    await expect(verifiedBadge).toBeVisible();
    await expect(verifiedBadge).toHaveText(/Step-Up Authorized/i);
  });

  test("rejects invalid supervisor PIN and authorizes upon valid PIN", async ({ page }) => {
    // 1. Navigate to Storage
    await page.goto("/storage");
    await page.waitForLoadState("domcontentloaded");

    // 2. Trigger transfer step-up challenge
    const transferBtn = page.getByTestId("transfer-compartment-btn");
    await expect(transferBtn).toBeVisible({ timeout: 15000 });
    await transferBtn.click();

    const modal = page.getByTestId("step-up-modal");
    await expect(modal).toBeVisible();

    // 3. Switch to Supervisor Quorum tab
    const supervisorTab = page.getByTestId("tab-supervisor");
    await supervisorTab.click();
    await expect(page.getByTestId("supervisor-select")).toBeVisible();

    // 4. Test invalid supervisor PIN rejection
    const pinInput = page.getByTestId("supervisor-pin-input");
    await pinInput.fill("0000");

    const submitBtn = page.getByTestId("verify-supervisor-btn");
    await submitBtn.click();

    // Verify error banner
    const errorBanner = page.getByTestId("step-up-error");
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner.getByText("Step-Up Authorization Failed")).toBeVisible();

    // 5. Enter correct supervisor PIN (1234)
    await pinInput.fill("1234");
    await submitBtn.click();

    // Verify successful authorization
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    const verifiedBadge = page.getByTestId("step-up-verified-badge");
    await expect(verifiedBadge).toBeVisible();
  });

  test("intercepts manual bullion spot rate override and requires step-up quorum before publishing", async ({
    page,
  }) => {
    // 1. Navigate to Pricing Management
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");

    // 2. Open Rate Fix Modal
    const broadcastFixBtn = page.getByTestId("broadcast-spot-fix-btn");
    await expect(broadcastFixBtn).toBeVisible({ timeout: 15000 });
    await broadcastFixBtn.click();

    // 3. Select Manual Override source
    const fixSourceSelect = page.getByTestId("fix-source-select");
    await expect(fixSourceSelect).toBeVisible();
    await fixSourceSelect.selectOption("MANUAL_OVERRIDE");

    // Verify quorum warning banner appears
    await expect(page.getByText("Quorum Step-Up Required")).toBeVisible();
    await expect(page.getByText("STEP-UP REQ", { exact: true })).toBeVisible();

    // 4. Click Broadcast Rates to trigger challenge
    const broadcastSubmit = page.getByTestId("broadcast-rates-btn");
    await broadcastSubmit.click();

    // 5. Verify Step-Up Modal intercepts
    const stepUpModal = page.getByTestId("step-up-modal");
    await expect(stepUpModal).toBeVisible();
    await expect(stepUpModal.getByText("Manual Bullion Rate Override")).toBeVisible();

    // 6. Verify via Touch Passkey
    const passkeyBtn = stepUpModal.getByTestId("verify-passkey-btn");
    await passkeyBtn.click();

    // 7. Verify step-up resolves and rate modal completes
    await expect(stepUpModal).not.toBeVisible({ timeout: 5000 });
  });
});
