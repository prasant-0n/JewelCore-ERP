import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Point of Sale (POS) Showroom Terminal & Clienteling" (/pos).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 7:
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > Commercial & Showroom > Point of Sale (POS) Terminal", Live hardware telemetry badge "Register #01 • Cash Drawer & Ingenico NFC Connected • 99.98% Sync" with pulsing emerald beacon, Title "Point of Sale (POS) Showroom Terminal & Clienteling", top right buttons: "+ Select VIP Client" and "Quick Barcode / RFID Scan" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. Today's Showroom Gross: "₹ 42,85,400" (+14.2% vs Target, emerald trend)
  2. Active Client Sessions: "3 Open Carts" (VIP Private Salon Reserved)
  3. Average Ticket Size (ATV): "₹ 3,57,110" (High Jewellery Segment)
  4. Live Bullion Lock: "24K @ ₹7,340.50 / g" (Mid-Day MCX Fix Synced)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Showroom Cart & Catalogue Matrix:
    - Search input & Filter pills: "All Pieces (42)" (active gold), "Solitaire Rings", "Bridal Necklaces", "Bangles & Kadas", "Active Cart (2)".
    - Expanded Cart Card: "Active Cart: Mrs. Radhika Singhania (HNW Tier • PAN Verified)" (Header with shopping bag icon, 2 Items In Cart, ₹23,35,000 Total, Status "Cart Secured").
    - Inside Expanded Cart: 3-column grid of Pieces:
      - Card 1 (SELECTED): "JC-SOL-2026-081" ("18K Oval Solitaire Ring 1.52ct" • Gross: "5.420g" • Net Au: "5.116g" • Price: "₹4,85,000.00" • Status: "IN CART" emerald) with glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "JC-CHK-2026-015" ("18K Rose Gold Waterfall Necklace 18.5ct" • Gross: "68.300g" • Price: "₹18,50,000.00" • Status: "IN CART" emerald).
      - Card 3: "JC-KAD-2026-005" ("18K White Gold Tennis Bangle 5.20ct" • Gross: "28.600g" • Price: "₹5,40,000.00" • Status: "SAVED FOR TRIAL" amber).
    - Collapsed accordion tiers for:
      - "Showroom Vitrine Showcase (42 Ready-for-Sale Pieces • In RFID Trays)"
      - "Old Gold Buyback / Exchange Credit Assessment (Est. ₹1,24,500)"
      - "Custom Atelier Made-to-Order Orders & Advance Deposits"

  * Right Column (35% width) - POS Terminal Billing & Vault Release Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Invoice Order #TXN-2026-9811" with credit card / invoice icon.
    - Subtitle: "Customer: Mrs. Radhika Singhania • Clienteling VIP #9021"
    - Status badges: "AML / PAN Stamped" (emerald tag) and "Mid-Day Gold Fix Locked" (gold tag).
    - Dual Metrological & Financial Gauges:
      - Total Gross Metal Weight: "73.720 g" with load cell progress meter
      - Statutory Tax & Purity Seal: "100% (BIS Hallmarked • 3% GST)" with emerald progress meter
    - Itemized Tax Invoice Breakdown Box (clean dark card with hairline border):
      - Gross Gold Metal Value: "₹ 4,82,100.00"
      - Certified Diamond Value: "₹ 16,17,900.00"
      - Handcrafting Making Charge: "₹ 2,35,000.00"
      - Less Old Gold Trade-In: "- ₹ 1,24,500.00"
      - CGST (1.5%) + SGST (1.5%): "₹ 66,315.00"
      - Net Payable Total: "₹ 22,76,815.00"
    - Payment Tender Method Selector:
      - Chips for RTGS / Wire, AMEX Luxury Card, Bullion Offset, Split Payment.
    - Action Deck:
      - 2-column secondary action buttons: "Print Proforma Invoice" & "Apply VIP Privilege Discount"
      - Full-width Primary Gold Button: "Authorize Payment & Release Vault Custody"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, 5, 6, and 7.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 8...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 8 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
