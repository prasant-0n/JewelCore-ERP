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

    // Open Batch Tag & ZPL Spooler Modal
    const batchBtn = page.getByRole("button", { name: "Batch Tag & ZPL Spooler" });
    await expect(batchBtn).toBeVisible();
    await batchBtn.click();

    // Verify Batch Modal appears
    const batchTitle = page.getByRole("heading", {
      name: "Batch RFID Tag Encoding & ZPL Spooler",
    });
    await expect(batchTitle).toBeVisible();

    // Verify batch download and dispatch buttons exist
    await expect(
      page.getByRole("button", { name: /Download Batch \.zpl/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Dispatch Print & Encode Job/i }),
    ).toBeVisible();

    // Close modal by clicking outside or pressing Escape
    await page.keyboard.press("Escape");
    await expect(batchTitle).not.toBeVisible();

    // Metrology Inspector: click Reprint Tag to open ZPL preview
    const reprintBtn = page.getByRole("button", { name: "Reprint Tag" });
    await expect(reprintBtn).toBeVisible();
    await reprintBtn.click();

    // Verify ZPL Preview Modal appears
    const zplTitle = page.getByRole("heading", {
      name: "Zebra ZPL II Jewellery Tag Preview",
    });
    await expect(zplTitle).toBeVisible();
    await expect(page.locator("text=Physical Tag Layout Preview")).toBeVisible();
    await expect(page.locator("text=ZPL II Thermal Stream Output:")).toBeVisible();

    // Close ZPL modal
    await page.keyboard.press("Escape");
    await expect(zplTitle).not.toBeVisible();

    // Seal Tray Audit
    const sealBtn = page.getByRole("button", { name: "Seal Audit" });
    await expect(sealBtn).toBeVisible();
    await sealBtn.click();
    await expect(page.locator("text=Tray Audit Sealed")).toBeVisible();
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
