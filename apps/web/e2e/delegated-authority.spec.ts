import { test, expect } from "@playwright/test";

test.describe("Delegated Authority & Time-Bound Privilege Elevation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("opens Delegated Authority modal from TopHeader and renders elevation options", async ({
    page,
  }) => {
    // Open operator menu in TopHeader
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // Click Delegated Authority action
    const delegationBtn = page.getByRole("button", { name: "Delegated Authority" });
    await expect(delegationBtn).toBeVisible();
    await delegationBtn.click();

    // Verify modal is open
    const modalHeading = page.getByRole("heading", {
      name: "Delegated Authority & Time-Bound Elevation",
    });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Verify role options
    await expect(page.getByText("Acting Store Manager")).toBeVisible();
    await expect(page.getByText("Acting Vault Custodian")).toBeVisible();
    await expect(page.getByText("Acting Compliance Director")).toBeVisible();

    // Verify duration chips
    await expect(page.getByText("1 Hour (Standard Shift)")).toBeVisible();
    await expect(page.getByText("4 Hours (Half-Day Cover)")).toBeVisible();
  });

  test("rejects elevation with invalid supervisor PIN", async ({ page }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const delegationBtn = page.getByRole("button", { name: "Delegated Authority" });
    await delegationBtn.click();

    // Type invalid supervisor PIN: 0000
    const pinInput = page.locator('input[id="supervisor-pin"]');
    await pinInput.fill("0000");

    const submitBtn = page.getByRole("button", {
      name: "Authorize Time-Bound Delegation (Dual-Key Signed)",
    });
    await submitBtn.click();

    // Verify error alert
    await expect(
      page.getByText("Invalid supervisor dual-key passkey"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("activates delegated authority with valid supervisor co-signature and verifies TopHeader badge", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const delegationBtn = page.getByRole("button", { name: "Delegated Authority" });
    await delegationBtn.click();

    // Select Acting Vault Custodian
    const vaultOption = page.locator("button:has-text('Acting Vault Custodian')");
    await vaultOption.click();

    // Enter valid manager PIN 1234
    const pinInput = page.locator('input[id="supervisor-pin"]');
    await pinInput.fill("1234");

    const submitBtn = page.getByRole("button", {
      name: "Authorize Time-Bound Delegation (Dual-Key Signed)",
    });
    await submitBtn.click();

    // Verify toast confirmation and modal dismissal
    await expect(page.getByText("Delegated Authority Activated")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("heading", {
        name: "Delegated Authority & Time-Bound Elevation",
      }),
    ).not.toBeVisible();

    // Verify TopHeader displays elevated badge
    const elevatedBadge = page.locator("button:has-text('ELEVATED:')");
    await expect(elevatedBadge).toBeVisible({ timeout: 5000 });
    await expect(elevatedBadge).toContainText("Acting Vault Custodian");
  });

  test("relinquishes delegated authority early and restores baseline role", async ({
    page,
  }) => {
    // 1. First activate delegation
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const delegationBtn = page.getByRole("button", { name: "Delegated Authority" });
    await delegationBtn.click();

    const pinInput = page.locator('input[id="supervisor-pin"]');
    await pinInput.fill("1234");

    const submitBtn = page.getByRole("button", {
      name: "Authorize Time-Bound Delegation (Dual-Key Signed)",
    });
    await submitBtn.click();

    await expect(page.getByText("Delegated Authority Activated")).toBeVisible({
      timeout: 5000,
    });

    // 2. Click elevated badge to manage/relinquish
    const elevatedBadge = page.locator("button:has-text('ELEVATED:')");
    await expect(elevatedBadge).toBeVisible();
    await elevatedBadge.click();

    // Modal opens in active state
    await expect(
      page.getByText("ELEVATED CLEARANCE ACTIVE"),
    ).toBeVisible({ timeout: 5000 });

    // Click Relinquish early
    const relinquishBtn = page.getByRole("button", {
      name: "Relinquish Delegated Authority Early",
    });
    await expect(relinquishBtn).toBeVisible();
    await relinquishBtn.click();

    // Verify toast and badge removal
    await expect(
      page.getByText("Delegated Authority Relinquished"),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.locator("button:has-text('ELEVATED:')")).not.toBeVisible();
  });
});
