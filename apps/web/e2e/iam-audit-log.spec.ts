import { test, expect } from "@playwright/test";

test.describe("Forensic IAM Security Audit Log & Real-Time Event Stream", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    // Ensure workspace shell is visible
    await expect(page.getByTestId("workspace-shell")).toBeVisible();
  });

  test("opens Forensic IAM Audit Stream modal from TopHeader and renders live event stream", async ({ page }) => {
    // 1. Open operator profile menu
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // 2. Click "Forensic IAM Audit Stream" action
    const auditBtn = page.getByRole("button", { name: /Forensic IAM Audit Stream/i });
    await expect(auditBtn).toBeVisible();
    await auditBtn.click();

    // 3. Verify modal opens with forensic title and live stream badge
    const modal = page.getByTestId("iam-audit-log-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Forensic IAM Security Audit Stream")).toBeVisible();
    await expect(modal.getByText("LIVE QUORUM")).toBeVisible();

    // 4. Verify summary KPI metrics are rendered
    await expect(modal.getByText("Logged Events")).toBeVisible();
    await expect(modal.getByText("Auth Assurance")).toBeVisible();
    await expect(modal.getByText("Active Terminals")).toBeVisible();

    // 5. Verify core forensic action events are visible
    await expect(modal.getByText("AUTH_LOGIN_SUCCESS")).toBeVisible();
    await expect(modal.getByText("AUTH_MFA_CHALLENGE_VERIFIED")).toBeVisible();
    await expect(modal.getByText("MAIN-SHOWROOM-DESK-01").first()).toBeVisible();
  });

  test("filters forensic event stream by category pills", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Forensic IAM Audit Stream/i }).click();

    const modal = page.getByTestId("iam-audit-log-modal");
    await expect(modal).toBeVisible();

    // Click "PRIVILEGE ELEVATION" filter
    const elevationTab = modal.getByRole("button", { name: "PRIVILEGE ELEVATION" });
    await elevationTab.click();

    // Verify only privilege elevation actions are shown
    await expect(modal.getByText("AUTH_DELEGATION_GRANTED")).toBeVisible();
    await expect(modal.getByText("AUTH_LOGIN_SUCCESS")).not.toBeVisible();

    // Click "All Categories" to restore
    await modal.getByRole("button", { name: "All Categories" }).click();
    await expect(modal.getByText("AUTH_LOGIN_SUCCESS")).toBeVisible();
  });

  test("filters events using real-time search query", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Forensic IAM Audit Stream/i }).click();

    const modal = page.getByTestId("iam-audit-log-modal");
    await expect(modal).toBeVisible();

    // Type "PIN" in search input
    const searchInput = modal.getByPlaceholder(/Search action, terminal ID/i);
    await searchInput.fill("PIN");

    // Verify PIN action is visible and unrelated actions are filtered
    await expect(modal.getByText("AUTH_PIN_UNLOCKED")).toBeVisible();
    await expect(modal.getByText("AUTH_LOGIN_SUCCESS")).not.toBeVisible();

    // Clear search query
    await searchInput.fill("");
    await expect(modal.getByText("AUTH_LOGIN_SUCCESS")).toBeVisible();
  });

  test("inspects cryptographic event payload and closes stream cleanly", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Forensic IAM Audit Stream/i }).click();

    const modal = page.getByTestId("iam-audit-log-modal");
    await expect(modal).toBeVisible();

    // Inspect first event payload
    const inspectBtn = modal.getByRole("button", { name: /Inspect Payload/i }).first();
    await inspectBtn.click();

    // Verify payload JSON appears
    await expect(modal.locator("pre").first()).toBeVisible();

    // Toggle hide payload
    const hideBtn = modal.getByRole("button", { name: /Hide Payload/i }).first();
    await hideBtn.click();
    await expect(modal.locator("pre")).not.toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: /Close Stream/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test("triggers forensic CSV export download", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Forensic IAM Audit Stream/i }).click();

    const modal = page.getByTestId("iam-audit-log-modal");
    await expect(modal).toBeVisible();

    // Trigger export download
    const downloadPromise = page.waitForEvent("download");
    await modal.getByRole("button", { name: /Export CSV/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain("jewelcore-iam-audit-");
  });
});
