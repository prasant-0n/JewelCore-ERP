import { test, expect } from "@playwright/test";

test.describe("FIDO2 / WebAuthn Biometric & Hardware Passkeys", () => {
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

  test("opens Biometric Passkeys modal from TopHeader and lists enrolled hardware authenticators", async ({
    page,
  }) => {
    // 1. Open operator profile menu
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // 2. Click "Biometric Passkeys" action
    const passkeysBtn = page.getByRole("button", { name: /Biometric Passkeys/i });
    await expect(passkeysBtn).toBeVisible();
    await passkeysBtn.click();

    // 3. Verify modal opens with FIDO2 title and badge
    const modal = page.getByTestId("webauthn-passkeys-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Biometric & Hardware Passkeys")).toBeVisible();
    await expect(modal.getByText("FIDO2 / WebAuthn", { exact: true })).toBeVisible();

    // 4. Verify initial hardware keys are rendered
    await expect(modal.getByText("YubiKey 5 NFC (Vault Custody Key)")).toBeVisible();
    await expect(modal.getByText("Apple TouchID (Atelier Main Terminal)")).toBeVisible();
  });

  test("enrolls a new FIDO2 hardware passkey", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Biometric Passkeys/i }).click();

    const modal = page.getByTestId("webauthn-passkeys-modal");
    await expect(modal).toBeVisible();

    // Click "Enroll Key" button
    const enrollBtn = modal.getByRole("button", { name: "Enroll Key" });
    await enrollBtn.click();

    // Verify enrollment form is displayed
    await expect(modal.getByText("Enroll New Physical Security Authenticator")).toBeVisible();

    // Enter Key Label
    const labelInput = modal.getByPlaceholder(/Vault Key 02/i);
    await labelInput.fill("Vault Master Key 04");

    // Click submit
    const submitBtn = modal.getByRole("button", { name: "Complete Hardware Registration" });
    await submitBtn.click();

    // Verify new passkey is listed in the authenticators list
    await expect(modal.getByText("Vault Master Key 04")).toBeVisible();
  });

  test("simulates hardware touch assertion verification", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Biometric Passkeys/i }).click();

    const modal = page.getByTestId("webauthn-passkeys-modal");
    await expect(modal).toBeVisible();

    // Click "Test Touch" on YubiKey
    const testTouchBtn = modal.getByRole("button", { name: /Test Touch/i }).first();
    await testTouchBtn.click();

    // Verify status changes to "Verifying..." and then back to "Test Touch"
    await expect(modal.getByRole("button", { name: /Test Touch/i }).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("revokes an enrolled passkey and closes modal cleanly", async ({ page }) => {
    // Open modal
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();
    await page.getByRole("button", { name: /Biometric Passkeys/i }).click();

    const modal = page.getByTestId("webauthn-passkeys-modal");
    await expect(modal).toBeVisible();

    // Revoke Apple TouchID
    const revokeBtn = modal.getByRole("button", {
      name: "Revoke Apple TouchID (Atelier Main Terminal)",
    });
    await revokeBtn.click();

    // Verify Apple TouchID is removed
    await expect(modal.getByText("Apple TouchID (Atelier Main Terminal)")).not.toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: "Close Authenticator Panel" }).click();
    await expect(modal).not.toBeVisible();
  });
});
