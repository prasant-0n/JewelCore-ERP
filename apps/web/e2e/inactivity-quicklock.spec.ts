import { test, expect } from "@playwright/test";

test.describe("Inactivity Auto-Lock & 4-Digit Showroom PIN Fast-Resume", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("locks terminal on manual trigger and displays active operator card with blurred background", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await expect(lockBtn).toBeVisible({ timeout: 10000 });
    await lockBtn.click();

    // Verify modal elements scoped to dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();
    await expect(dialog.getByText("Workstation Standby Mode")).toBeVisible();
    await expect(dialog.getByText("Rachel R.")).toBeVisible();
    await expect(dialog.getByText("Store Branch Manager")).toBeVisible();

    // Verify main workspace is blurred while locked
    const blurredContainer = page.getByTestId("workspace-shell");
    await expect(blurredContainer).toHaveClass(/filter blur-md/);
  });

  test("unlocks terminal using physical keyboard number entry", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await lockBtn.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();

    // Press physical keys on keyboard
    await page.keyboard.press("1");
    await page.keyboard.press("2");
    await page.keyboard.press("3");
    await page.keyboard.press("4");

    // Modal should automatically unlock and close
    await expect(page.getByRole("heading", { name: "Terminal Locked" })).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("unlocks terminal using Master Supervisor Emergency PIN 9999", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await lockBtn.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();

    // Press 9 four times
    const digit9 = page.getByRole("button", { name: "9", exact: true });
    await digit9.click();
    await digit9.click();
    await digit9.click();
    await digit9.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("displays remaining attempts on incorrect PIN and triggers cooldown after 3 failures", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await lockBtn.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();

    const digit0 = page.getByRole("button", { name: "0", exact: true });

    // Attempt 1: enter 0000
    for (let i = 0; i < 4; i++) await digit0.click();
    await expect(page.getByText(/Invalid PIN.*2 attempts remaining/i)).toBeVisible({
      timeout: 3000,
    });

    // Attempt 2: enter 0000
    for (let i = 0; i < 4; i++) await digit0.click();
    await expect(page.getByText(/Invalid PIN.*1 attempt remaining/i)).toBeVisible({
      timeout: 3000,
    });

    // Attempt 3: enter 0000 -> Lockout Cooldown triggered
    for (let i = 0; i < 4; i++) await digit0.click();
    await expect(page.getByText(/Lockout Cooldown: \d+s remaining/i)).toBeVisible({
      timeout: 3000,
    });

    // Keypad buttons should be disabled during cooldown
    await expect(digit0).toBeDisabled();
  });

  test("allows switching staff or signing out directly from locked screen", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await lockBtn.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();

    // Click "Switch Staff / Sign Out of Workstation"
    const switchStaffBtn = page.getByRole("button", {
      name: "Switch Staff / Sign Out of Workstation",
    });
    await expect(switchStaffBtn).toBeVisible();
    await switchStaffBtn.click();

    // User should be signed out and redirected to /login
    await page.waitForURL("**/login**", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "JewelCore Atelier" })).toBeVisible();
  });

  test("persists locked state across browser reload and restores on PIN entry", async ({
    page,
  }) => {
    const lockBtn = page.getByRole("button", { name: "Quick Lock Terminal" });
    await lockBtn.click();

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible();

    // Reload page while locked
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Modal must still be locked due to session persistence!
    await expect(page.getByRole("heading", { name: "Terminal Locked" })).toBeVisible({
      timeout: 10000,
    });

    // Enter correct PIN 1234
    await page.keyboard.press("1");
    await page.keyboard.press("2");
    await page.keyboard.press("3");
    await page.keyboard.press("4");

    await expect(page.getByRole("heading", { name: "Terminal Locked" })).not.toBeVisible({
      timeout: 5000,
    });
  });
});
