import { test, expect } from "@playwright/test";

test.describe("Hardware Telemetry Mesh & Serial Instrument Popover", () => {
  test("inspects connected instruments, tares balance, sweeps RFID antenna, and synchronizes vault scales", async ({
    page,
  }) => {
    await page.goto("/");

    // Locate the Hardware Mesh button in top header
    const meshBtn = page.locator('button[title*="Inspect Live Hardware Telemetry Mesh"]');
    await expect(meshBtn).toBeVisible({ timeout: 10000 });
    await expect(meshBtn.locator("text=Mesh")).toBeVisible();
    await expect(meshBtn.locator("text=4 Nodes")).toBeVisible();

    // Open Hardware Mesh Popover
    await meshBtn.click();
    await expect(page.locator("text=Hardware Telemetry Mesh").first()).toBeVisible();

    // Verify 4 Connected Instrument Nodes
    await expect(page.locator("text=Mettler Toledo XP205").first()).toBeVisible();
    await expect(page.locator("text=Impinj Speedway R420").first()).toBeVisible();
    await expect(page.locator("text=Bullion Market Ticker").first()).toBeVisible();
    await expect(page.locator("text=Dual-Sign HSM Quorum").first()).toBeVisible();

    // Test Tare Scale button from inside popover
    const tareBtn = page.getByRole("button", { name: "Tare Scale" });
    await expect(tareBtn).toBeVisible();
    await tareBtn.click();
    await expect(page.locator("text=Scale Calibrated").first()).toBeVisible({
      timeout: 5000,
    });

    // Test Antenna Sweep button from inside popover
    const sweepBtn = page.getByRole("button", { name: "Sweep" });
    await expect(sweepBtn).toBeVisible();
    await sweepBtn.click();
    await expect(
      page.locator("text=360° Antenna Sweep Completed").first(),
    ).toBeVisible({ timeout: 5000 });

    // Test Sync All Vault Scales from popover footer
    const syncBtn = page.getByRole("button", { name: "Sync All Vault Scales" }).first();
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();
    await expect(
      page.locator("text=Synchronizing Vault Scales").first(),
    ).toBeVisible({ timeout: 5000 });

    // Popover automatically closes after Sync All
    await expect(page.locator("text=Hardware Telemetry Mesh")).not.toBeVisible();
  });
});
