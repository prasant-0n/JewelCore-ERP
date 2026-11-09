import { test, expect } from "@playwright/test";

test.describe("Milestone 10: Hardware Security Token Binding & Workstation Device Fingerprinting (NIST SP 800-63B AAL3)", () => {
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

  test("TopHeader renders STATION-DESK-01 AAL3 device binding badge and opens DeviceBindingModal", async ({
    page,
  }) => {
    // 1. Verify the ambient device binding badge is visible in header
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await expect(deviceBadge).toBeVisible({ timeout: 10000 });
    await expect(deviceBadge).toContainText("STATION-DESK-01");
    await expect(deviceBadge).toContainText("AAL3");

    // 2. Click badge to open DeviceBindingModal
    await deviceBadge.click();

    // 3. Verify modal opens with title and NIST standard reference
    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("Hardware Device Binding & AAL3 Trust Registry"),
    ).toBeVisible();
    // Use .first() since NIST text appears in both header and checklist
    await expect(
      modal.getByText(/NIST SP 800-63B AAL3/).first(),
    ).toBeVisible();
  });

  test("shows current device fingerprint and NIST AAL3 compliance checklist", async ({
    page,
  }) => {
    // 1. Open modal from TopHeader device badge directly (avoids strict mode conflict with profile menu)
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await expect(deviceBadge).toBeVisible({ timeout: 10000 });
    await deviceBadge.click();

    // 2. Verify modal
    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();

    // 3. Current workstation shows device fingerprint (starts with fp_)
    await expect(modal.getByText(/fp_/).first()).toBeVisible();

    // 4. NIST AAL3 compliance checklist
    await expect(
      modal.getByText(/Hardware TPM\/SEP cryptographic chip bound/),
    ).toBeVisible();
    await expect(
      modal.getByText(/WebAuthn discoverable resident credentials/),
    ).toBeVisible();
    await expect(
      modal.getByText(/Showroom LAN Subnet 192\.168\.1\.0\/24 verified/),
    ).toBeVisible();
    await expect(
      modal.getByText(/Physical presence touch challenge attested/),
    ).toBeVisible();

    // 5. 100% Attested badge
    await expect(modal.getByText("100% Attested")).toBeVisible();
  });

  test("shows enrolled showroom terminal fleet with STATION-DESK-01, POS-TERMINAL-02, and SALON-IPAD-01", async ({
    page,
  }) => {
    // 1. Open modal
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await deviceBadge.click();

    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();

    // 2. Verify all three fleet terminals are listed (use .first() to avoid matching in current workstation card + fleet list)
    await expect(modal.getByText("STATION-DESK-01").first()).toBeVisible();
    await expect(modal.getByText("POS-TERMINAL-02").first()).toBeVisible();
    await expect(modal.getByText("SALON-IPAD-01").first()).toBeVisible();

    // 3. Verify fleet section title
    await expect(
      modal.getByText("Enrolled Showroom Terminal Fleet"),
    ).toBeVisible();
  });

  test("enrolls new terminal SURAT-ATELIER-01 with valid supervisor PIN 1234", async ({
    page,
  }) => {
    // 1. Open modal
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await deviceBadge.click();

    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();

    // 2. Click "Enroll Terminal" button
    const enrollBtn = modal.getByRole("button", { name: /Enroll Terminal/i });
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // 3. Fill enrollment form
    await modal
      .getByPlaceholder("e.g. SURAT-ATELIER-01")
      .fill("SURAT-ATELIER-01");
    await modal
      .getByPlaceholder("e.g. Surat Crafting Atelier Terminal #01")
      .fill("Surat Crafting Atelier Terminal #01");

    // 4. Enter valid supervisor PIN
    await modal.getByPlaceholder("••••").fill("1234");

    // 5. Submit enrollment
    const submitBtn = modal.getByRole("button", {
      name: /Complete Hardware Device Registration/i,
    });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 6. Verify the new terminal appears in fleet list (use exact: true to avoid matching Disconnect button)
    await expect(
      modal.getByText("SURAT-ATELIER-01", { exact: true }),
    ).toBeVisible({ timeout: 5000 });

    // 7. Verify success toast notification
    await expect(
      page.getByText("Hardware Terminal Enrolled"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("rejects enrollment with invalid supervisor PIN 0000", async ({
    page,
  }) => {
    // 1. Open modal
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await deviceBadge.click();

    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();

    // 2. Click "Enroll Terminal"
    const enrollBtn = modal.getByRole("button", { name: /Enroll Terminal/i });
    await enrollBtn.click();

    // 3. Fill form with invalid PIN
    await modal
      .getByPlaceholder("e.g. SURAT-ATELIER-01")
      .fill("INVALID-TERM-01");
    await modal
      .getByPlaceholder("e.g. Surat Crafting Atelier Terminal #01")
      .fill("Test Terminal");
    await modal.getByPlaceholder("••••").fill("0000");

    // 4. Submit
    const submitBtn = modal.getByRole("button", {
      name: /Complete Hardware Device Registration/i,
    });
    await submitBtn.click();

    // 5. Verify error message appears
    await expect(
      modal.getByText(/Hardware Enrollment Rejected: Invalid supervisor PIN/i),
    ).toBeVisible({ timeout: 5000 });

    // 6. Verify error toast
    await expect(
      page.getByText("Device Enrollment Rejected"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("revokes device binding for a non-current terminal and shows Revoked badge", async ({
    page,
  }) => {
    // 1. Open modal
    const deviceBadge = page.locator(
      'button[title*="Workstation Hardware Trust"]',
    );
    await deviceBadge.click();

    const modal = page.getByTestId("hardware-device-binding-modal");
    await expect(modal).toBeVisible();

    // 2. First enroll a fresh terminal to ensure we have something to revoke
    const enrollBtn = modal.getByRole("button", { name: /Enroll Terminal/i });
    await enrollBtn.click();

    await modal
      .getByPlaceholder("e.g. SURAT-ATELIER-01")
      .fill("REVOKE-TEST-01");
    await modal
      .getByPlaceholder("e.g. Surat Crafting Atelier Terminal #01")
      .fill("Revocation Test Terminal");
    await modal.getByPlaceholder("••••").fill("1234");

    const submitBtn = modal.getByRole("button", {
      name: /Complete Hardware Device Registration/i,
    });
    await submitBtn.click();

    // 3. Wait for enrollment success toast
    await expect(
      page.getByText("Hardware Terminal Enrolled"),
    ).toBeVisible({ timeout: 5000 });

    // 4. Find the Disconnect button for the newly enrolled terminal
    const disconnectBtn = modal.getByRole("button", {
      name: /Disconnect REVOKE-TEST-01/i,
    });
    await expect(disconnectBtn).toBeVisible({ timeout: 5000 });
    await disconnectBtn.click();

    // 5. Verify "Revoked" badge appears
    await expect(modal.getByText("Revoked").first()).toBeVisible({ timeout: 5000 });

    // 6. Verify security revocation toast
    await expect(
      page.getByText("Hardware Device Binding Revoked"),
    ).toBeVisible({ timeout: 5000 });
  });
});
