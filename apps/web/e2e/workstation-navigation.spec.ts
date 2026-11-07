import { test, expect } from "@playwright/test";

test.describe("Workstation Navigation & Header Breadcrumbs", () => {
  const routes = [
    {
      path: "/",
      titleMatch: /Executive Control Tower/i,
    },
    {
      path: "/storage",
      titleMatch: /Interactive Vault & Storage Directory Visualizer/i,
    },
    {
      path: "/procurement",
      titleMatch: /Inward Procurement & Ingot Intake Directory/i,
    },
    {
      path: "/qc",
      titleMatch: /Analytical QC & Metallurgical Assay Directory/i,
    },
    {
      path: "/inventory",
      titleMatch: /Serialized Inventory & Provenance Directory/i,
    },
    {
      path: "/rfid",
      titleMatch: /Real-Time RFID Showroom & Bulk Vault Scan Kiosk/i,
    },
    {
      path: "/governance",
      titleMatch: /Multi-Signatory Quorum & Cryptographic Merkle Ledger/i,
    },
    {
      path: "/pricing",
      titleMatch: /Bullion Fixing, Dynamic Making Charges & Margin Rules/i,
    },
    {
      path: "/pos",
      titleMatch: /Point of Sale \(POS\) Showroom Terminal & Clienteling/i,
    },
    {
      path: "/returns",
      titleMatch: /Returns, Buyback Valuation & Scrap Refining Workflow/i,
    },
    {
      path: "/transfers",
      titleMatch: /Armored Fleet Tracking & Dual-Custody Manifests/i,
    },
  ];

  for (const route of routes) {
    test(`renders ${route.path} workstation cleanly`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(route.path));

      // Check top heading exists and matches workstation title
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(route.titleMatch);

      // Verify Sidebar navigation is rendered
      const sidebar = page.getByTestId("sidebar-nav");
      await expect(sidebar).toBeVisible();

      // Verify Header Bullion Ticker is visible on desktop viewport
      const ticker = page.locator("header").getByText("Au 24K").first();
      await expect(ticker).toBeVisible();
    });
  }
});
