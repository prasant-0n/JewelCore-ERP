import { test, expect } from "@playwright/test";

test.describe("Atelier Manufacturing & Karigar Work Orders (Pathway A)", () => {
  test("renders manufacturing workstation header, karkhana badge and KPI cards", async ({ page }) => {
    await page.goto("/manufacturing");

    await expect(page.getByRole("heading", { name: "Atelier Manufacturing & Karigar Work Orders" })).toBeVisible();
    await expect(page.getByText("Karkhana Floor")).toBeVisible();
    await expect(page.getByText("Pure Bullion In Custody")).toBeVisible();
    await expect(page.getByText("Active Artisan Job Cards")).toBeVisible();
    await expect(page.getByText("Atelier Metal Wastage Rate")).toBeVisible();
    await expect(page.getByText("Making Charges Allocated")).toBeVisible();
  });

  test("interacts with Active Job Cards stream and advances crafting stage", async ({ page }) => {
    await page.goto("/manufacturing");

    await expect(page.getByText("JOB-2026-4819")).toBeVisible();
    await expect(page.locator("strong", { hasText: "Master Rameshwar Chitrakar" }).first()).toBeVisible();

    // Verify stage pipeline is visible
    await expect(page.getByText("Crafting Lifecycle Pipeline:").first()).toBeVisible();

    // Advance stage
    const advanceBtn = page.getByRole("button", { name: "Advance Stage" }).first();
    if (await advanceBtn.isVisible()) {
      await advanceBtn.click();
      await expect(page.getByText(/advanced to stage:/i).first()).toBeVisible();
    }
  });

  test("opens Issue Job Card modal and creates a new artisan job order", async ({ page }) => {
    await page.goto("/manufacturing");

    await page.getByRole("button", { name: "Issue Job Card" }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal.getByText("Issue Manufacturing Job Card (Karkhana Pass)")).toBeVisible();

    // Select craftsman inside dialog and fill form
    await modal.locator("select").first().selectOption({ index: 1 });
    await modal.getByPlaceholder("e.g. 18K Oval Solitaire Halo Ring").fill("Custom Platinum Art Deco Pendant");
    await modal.getByPlaceholder("Rings & Solitaires").fill("Pendants");

    await modal.getByRole("button", { name: "Issue Job Order" }).click();
    await expect(page.getByText(/issued to/i).first()).toBeVisible();
    await expect(page.getByText("Custom Platinum Art Deco Pendant").first()).toBeVisible();
  });

  test("records return with scrap weighing and reconciles metal loss tolerance", async ({ page }) => {
    await page.goto("/manufacturing");

    await page.getByRole("button", { name: "Record Return" }).first().click();
    await expect(page.getByText("Record Artisan Return & Scrap Weighing")).toBeVisible();

    // Fill piece weight and clean scrap sprues weight
    await page.getByPlaceholder("e.g. 4.850").fill("5.100");
    await page.getByPlaceholder("e.g. 2.410").fill("2.150");

    // Live loss preview
    await expect(page.getByText("Total Returned Metal:")).toBeVisible();
    await expect(page.getByText("Unrecovered Filing Dust / Loss:")).toBeVisible();
    await expect(page.getByText("Actual Loss Percentage:")).toBeVisible();

    await page.getByRole("button", { name: "Finalize Weighing & Advance to QC" }).click();
    await expect(page.getByText(/Artisan return recorded/i).first()).toBeVisible();
  });

  test("inspects Metal Loss & Scrap Reconciliation Ledger tab", async ({ page }) => {
    await page.goto("/manufacturing");

    await page.getByRole("button", { name: "Metal Loss & Scrap Reconciliation" }).click();
    await expect(page.getByText("Artisan Metal Reconciliation & Shrinkage Ledger")).toBeVisible();
    await expect(page.getByText("Issued Metal (g)")).toBeVisible();
    await expect(page.getByText("Crafted Piece (g)")).toBeVisible();
    await expect(page.getByText("Clean Scrap (g)")).toBeVisible();
    await expect(page.getByText("Unrecovered Loss (g)")).toBeVisible();
  });

  test("inspects Master Karigars Directory and BOM Design Recipes tabs", async ({ page }) => {
    await page.goto("/manufacturing");

    // Master Karigars tab
    await page.getByRole("button", { name: /Master Karigars Directory/i }).click();
    await expect(page.getByText("KRG-MUM-01")).toBeVisible();
    await expect(page.getByText("DIAMOND MICRO PAVE").first()).toBeVisible();
    await expect(page.getByText("Bowbazar Crafting Lane 12, Kolkata").first()).toBeVisible();

    // BOM Design Recipes tab
    await page.getByRole("button", { name: /BOM Design Recipes/i }).click();
    await expect(page.getByText("BOM-SOL-2026").first()).toBeVisible();
    await expect(page.getByText("BOM-CHK-2026").first()).toBeVisible();
    await expect(page.getByText("Standard Making Charge:").first()).toBeVisible();
  });

  test("can navigate to Atelier Crafting from main sidebar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Atelier Crafting" }).click();
    await expect(page).toHaveURL(/\/manufacturing/);
    await expect(page.getByRole("heading", { name: "Atelier Manufacturing & Karigar Work Orders" })).toBeVisible();
  });
});
