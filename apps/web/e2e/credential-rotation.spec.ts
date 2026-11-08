import { test, expect } from "@playwright/test";

test.describe("Staff Credential Rotation & NIST SP 800-63B Password Policy", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("opens Rotate Passkey modal from TopHeader and displays NIST criteria", async ({
    page,
  }) => {
    // Open active operator dropdown
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // Click Rotate Passkey action
    const rotateBtn = page.getByRole("button", { name: "Rotate Passkey" });
    await expect(rotateBtn).toBeVisible();
    await rotateBtn.click();

    // Verify modal is open
    const modalHeading = page.getByRole("heading", {
      name: "Rotate Workstation Passkey",
    });
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Verify NIST checklist items are displayed
    await expect(page.getByText("At least 12 characters length")).toBeVisible();
    await expect(
      page.getByText("Uppercase and lowercase characters"),
    ).toBeVisible();
    await expect(
      page.getByText("Numbers and special symbols (!@#$%^&*)"),
    ).toBeVisible();
    await expect(page.getByText("Passwords match exactly")).toBeVisible();
  });

  test("dynamically evaluates entropy strength and updates 4-segment visual meter", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const rotateBtn = page.getByRole("button", { name: "Rotate Passkey" });
    await rotateBtn.click();

    const newPasswordInput = page.locator('input[id="new-password"]');

    // Short password displays "Too Short"
    await newPasswordInput.fill("weak");
    await expect(page.getByText("Too Short")).toBeVisible();

    // 12 lowercase characters meets length only -> displays "Weak"
    await newPasswordInput.fill("weakweakweak");
    await expect(page.getByText("Weak")).toBeVisible();

    // Type complex NIST military grade password (16+ chars, upper, lower, digit, symbol)
    await newPasswordInput.fill("JewelCore@LuxuryAtelier2026!");
    await expect(page.getByText("Atelier Military Grade")).toBeVisible();
  });

  test("toggles plaintext visibility for password input fields", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const rotateBtn = page.getByRole("button", { name: "Rotate Passkey" });
    await rotateBtn.click();

    const currentPasswordInput = page.locator('input[id="current-password"]');
    await expect(currentPasswordInput).toHaveAttribute("type", "password");

    const eyeBtn = page.getByRole("button", { name: "Show current password" });
    await eyeBtn.click();
    await expect(currentPasswordInput).toHaveAttribute("type", "text");

    const eyeOffBtn = page.getByRole("button", {
      name: "Hide current password",
    });
    await eyeOffBtn.click();
    await expect(currentPasswordInput).toHaveAttribute("type", "password");
  });

  test("successfully rotates passkey with valid current credentials and NIST compliant new password", async ({
    page,
  }) => {
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await operatorBtn.click();

    const rotateBtn = page.getByRole("button", { name: "Rotate Passkey" });
    await rotateBtn.click();

    // Fill valid credentials
    const currentInput = page.locator('input[id="current-password"]');
    const newInput = page.locator('input[id="new-password"]');
    const confirmInput = page.locator('input[id="confirm-password"]');

    await currentInput.fill("JewelCore@2026");
    await newInput.fill("JewelCore@Master2026!");
    await confirmInput.fill("JewelCore@Master2026!");

    const submitBtn = page.getByRole("button", {
      name: "Rotate Workstation Passkey",
    });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify toast confirmation and modal dismissal
    await expect(page.getByText("Passkey Rotated Successfully")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("heading", { name: "Rotate Workstation Passkey" }),
    ).not.toBeVisible();
  });
});
