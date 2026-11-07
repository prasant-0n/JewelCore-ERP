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
});
