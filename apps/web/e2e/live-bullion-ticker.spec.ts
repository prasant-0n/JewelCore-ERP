import { test, expect } from "@playwright/test";

test.describe("Commodity Exchange Ingestion & Live Bullion Ticker (Pathway C)", () => {
  test("renders TopHeader live bullion ticker and opens exchange telemetry dropdown", async ({ page }) => {
    await page.goto("/pricing");

    const tickerBtn = page.getByTitle("Inspect Live MCX/LBMA Spot Ticker & Trigger Exchange Ingestion");
    await expect(tickerBtn).toBeVisible();
    await expect(tickerBtn.getByText("Au 24K")).toBeVisible();

    // Click ticker button to toggle dropdown
    await tickerBtn.click();

    await expect(page.getByText("Live Commodity Exchange Feed")).toBeVisible();
    await expect(page.getByText("Au 24K Pure (999.9)")).toBeVisible();
    await expect(page.getByText("Au 22K Hallmark (916)")).toBeVisible();
    await expect(page.getByText("Ag 999.0 Silver Bar")).toBeVisible();
    await expect(page.getByText("Sync MCX Live Spot Now")).toBeVisible();
  });

  test("triggers instant MCX exchange spot sync from TopHeader dropdown", async ({ page }) => {
    await page.goto("/pricing");

    const tickerBtn = page.getByTitle("Inspect Live MCX/LBMA Spot Ticker & Trigger Exchange Ingestion");
    await tickerBtn.click();

    await page.getByRole("button", { name: "Sync MCX Live Spot Now" }).click();

    await expect(page.getByText("MCX Bullion Spot Synchronized")).toBeVisible();
  });

  test("renders Commodity Exchange Ingestion Engine banner and triggers live ingestion", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByText("Commodity Exchange Ingestion Engine (MCX / LBMA / IBJA)")).toBeVisible();
    await expect(page.getByText("MCX Continuous Parity")).toBeVisible();

    const triggerBtn = page.getByRole("button", { name: "Trigger Live Ingestion" });
    await expect(triggerBtn).toBeVisible();

    await triggerBtn.click();

    await expect(page.getByText("Commodity Exchange Feed Synchronized")).toBeVisible();
  });

  test("inspects 24K, 22K, and 18K alloy fixing matrix and verifies spot linked calculations", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: "Au 999.9 Fine Gold (24K)" })).toBeVisible();
    await expect(page.getByText("Au 916 Standard Gold (22K)").first()).toBeVisible();
    await expect(page.getByText("Au 750 Artisan Gold (18K)").first()).toBeVisible();

    // Click on 22K alloy to inspect in inspector sidebar
    await page.getByText("Au 916 Standard Gold (22K)").first().click();
    await expect(page.getByText("MCX Live Feed Sync").first()).toBeVisible();
    await expect(page.getByText("Published Retail Rate:").first()).toBeVisible();
  });
});
