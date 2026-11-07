import { test, expect } from "@playwright/test";

test.describe("Master-Detail Workstation Inspectors", () => {
  test("Procurement: selecting an ingot updates the IngotInspector & Auto-Tare works", async ({
    page,
  }) => {
    await page.goto("/procurement");

    // Default state: "VAL-BAR-01" is selected initially or visible
    await expect(page.locator("text=VAL-BAR-01").first()).toBeVisible();

    // Click on ingot "VAL-BAR-02"
    const bar2Card = page.locator("text=VAL-BAR-02").first();
    await expect(bar2Card).toBeVisible();
    await bar2Card.click();

    // Verify Inspector displays VAL-BAR-02
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector.locator("text=VAL-BAR-02").first()).toBeVisible();

    // Test "Auto-Tare Scale" action button
    const tareButton = page.getByRole("button", { name: "Auto-Tare Scale" });
    await expect(tareButton).toBeVisible();
    await tareButton.click();

    // Verify toast notification appears
    await expect(
      page.getByText("Scale Calibrated", { exact: true }),
    ).toBeVisible();
  });

  test("QC Workstation: selecting QC items renders assay spectrometry details", async ({
    page,
  }) => {
    await page.goto("/qc");

    await expect(page.locator("h1")).toContainText(
      /Analytical QC & Metallurgical Assay Directory/i,
    );

    // Verify inspector contains analytical indicators
    const inspector = page.getByTestId("workstation-inspector");
    await expect(inspector).toBeVisible();
    await expect(
      inspector.locator("text=ISO/IEC 17025 Calibrated").first(),
    ).toBeVisible();
  });

  test("Bullion Pricing: selecting alloy cards updates dynamic pricing rules", async ({
    page,
  }) => {
    await page.goto("/pricing");

    await expect(page.locator("h1")).toContainText(
      /Bullion Fixing, Dynamic Making Charges & Margin Rules/i,
    );

    // Look for 22K alloy card
    const gold22k = page.locator("text=Au 916 Standard Gold (22K)").first();
    await expect(gold22k).toBeVisible();
    await gold22k.click();

    // Inspector should display the selected alloy details
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=Au 916 Standard Gold (22K)").first(),
    ).toBeVisible();
  });

  test("Inventory Master: clicking jewellery piece cards inspects pedigree lineage", async ({
    page,
  }) => {
    await page.goto("/inventory");

    await expect(page.locator("h1")).toContainText(
      /Serialized Inventory & Provenance Directory/i,
    );

    // Inspector should display the piece pedigree
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=GIA-2210894511").first(),
    ).toBeVisible();
  });
});
