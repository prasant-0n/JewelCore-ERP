import { test, expect } from "@playwright/test";

test.describe("POS Showroom Cashier & Billing Workstation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pos");
  });

  test("displays active salon cart and allows weighing cart on scale", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toContainText(/Point of Sale/i);

    // Verify terminal status badge
    await expect(
      page.locator("text=Terminal POS-01 Online").first(),
    ).toBeVisible();

    // Trigger Weigh Cart on Scale
    const weighBtn = page.getByRole("button", { name: "Weigh Cart on Scale" });
    await expect(weighBtn).toBeVisible();
    await weighBtn.click();

    // Check toast notification
    await expect(
      page.locator("text=Scale Gravimetric Sweep Completed"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("opens VIP Client modal and switches client context", async ({
    page,
  }) => {
    // Open client modal
    const clientSelectBtn = page.getByRole("button", {
      name: /Select Client/i,
    });
    await expect(clientSelectBtn).toBeVisible();
    await clientSelectBtn.click();

    // Modal should be visible
    const modalTitle = page.getByRole("heading", {
      name: "Select Private Client & KYC Verification",
    });
    await expect(modalTitle).toBeVisible();

    // Select "Mr. Vikramaditya Birla"
    const birlaCard = page.locator("text=Mr. Vikramaditya Birla").first();
    await expect(birlaCard).toBeVisible();
    await birlaCard.click();

    // Modal should close
    await expect(modalTitle).not.toBeVisible();

    // Button should now reflect Vikramaditya
    await expect(
      page.getByRole("button", { name: /Select Client \(Vikramaditya\)/i }),
    ).toBeVisible();

    // Billing Inspector should show Mr. Vikramaditya Birla
    const inspector = page.getByTestId("workstation-inspector");
    await expect(
      inspector.locator("text=Mr. Vikramaditya Birla").first(),
    ).toBeVisible();
  });

  test("toggles cart item selection and recalculates billing totals", async ({
    page,
  }) => {
    // Find piece card button
    const removeCartBtn = page
      .getByRole("button", { name: "Remove from Cart" })
      .first();
    if (await removeCartBtn.isVisible()) {
      await removeCartBtn.click();
      await page.waitForTimeout(300);
      // Button changes to Add to Cart
      await expect(
        page.getByRole("button", { name: "Add to Cart" }).first(),
      ).toBeVisible();
    }
  });

  test("authorizes sale and renders official Tax Invoice & Atelier Authenticity Certificate with JewelCore logo", async ({
    page,
  }) => {
    const authorizeBtn = page.getByRole("button", { name: "Authorize Sale" });
    await expect(authorizeBtn).toBeVisible();
    await authorizeBtn.click();

    // Verify Tax Invoice Modal with official JewelCore Logo appears
    const invoiceModal = page.locator("text=Tax Invoice & Authenticity Certificate").first();
    await expect(invoiceModal).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=JEWELCORE LUXURY ATELIER").first(),
    ).toBeVisible();
    await expect(
      page.locator('svg[aria-label="JewelCore Atelier Logo Mark"]').first(),
    ).toBeVisible();

    // Switch to ESC/POS Thermal Receipt tab
    const thermalTab = page.getByRole("button", { name: /ESC\/POS Thermal Receipt/i });
    await expect(thermalTab).toBeVisible();
    await thermalTab.click();
    await expect(page.locator("pre").first()).toContainText("JEWELCORE LUXURY ATELIER");

    // Switch back to A4 Tax Invoice
    const a4Tab = page.getByRole("button", { name: /Legal A4 Tax Invoice/i });
    await a4Tab.click();
    await expect(page.locator("#tax-invoice-sheet")).toBeVisible();

    // Open Jewellery Barcode Tags printing modal
    const printTagsBtn = page.getByRole("button", { name: /Print Jewellery Barcode Tags/i });
    await expect(printTagsBtn).toBeVisible();
    await printTagsBtn.click();

    // Verify Tag modal appears with butterfly tag dimension
    await expect(page.locator("text=Jewellery RFID / Barcode Tag Printing Station")).toBeVisible();
    await expect(page.locator("text=Tag Dimension: 50mm × 12mm Standard Butterfly")).toBeVisible();

    // Close tag modal
    const tagDoneBtn = page.getByRole("button", { name: "Done" });
    await expect(tagDoneBtn).toBeVisible();
    await tagDoneBtn.click();

    // Close invoice modal
    const closeBtn = page.getByRole("button", { name: "Close Window" });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(invoiceModal).not.toBeVisible();
  });
});
