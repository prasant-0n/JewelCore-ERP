import { test, expect } from "@playwright/test";

test.describe("Cradle-to-Grave Golden Path: Full Luxury Jewellery Lifecycle", () => {
  test.setTimeout(120000); // 2 minutes for complete multi-workstation golden path journey

  test("executes end-to-end luxury jewellery lifecycle across all 9 operational workstations", async ({
    page,
  }) => {
    // =========================================================================
    // STAGE 1: INWARD PROCUREMENT & METROLOGY SCALE CALIBRATION (/procurement)
    // =========================================================================
    await page.goto("/procurement");
    await expect(page.locator("h1")).toContainText(/Inward Procurement/i);

    // 1.1 Perform Auto-Tare calibration on receiving bay scale
    const tareBtn = page.getByRole("button", { name: "Auto-Tare Scale" });
    await expect(tareBtn).toBeVisible();
    await tareBtn.click();
    await expect(
      page.getByText("Scale Calibrated", { exact: true }),
    ).toBeVisible({ timeout: 5000 });

    // 1.2 Select an ingot to inspect its physical tolerance and containment path
    const ingotCard = page.locator("text=VAL-BAR-01").first();
    await expect(ingotCard).toBeVisible();
    await ingotCard.click();

    const procurementInspector = page.getByTestId("workstation-inspector");
    await expect(
      procurementInspector.locator("text=VAL-BAR-01").first(),
    ).toBeVisible();
    await expect(
      procurementInspector.locator("text=LBMA Good Delivery Bar").first(),
    ).toBeVisible();

    // Authorize GRN intake
    const authorizeGrnBtn = procurementInspector.getByRole("button", {
      name: "Authorize GRN",
    });
    await expect(authorizeGrnBtn).toBeVisible();
    await authorizeGrnBtn.click();
    await expect(
      page.locator("text=GRN Authorization Confirmed for VAL-BAR-01").first(),
    ).toBeVisible({ timeout: 5000 });

    // 1.3 Register a new incoming LBMA Good Delivery shipment lot
    const logShipmentBtn = page.getByRole("button", {
      name: /Log Inbound Shipment/i,
    });
    await expect(logShipmentBtn).toBeVisible();
    await logShipmentBtn.click();

    // Fill Air Waybill / Tracking number in NewShipmentModal
    const waybillInput = page.getByPlaceholder("e.g. LX-94022");
    await expect(waybillInput).toBeVisible();
    await waybillInput.fill("LX-99420-LBMA");

    const submitShipmentBtn = page.getByRole("button", {
      name: "Register Inbound Lot",
    });
    await expect(submitShipmentBtn).toBeVisible();
    await submitShipmentBtn.click();

    await expect(
      page.locator("text=Shipment Logged Successfully").first(),
    ).toBeVisible({ timeout: 5000 });

    // =========================================================================
    // STAGE 2: METALLURGICAL QC ASSAY & SPECTROMETRY CLEARANCE (/qc)
    // =========================================================================
    await page.goto("/qc");
    await expect(page.locator("h1")).toContainText(/Analytical QC & Metallurgical Assay/i);

    // 2.1 Select specimen QC-ITM-01 for spectrometer analysis
    const qcFixture = page.locator("text=QC-ITM-01").first();
    await expect(qcFixture).toBeVisible();
    await qcFixture.click();

    const qcInspector = page.getByTestId("workstation-inspector");
    await expect(qcInspector.locator("text=QC-ITM-01").first()).toBeVisible();
    await expect(
      qcInspector.locator("text=ISO/IEC 17025 Calibrated").first(),
    ).toBeVisible();

    // 2.2 Trigger XRF Niton XL5 Plus Spectrum Recalibration
    const retestBtn = qcInspector.getByRole("button", {
      name: "Retest Spectrum",
    });
    await expect(retestBtn).toBeVisible();
    await retestBtn.click();

    await expect(
      page.locator("text=XRF Spectrum Recalibrated for QC-ITM-01").first(),
    ).toBeVisible({ timeout: 5000 });

    // 2.3 Sign cryptographic assay and approve hallmark clearance
    const approveHallmarkBtn = qcInspector.getByRole("button", {
      name: "Approve Hallmark",
    });
    await expect(approveHallmarkBtn).toBeVisible();
    await approveHallmarkBtn.click();

    await expect(
      page.locator("text=Hallmark Clearance Approved for QC-ITM-01").first(),
    ).toBeVisible({ timeout: 5000 });

    // =========================================================================
    // STAGE 3: INVENTORY MASTER GENESIS & PEDIGREE LINEAGE (/inventory)
    // =========================================================================
    await page.goto("/inventory");
    await expect(page.locator("h1")).toContainText(/Serialized Inventory & Provenance Directory/i);

    // 3.1 Verify existing vaulted item lineage
    const inventoryInspector = page.getByTestId("workstation-inspector");
    await expect(
      inventoryInspector.locator("text=GIA-2210894511").first(),
    ).toBeVisible();

    // 3.2 Birth a new luxury jewellery asset into the serialized ledger
    const birthBtn = page.getByRole("button", {
      name: "Birth Serialized Piece",
    });
    await expect(birthBtn).toBeVisible();
    await birthBtn.click();

    // Verify modal title
    await expect(
      page.getByRole("heading", { name: "Birth Serialized Inventory Piece" }),
    ).toBeVisible();

    // Submit genesis birth
    const mintBtn = page.getByRole("button", {
      name: "Birth Asset & Mint Lineage",
    });
    await expect(mintBtn).toBeVisible();
    await mintBtn.click();

    await expect(
      page.locator("text=Piece Birthed Successfully").first(),
    ).toBeVisible({ timeout: 5000 });

    // =========================================================================
    // STAGE 4: RFID SMART KIOSK & ZEBRA ZPL PRINT COMMISSIONING (/rfid)
    // =========================================================================
    await page.goto("/rfid");
    await expect(page.locator("h1")).toContainText(/Real-Time RFID Showroom & Bulk Vault Scan/i);

    // 4.1 Execute 360° Impinj Speedway Antenna sweep
    const sweepBtn = page.getByRole("button", { name: "360° Antenna Sweep" });
    await expect(sweepBtn).toBeVisible();
    await sweepBtn.click();

    await expect(
      page.locator("text=360° Antenna Sweep Completed").first(),
    ).toBeVisible({ timeout: 5000 });

    // 4.2 Inspect metrology and preview Zebra ZPL dumbbell jewellery label
    const reprintBtn = page.getByRole("button", { name: "Reprint Tag" });
    await expect(reprintBtn).toBeVisible();
    await reprintBtn.click();

    const zplModalTitle = page.getByRole("heading", {
      name: "Zebra ZPL II Jewellery Tag Preview",
    });
    await expect(zplModalTitle).toBeVisible();
    await expect(page.locator("text=Physical Tag Layout Preview")).toBeVisible();
    await expect(
      page.locator("text=ZPL II Thermal Stream Output:"),
    ).toBeVisible();

    // Close ZPL preview modal
    await page.keyboard.press("Escape");
    await expect(zplModalTitle).not.toBeVisible();

    // 4.3 Cryptographically seal vault tray audit
    const sealBtn = page.getByRole("button", { name: "Seal Audit" });
    await expect(sealBtn).toBeVisible();
    await sealBtn.click();
    await expect(page.locator("text=Tray Audit Sealed").first()).toBeVisible({
      timeout: 5000,
    });

    // =========================================================================
    // STAGE 5: BULLION SPOT RATE FIXING & DYNAMIC PRICING ENGINE (/pricing)
    // =========================================================================
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText(/Bullion Fixing, Dynamic Making Charges/i);

    // 5.1 Select Au 916 Standard Gold (22K) alloy card
    const gold22kCard = page
      .locator("text=Au 916 Standard Gold (22K)")
      .first();
    await expect(gold22kCard).toBeVisible();
    await gold22kCard.click();

    // 5.2 Lock spot rate for selected alloy
    const pricingInspector = page.getByTestId("workstation-inspector");
    const broadcastAlloyBtn = pricingInspector.getByRole("button", {
      name: "Broadcast Spot",
    });
    await expect(broadcastAlloyBtn).toBeVisible();
    await broadcastAlloyBtn.click();

    await expect(
      page
        .locator("text=Spot Rate Locked for Au 916 Standard Gold (22K)")
        .first(),
    ).toBeVisible({ timeout: 5000 });

    // 5.3 Publish global multi-terminal spot rate fix
    const broadcastFixBtn = page.getByRole("button", {
      name: "Broadcast Spot Fix",
    });
    await expect(broadcastFixBtn).toBeVisible();
    await broadcastFixBtn.click();

    const lockRatesBtn = page.getByRole("button", {
      name: /Broadcast & Lock Rates/i,
    });
    await expect(lockRatesBtn).toBeVisible();
    await lockRatesBtn.click();

    await expect(
      page.locator("text=Bullion Spot Rate Fixing Published").first(),
    ).toBeVisible({ timeout: 5000 });

    // =========================================================================
    // STAGE 6: GOVERNANCE QUORUM & SMARTCARD DUAL-CONTROL SIGNING (/governance)
    // =========================================================================
    await page.goto("/governance");
    await expect(page.locator("h1")).toContainText(/Multi-Signatory Quorum & Cryptographic Merkle/i);

    // 6.1 View cryptographic Merkle leaf hash chain
    const merkleToggleBtn = page.getByRole("button", {
      name: /View Merkle Leaf/i,
    });
    await expect(merkleToggleBtn).toBeVisible();
    await merkleToggleBtn.click();
    await expect(
      page.locator("text=Merkle Audit Leaf Cryptographic Chain:"),
    ).toBeVisible();

    // 6.2 Dual-sign pending release gate with SmartCard Key 2
    const dualSignBtn = page.getByRole("button", {
      name: /Insert SmartCard & Dual-Sign Release/i,
    });
    await expect(dualSignBtn).toBeVisible();
    await dualSignBtn.click();

    await expect(
      page.locator("text=Cryptographic SmartCard Accepted").first(),
    ).toBeVisible({ timeout: 5000 });

    // 6.3 Open Compliance Audit Stream and cryptographically verify Merkle ledger
    const auditStreamBtn = page.getByRole("button", {
      name: "Audit Event Stream",
    });
    await expect(auditStreamBtn).toBeVisible();
    await auditStreamBtn.click();

    const verifyMerkleBtn = page.getByRole("button", {
      name: "Verify Merkle Ledger",
    });
    await expect(verifyMerkleBtn).toBeVisible();
    await verifyMerkleBtn.click();

    await expect(
      page.locator("text=Audit Trail Cryptographically Verified").first(),
    ).toBeVisible({ timeout: 5000 });

    // Close audit stream modal
    await page.getByRole("button", { name: "Close" }).first().click();

    // =========================================================================
    // STAGE 7: POS SHOWROOM BILLING, CLIENT KYC & INVOICE CERTIFICATION (/pos)
    // =========================================================================
    await page.goto("/pos");
    await expect(page.locator("h1")).toContainText(/Point of Sale \(POS\) Showroom Terminal/i);

    // 7.1 Gravimetrically tare & weigh salon tray on POS scale
    const weighCartBtn = page.getByRole("button", {
      name: "Weigh Cart on Scale",
    });
    await expect(weighCartBtn).toBeVisible();
    await weighCartBtn.click();

    await expect(
      page.locator("text=Scale Gravimetric Sweep Completed"),
    ).toBeVisible({ timeout: 5000 });

    // 7.2 Private Client KYC: Switch context to VIP client
    const selectClientBtn = page.getByRole("button", {
      name: /Select Client/i,
    });
    await expect(selectClientBtn).toBeVisible();
    await selectClientBtn.click();

    const birlaCard = page.locator("text=Mr. Vikramaditya Birla").first();
    await expect(birlaCard).toBeVisible();
    await birlaCard.click();

    // Verify Billing Inspector reflects VIP client
    const posInspector = page.getByTestId("workstation-inspector");
    await expect(
      posInspector.locator("text=Mr. Vikramaditya Birla").first(),
    ).toBeVisible();

    // 7.3 Authorize sale and render official Tax Invoice & Certificate
    const authorizeSaleBtn = page.getByRole("button", {
      name: "Authorize Sale",
    });
    await expect(authorizeSaleBtn).toBeVisible();
    await authorizeSaleBtn.click();

    // Verify Official JewelCore Atelier branding in modal
    await expect(
      page.locator("text=Tax Invoice & Authenticity Certificate").first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=JEWELCORE LUXURY ATELIER").first(),
    ).toBeVisible();
    await expect(
      page.locator('svg[aria-label="JewelCore Atelier Logo Mark"]').first(),
    ).toBeVisible();

    // Preview ESC/POS 80mm thermal receipt
    const thermalTab = page.getByRole("button", {
      name: /ESC\/POS Thermal Receipt/i,
    });
    await expect(thermalTab).toBeVisible();
    await thermalTab.click();
    await expect(page.locator("pre").first()).toContainText(
      "JEWELCORE LUXURY ATELIER",
    );

    // Close invoice modal
    const closeInvoiceBtn = page.getByRole("button", { name: "Close Window" });
    await expect(closeInvoiceBtn).toBeVisible();
    await closeInvoiceBtn.click();

    // =========================================================================
    // STAGE 8: RETURNS, SCRAP BUYBACK & REFINERY PAYOUT (/returns)
    // =========================================================================
    await page.goto("/returns");
    await expect(page.locator("h1")).toContainText(/Returns, Buyback Valuation & Scrap Refining/i);

    // 8.1 Log Old Gold Buyback intake from client
    const logBuybackBtn = page.getByRole("button", {
      name: /Log Old Gold Buyback/i,
    });
    await expect(logBuybackBtn).toBeVisible();
    await logBuybackBtn.click();

    // Submit buyback modal
    const voucherBtn = page.getByRole("button", {
      name: "Issue Exchange Voucher",
    });
    await expect(voucherBtn).toBeVisible();
    await voucherBtn.click();

    await expect(
      page.locator("text=Old Gold Buyback Recorded").first(),
    ).toBeVisible({ timeout: 5000 });

    // 8.2 Disburse buyback payout from SmeltInspector
    const payoutBtn = page.getByRole("button", { name: "Disburse Payout" });
    await expect(payoutBtn).toBeVisible();
    await payoutBtn.click();

    await expect(page.locator("text=Buyback Payout").first()).toBeVisible({
      timeout: 5000,
    });

    // =========================================================================
    // STAGE 9: ARMORED TRANSIT LOGISTICS & DUAL-CUSTODY DE-SEAL (/transfers)
    // =========================================================================
    await page.goto("/transfers");
    await expect(page.locator("h1")).toContainText(/Armored Fleet Tracking & Dual-Custody Manifests/i);

    // 9.1 Schedule Armored Consignment
    const scheduleTransferBtn = page.getByRole("button", {
      name: /Schedule Transfer/i,
    });
    await expect(scheduleTransferBtn).toBeVisible();
    await scheduleTransferBtn.click();

    const dispatchTransitBtn = page.getByRole("button", {
      name: "Schedule Armored Dispatch",
    });
    await expect(dispatchTransitBtn).toBeVisible();
    await dispatchTransitBtn.click();

    await expect(
      page.locator("text=Armored Transfer Scheduled").first(),
    ).toBeVisible({ timeout: 5000 });

    // 9.2 Dual-sign transit dispatch
    const dualSignDispatchBtn = page.getByRole("button", {
      name: /Dual-Sign Transit Dispatch/i,
    });
    await expect(dualSignDispatchBtn).toBeVisible();
    await dualSignDispatchBtn.click();

    await expect(
      page.locator("text=Dispatch Dual-Signed & Authorized").first(),
    ).toBeVisible({ timeout: 5000 });

    // 9.3 Acknowledge Inward Vault Handover & De-Seal
    const deSealBtn = page.getByRole("button", {
      name: /Acknowledge Inward Vault Handover & De-Seal/i,
    });
    await expect(deSealBtn).toBeVisible();
    await deSealBtn.click();

    await expect(
      page.locator("text=De-Seal Verified & Handover Accepted").first(),
    ).toBeVisible({ timeout: 5000 });

    // =========================================================================
    // STAGE 10: EXECUTIVE CONTROL TOWER & MULTI-STORE CONTEXT RECONCILIATION (/)
    // =========================================================================
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Executive Control Tower/i);

    // 10.1 Verify Live Bullion Ticker and synchronize all vault scales
    await expect(
      page.locator("text=Live Bullion Fixing (IBJA)").first(),
    ).toBeVisible();
    const syncAllBtn = page.getByRole("button", {
      name: /Sync All Vault Scales/i,
    });
    await expect(syncAllBtn).toBeVisible();
    await syncAllBtn.click();

    await expect(
      page.locator("text=Synchronizing Vault Scales").first(),
    ).toBeVisible({ timeout: 5000 });

    // 10.2 Switch multi-tenant branch context to Central Treasury Vault Hub (VAULT-01)
    const storeBtn = page.locator('button[title*="Switch Active Store"]');
    await expect(storeBtn).toBeVisible();
    await storeBtn.click();

    const vaultHubOption = page
      .locator("text=Central Treasury Vault Hub")
      .first();
    await expect(vaultHubOption).toBeVisible();
    await vaultHubOption.click();

    // Verify header badge reflects VAULT-01
    await expect(storeBtn.locator("text=VAULT-01")).toBeVisible();
    await expect(
      page.locator("text=Active Branch: Central Treasury Vault Hub"),
    ).toBeVisible();

    // Re-switch back to Flagship Mumbai (INV-11)
    await storeBtn.click();
    const flagshipOption = page.locator("text=Downtown Showroom").first();
    await expect(flagshipOption).toBeVisible();
    await flagshipOption.click();

    await expect(storeBtn.locator("text=INV-11")).toBeVisible();
    await expect(
      page.locator("text=Active Branch: Downtown Showroom"),
    ).toBeVisible();
  });
});
