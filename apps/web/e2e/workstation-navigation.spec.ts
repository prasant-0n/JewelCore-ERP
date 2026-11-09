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

  test("Executive Command Center: verifies live aggregation, drawer inspection and scale sync", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Verify Top Subheader and Workstation Title
    await expect(page.locator("h1")).toContainText(/Executive Control Tower/i);

    // 2. Verify Live Bullion Ticker Widget
    await expect(page.locator("text=Live Bullion Fixing (IBJA)")).toBeVisible();
    await expect(page.locator("text=Gold 24K (999)").first()).toBeVisible();

    // 3. Sync All Vault Scales action
    const syncBtn = page.getByRole("button", { name: /Sync All Vault Scales/i });
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();
    await expect(page.locator("text=Synchronizing Vault Scales")).toBeVisible({
      timeout: 5000,
    });

    // 4. Test Custody Filter Tabs
    const displayTab = page.getByRole("button", { name: "Display" });
    await expect(displayTab).toBeVisible();
    await displayTab.click();

    // 5. Click on an inventory row to open PieceInspectorDrawer
    const pieceRow = page.locator("tr").filter({ hasText: "JC-SOL-2026-081" }).first();
    await expect(pieceRow).toBeVisible();
    await pieceRow.click();

    // 6. Verify 4-dimension audit state matrix in drawer
    await expect(
      page.locator("text=Governance & State Matrix (INV-01)"),
    ).toBeVisible();
    await expect(page.getByText("QUALITY", { exact: true })).toBeVisible();
    await expect(page.getByText("APPROVAL", { exact: true })).toBeVisible();
    await expect(page.getByText("CUSTODY", { exact: true })).toBeVisible();
    await expect(page.getByText("COMMERCIAL", { exact: true })).toBeVisible();

    // Close drawer via Escape key
    await page.keyboard.press("Escape");
    await expect(
      page.locator("text=Governance & State Matrix (INV-01)"),
    ).not.toBeVisible();
  });
});
