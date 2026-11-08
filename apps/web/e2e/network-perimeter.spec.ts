import { test, expect } from "@playwright/test";

test.describe("Showroom LAN Geofencing & Subnet Enclave", () => {
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

  test("displays ambient Showroom LAN Perimeter badge in TopHeader and opens modal on click", async ({
    page,
  }) => {
    // 1. Verify ambient badge in TopHeader
    const lanBadge = page.getByLabel("Network Perimeter Status");
    await expect(lanBadge).toBeVisible();
    await expect(lanBadge.getByText("LAN SECURED")).toBeVisible();

    // 2. Click ambient badge to open modal
    await lanBadge.click();

    // 3. Verify modal opens with telemetry
    const modal = page.getByTestId("network-perimeter-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Showroom LAN Geofencing & Subnet Enclave")).toBeVisible();
    await expect(modal.getByText("PERIMETER SECURED").first()).toBeVisible();
    await expect(modal.getByText("192.168.1.102").first()).toBeVisible();
    await expect(modal.getByText("MAIN-SHOWROOM-DESK-01")).toBeVisible();
  });

  test("opens Network Perimeter modal from operator profile menu", async ({ page }) => {
    // 1. Open operator profile menu
    const operatorBtn = page.locator('button[title*="Switch User Identity"]');
    await expect(operatorBtn).toBeVisible({ timeout: 10000 });
    await operatorBtn.click();

    // 2. Click Network Geofence action
    const geofenceBtn = page.getByRole("button", { name: /Network Geofence/i });
    await expect(geofenceBtn).toBeVisible();
    await geofenceBtn.click();

    // 3. Verify modal is visible
    const modal = page.getByTestId("network-perimeter-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Showroom LAN Geofencing & Subnet Enclave")).toBeVisible();
  });

  test("simulates switching to an untrusted external WAN IP and updates header badge", async ({
    page,
  }) => {
    // Open modal via ambient badge
    await page.getByLabel("Network Perimeter Status").click();
    const modal = page.getByTestId("network-perimeter-modal");
    await expect(modal).toBeVisible();

    // Click "External Public WAN" simulator button
    const externalWanBtn = modal.getByRole("button", { name: /External Public WAN/i });
    await externalWanBtn.click();

    // Verify modal status updates to OFF-PREMISES WAN
    await expect(modal.getByText("OFF-PREMISES WAN")).toBeVisible();
    await expect(modal.getByText("203.0.113.45").first()).toBeVisible();
    await expect(modal.getByText("Untrusted Public Network")).toBeVisible();

    // Close modal
    await modal.getByRole("button", { name: "Close Network Perimeter Panel" }).click();
    await expect(modal).not.toBeVisible();

    // Verify header ambient badge now reflects OFF-PREMISES
    const lanBadge = page.getByLabel("Network Perimeter Status");
    await expect(lanBadge.getByText("OFF-PREMISES")).toBeVisible();

    // Re-open and restore back to Showroom Floor LAN
    await lanBadge.click();
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: /Showroom Floor LAN/i }).click();
    await expect(modal.getByText("PERIMETER SECURED").first()).toBeVisible();

    // Close modal and verify header badge restored
    await modal.getByRole("button", { name: "Close Network Perimeter Panel" }).click();
    await expect(modal).not.toBeVisible();
    await expect(lanBadge.getByText("LAN SECURED")).toBeVisible();
  });
});
