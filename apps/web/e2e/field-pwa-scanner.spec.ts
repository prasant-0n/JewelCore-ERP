import { test, expect } from "@playwright/test";

test.describe("Pathway 1: Showroom Floor Mobile PWA, Camera Scanner & VIP Salon Presentation", () => {
  test("serves PWA manifest and offline service worker assets", async ({ page }) => {
    // Check manifest endpoint
    const manifestRes = await page.request.get("/manifest.json");
    expect(manifestRes.status()).toBe(200);
    const manifestJson = await manifestRes.json();
    expect(manifestJson.name).toContain("JewelCore");
    expect(manifestJson.display).toBe("standalone");

    // Check service worker script
    const swRes = await page.request.get("/sw.js");
    expect(swRes.status()).toBe(200);
    const swText = await swRes.text();
    expect(swText).toContain("jewelcore-pwa-v1");
  });

  test("opens camera barcode scanner modal from header and simulates scan", async ({ page }) => {
    await page.goto("/pos");

    // Click "Scan Tag" button in the TopHeader
    const scanTagBtn = page.getByRole("button", { name: /Scan Tag/i });
    await expect(scanTagBtn).toBeVisible();
    await scanTagBtn.click();

    // Verify modal appears
    await expect(page.locator("text=Showroom Floor Camera Scanner")).toBeVisible();
    await expect(
      page.locator("text=Point tablet or mobile camera at 50×12mm jewellery barcode tag"),
    ).toBeVisible();

    // Verify quick-scan simulation chips
    const chip = page.locator("button:has-text('JC-SOL-2026-9041')").first();
    await expect(chip).toBeVisible();

    // Click chip to simulate camera barcode ingestion
    await chip.click();

    // Verify scanner modal closes
    await expect(page.locator("text=Showroom Floor Camera Scanner")).not.toBeVisible();

    // Verify VIP Salon presentation modal automatically opens upon piece ingestion
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=BIS Hallmarked")).toBeVisible();
  });

  test("interacts with VIP Salon Presentation Mode: lighting, rotation, specs & add-to-tray", async ({
    page,
  }) => {
    await page.goto("/pos");

    // Click Salon View button in the header toolbar
    const salonBtn = page.getByRole("button", { name: /Salon View/i });
    await expect(salonBtn).toBeVisible();
    await salonBtn.click();

    // Verify VIP Presentation modal is open
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).toBeVisible();

    // Check studio lighting options
    const warmBtn = page.getByRole("button", { name: /Atelier Warm/i });
    const daylightBtn = page.getByRole("button", { name: /Daylight 5500K/i });

    await expect(warmBtn).toBeVisible();
    await expect(daylightBtn).toBeVisible();

    // Switch lighting to Daylight
    await daylightBtn.click();

    // Rotate pedestal
    const rotateBtn = page.getByTitle("Rotate Piece");
    await expect(rotateBtn).toBeVisible();
    await rotateBtn.click();

    // Verify XRF spectrometry & hallmark specs
    await expect(page.locator("text=XRF Spectrometry Assurance:")).toBeVisible();
    await expect(page.locator("text=99.98% Purity Pass")).toBeVisible();

    // Test Add to Client Tray button
    const addToTrayBtn = page.getByRole("button", { name: /Add to Private Salon Tray/i });
    await expect(addToTrayBtn).toBeVisible();
    await addToTrayBtn.click();

    // Modal should close and toast should appear
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).not.toBeVisible();
    await expect(page.locator("text=Added to VIP Client Cart")).toBeVisible();
  });

  test("allows opening Salon View directly from individual piece card", async ({ page }) => {
    await page.goto("/pos");

    // Find a piece card with "Salon" button
    const cardSalonBtn = page.locator("button:has-text('Salon')").first();
    await expect(cardSalonBtn).toBeVisible();
    await cardSalonBtn.click();

    // Verify Salon Presentation modal opens
    await expect(page.locator("text=PRIVATE CLIENT SALON • VIP PRESENTATION")).toBeVisible();

    // Verify Certificate Download button exists
    const certBtn = page.getByRole("button", { name: /Export Certificate of Authenticity/i });
    await expect(certBtn).toBeVisible();
  });
});
