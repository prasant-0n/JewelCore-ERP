import { test, expect } from "@playwright/test";

test.describe("RFID Telemetry & Governance Quorum Workstations", () => {
  test("RFID Kiosk: performs 360° antenna sweep and opens manual tag enrollment modal", async ({
    page,
  }) => {
    await page.goto("/rfid");

    await expect(page.locator("h1")).toContainText(/Real-Time RFID/i);

    // Verify 4-port reader status
    await expect(
      page.locator("text=Impinj Speedway R420 UHF").first(),
    ).toBeVisible();

    // Trigger 360 Antenna sweep
    const sweepBtn = page.getByRole("button", { name: "360° Antenna Sweep" });
    await expect(sweepBtn).toBeVisible();
    await sweepBtn.click();

    // Toast notification for antenna sweep
    await expect(page.locator("text=360° Antenna Sweep Completed")).toBeVisible(
      { timeout: 5000 },
    );

    // Open Manual Tag Enrollment Modal
    const manualBtn = page.getByRole("button", { name: "Manual Tag Intake" });
    await expect(manualBtn).toBeVisible();
    await manualBtn.click();

    // Verify Modal appears
    const modalTitle = page.getByRole("heading", {
      name: "Manual RFID Tag Registration",
    });
    await expect(modalTitle).toBeVisible();

    // Close modal via Cancel button
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await cancelBtn.click();
    await expect(modalTitle).not.toBeVisible();
  });

  test("Governance & Stock Gate: opens Emergency Override protocol modal safely", async ({
    page,
  }) => {
    await page.goto("/governance");

    await expect(page.locator("h1")).toContainText(/Multi-Signatory Quorum/i);

    // Open Emergency Override Modal
    const overrideBtn = page.getByRole("button", {
      name: "Emergency Override Request",
    });
    await expect(overrideBtn).toBeVisible();
    await overrideBtn.click();

    // Verify Modal appears with security prompt
    const modalTitle = page.getByRole("heading", {
      name: "High-Security Emergency Vault Override",
    });
    await expect(modalTitle).toBeVisible();

    // Cancel request safely
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(modalTitle).not.toBeVisible();
  });
});
