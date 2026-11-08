import { test, expect } from "@playwright/test";

test.describe("Active Workstation Sessions & Remote Revocation Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("opens Workstation Sessions modal from TopHeader and displays current and remote terminals", async ({
    page,
  }) => {
    // Open operator menu in top header
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // Click Connected Workstations action
    const sessionsMenuBtn = page.getByRole("button", {
      name: "Connected Workstations",
    });
    await expect(sessionsMenuBtn).toBeVisible();
    await sessionsMenuBtn.click();

    // Verify modal is open
    const modalHeading = page.getByRole("heading", {
      name: "Workstation Sessions & Terminals",
    });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Verify current workstation card
    await expect(page.getByText("STATION-DESK-01")).toBeVisible();
    await expect(page.getByText("This Workstation (Current)")).toBeVisible();

    // Verify remote terminals
    await expect(page.getByText("POS-TERMINAL-02")).toBeVisible();
    await expect(page.getByText("SALON-IPAD-01")).toBeVisible();
    await expect(page.getByText("3 Active Workstations")).toBeVisible();
  });

  test("revokes an individual remote showroom terminal session", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const sessionsMenuBtn = page.getByRole("button", {
      name: "Connected Workstations",
    });
    await sessionsMenuBtn.click();

    await expect(page.getByText("POS-TERMINAL-02")).toBeVisible({ timeout: 5000 });

    // Locate Revoke button specifically for POS-TERMINAL-02
    const posRevokeBtn = page.getByRole("button", {
      name: "Disconnect POS-TERMINAL-02",
    });
    await expect(posRevokeBtn).toBeVisible();
    await posRevokeBtn.click();

    // Verify toast confirmation
    await expect(page.getByText("Workstation Revoked")).toBeVisible({
      timeout: 5000,
    });

    // POS-TERMINAL-02 should be removed from view
    await expect(page.getByText("POS-TERMINAL-02")).not.toBeVisible();

    // Active count should update to 2
    await expect(page.getByText("2 Active Workstations")).toBeVisible();
  });

  test("revokes all remote workstation sessions in a single operation", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const sessionsMenuBtn = page.getByRole("button", {
      name: "Connected Workstations",
    });
    await sessionsMenuBtn.click();

    await expect(
      page.getByRole("heading", { name: "Workstation Sessions & Terminals" }),
    ).toBeVisible({ timeout: 5000 });

    // Click "Revoke All Other Sessions"
    const revokeAllBtn = page.getByRole("button", {
      name: /Revoke All Other Sessions/i,
    });
    await expect(revokeAllBtn).toBeVisible();
    await revokeAllBtn.click();

    // Verify toast confirmation
    await expect(page.getByText("All Other Workstations Revoked")).toBeVisible({
      timeout: 5000,
    });

    // Only current workstation should remain
    await expect(page.getByText("1 Active Workstation")).toBeVisible();
    await expect(page.getByText("This Workstation (Current)")).toBeVisible();
    await expect(page.getByText("POS-TERMINAL-02")).not.toBeVisible();
    await expect(page.getByText("SALON-IPAD-01")).not.toBeVisible();

    // The Revoke All button should now be hidden since there are 0 remote sessions
    await expect(revokeAllBtn).not.toBeVisible();
  });
});
