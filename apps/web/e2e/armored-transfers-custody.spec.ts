import { test, expect } from "@playwright/test";

test.describe("Armored Consignment Dual-Custody PBAC & Electronic Seals (/transfers)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("PBAC Route Guard blocks unauthenticated users and POS Cashier, permits Store Manager", async ({
    page,
  }) => {
    // 1. Unauthenticated access redirect
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("jewelcore_logged_out", "true");
    });

    await page.goto("/transfers");
    await page.waitForURL("**/login?redirect=%2Ftransfers", { timeout: 10000 });
    expect(page.url()).toContain("/login?redirect=%2Ftransfers");

    // 2. POS Cashier (Arjun K.) role restriction
    const arjunChip = page.locator("button:has-text('Arjun K.')");
    await arjunChip.click();
    const passwordInput = page.locator('input[id="password"]');
    await passwordInput.fill("JewelCore@2026");
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Browser honors redirect=%2Ftransfers and lands on /transfers
    await page.waitForURL("**/transfers", { timeout: 10000 });

    // RouteGuard should render Workstation Access Restricted
    await expect(page.locator("text=Workstation Access Restricted")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=PBAC Access Control Policy")).toBeVisible();
    await expect(
      page.locator("text=Store Transfers (/transfers)").first(),
    ).toBeVisible();

    // 3. Store Branch Manager (Rachel R.) authorization
    await page.goto("/login");
    const rachelChip = page.locator("button:has-text('Rachel R.')");
    await rachelChip.click();
    await page.locator('input[id="password"]').fill("JewelCore@2026");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/", { timeout: 10000 });
    await page.goto("/transfers");
    await page.waitForURL("**/transfers", { timeout: 10000 });

    await expect(
      page.locator("h1:has-text('Armored Fleet Tracking & Dual-Custody Manifests')"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Departure Gate: Dual-custody dispatch requires distinct witness PIN & electronic seals", async ({
    page,
  }) => {
    // Login as Rachel R.
    const rachelChip = page.locator("button:has-text('Rachel R.')");
    await rachelChip.click();
    await page.locator('input[id="password"]').fill("JewelCore@2026");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/", { timeout: 10000 });
    await page.goto("/transfers");

    // Open Dual-Custody Dispatch Gate
    const dispatchGateBtn = page.getByRole("button", {
      name: /Dual-Custody Dispatch Gate/i,
    });
    await expect(dispatchGateBtn).toBeVisible();
    await dispatchGateBtn.click();

    // Verify modal headers and dual-custody elements
    await expect(
      page.locator("text=Armored Consignment Dual-Custody PBAC Dispatch").first(),
    ).toBeVisible();
    await expect(page.locator("text=Key 1 • Dispatch Vault Custodian (Maker)")).toBeVisible();
    await expect(page.locator("text=Key 2 • Armed Escort Supervisor (Checker)")).toBeVisible();
    await expect(page.locator("text=0.01g Precision")).toBeVisible();

    // Attempt submit with empty witness PIN -> validation blocked
    const submitDispatchBtn = page.getByRole("button", {
      name: /Cryptographically Dual-Sign & Dispatch/i,
    });
    await submitDispatchBtn.click();
    await expect(page.locator("text=Secondary Witness 4-digit Security PIN is required.")).toBeVisible();

    // Fill valid witness PIN via demo helper
    const demoPinHelper = page.locator("text=Demo: 1234");
    await demoPinHelper.click();

    // Submit valid dispatch
    await submitDispatchBtn.click();

    // Verify success toast
    await expect(
      page.locator("text=Armored Dispatch Dual-Signed & Authorized").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Receiving Gate: Tare scale tolerance verification and clean electronic de-seal intake", async ({
    page,
  }) => {
    // Login as Rachel R.
    const rachelChip = page.locator("button:has-text('Rachel R.')");
    await rachelChip.click();
    await page.locator('input[id="password"]').fill("JewelCore@2026");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/", { timeout: 10000 });
    await page.goto("/transfers");

    // Click first consignment item in manifest
    const itemCard = page.locator("text=TR-ITM-01").first();
    await itemCard.click();

    // Open Dual-Custody Tare & De-Seal Gate
    const deSealGateBtn = page.getByRole("button", {
      name: /Dual-Custody Tare & De-Seal Gate/i,
    });
    await expect(deSealGateBtn).toBeVisible();
    await deSealGateBtn.click();

    // Verify de-seal modal
    await expect(
      page.locator("text=Inward Vault Handover & Electronic De-Seal Gate").first(),
    ).toBeVisible();
    await expect(page.locator("text=ELEC-SEAL-9912").first()).toBeVisible();
    await expect(page.locator("text=Tolerance Pass").first()).toBeVisible();
    await expect(page.locator("text=Key 1 • Inward Vault Custodian")).toBeVisible();
    await expect(page.locator("text=Key 2 • Security Escort Witness")).toBeVisible();

    // Co-sign with valid witness PIN
    await page.locator("text=Demo: 1234").first().click();

    // Authorize De-Seal & Ingest into Vault Compartment
    const authorizeBtn = page.getByRole("button", {
      name: /Authorize De-Seal & Ingest into Vault Compartment/i,
    });
    await authorizeBtn.click();

    // Verify confirmation toast
    await expect(
      page.locator("text=De-Seal Verified & Handover Accepted in Ledger").first(),
    ).toBeVisible({ timeout: 5000 });

    // Verify inspector reflects confirmed handover
    await expect(
      page.locator("text=Vault Inward Handover Confirmed").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Forensic Dispute: Out-of-tolerance weight deviation triggers quarantine & dispute logging", async ({
    page,
  }) => {
    // Login as Rachel R.
    const rachelChip = page.locator("button:has-text('Rachel R.')");
    await rachelChip.click();
    await page.locator('input[id="password"]').fill("JewelCore@2026");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/", { timeout: 10000 });
    await page.goto("/transfers");

    // Select second item
    const itemCard = page.locator("text=TR-ITM-02").first();
    await itemCard.click();

    // Open Dual-Custody Tare & De-Seal Gate
    const deSealGateBtn = page.getByRole("button", {
      name: /Dual-Custody Tare & De-Seal Gate/i,
    });
    await deSealGateBtn.click();

    // Enter out-of-tolerance weight (+0.50g deviation)
    const weightInput = page.locator('input[type="number"][step="0.001"]').first();
    await weightInput.fill("1143.100");

    // Verify live badge indicates tare deviation
    await expect(
      page.locator("text=Tare Deviation Detected").first(),
    ).toBeVisible();
    await expect(page.locator("text=ALERT > 0.01g").first()).toBeVisible();

    // Mandatory justification textarea appears
    await expect(
      page.locator("text=Forensic Chain-of-Custody Dispute Mandatory Justification"),
    ).toBeVisible();

    const justificationTextarea = page.locator("textarea");
    await justificationTextarea.fill(
      "Scale variance of 0.50g observed. Vault custodian recommends quarantine.",
    );

    // Co-sign with witness PIN
    await page.locator("text=Demo: 1234").first().click();

    // Submit quarantine button
    const disputeBtn = page.getByRole("button", {
      name: /Log Transfer Dispute & Quarantine Consignment/i,
    });
    await expect(disputeBtn).toBeVisible();
    await disputeBtn.click();

    // Verify warning toast
    await expect(
      page.locator("text=Consignment Quarantined & Transfer Dispute Logged").first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
