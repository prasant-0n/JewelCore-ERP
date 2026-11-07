import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Returns, Buyback Valuation & Scrap Refining Workflow" (/returns).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 8 (POS Terminal):
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > Atelier & Refining > Returns, Buyback & Scrap Refining Workflow", Live hardware telemetry badge "Thermo Niton XL5 XRF & Hydrostatic Density Scale Active • Latency 8ms" with pulsing emerald beacon, Title "Returns, Buyback Valuation & Scrap Refining Workflow", top right buttons: "+ New Buyback Intake" and "Initiate Induction Smelt Batch" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. Today's Scrap Inward: "4,850.240 g" (Au 916 & 750 Mixed Alloys, emerald trend)
  2. Total Buyback Payout: "₹ 28,45,200" (99.8% RTGS Disbursed to Clients)
  3. Assayed Purity Yield: "92.4% Avg Au" (XRF & Hydrostatic Density Verified)
  4. Quarantined Discrepancies: "0 Batches Flagged" (Zero Chemical Contamination)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Returns & Scrap Lots Directory:
    - Search input & Filter pills: "All Lots (12)" (active gold), "Customer Old Gold", "Atelier Sweeps & Dross", "Defective Exchanges", "Smelt Ready (4)".
    - Expanded Batch Card: "Batch #BB-2026-044: Royal Kundan & Antique 22K Melt Lot (Mrs. Sunita Verma)" (Header with crucible/melt icon, 3 Items in Lot, 103.700g Gross, ₹6,37,867 Valuation, Status "XRF Assayed").
    - Inside Expanded Batch: 3-column grid of Scrap Pieces:
      - Card 1 (SELECTED): "BB-ITM-01" ("22K Traditional Antique Kada" • Gross: "64.200g" • Net Au: "58.810g" • Fineness: "91.68% Au" • Payout: "₹3,95,450.00" • Status: "ASSAY PASSED" emerald) with glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "BB-ITM-02" ("18K Diamond Cocktail Ring" • Gold Shank: "7.400g" • Stones Extracted: "1.85ct" • Fineness: "75.12% Au" • Payout: "₹40,737.00" • Status: "STONES EXTRACTED").
      - Card 3: "BB-ITM-03" ("22K Cut Bangle Links" • Gross: "32.100g" • Net Au: "29.400g" • Fineness: "91.60% Au" • Payout: "₹2,01,680.00" • Status: "ASSAY PASSED").
    - Collapsed accordion tiers for:
      - "Batch #BB-2026-045: Atelier Bench Sweeps & Filing Dust (Smelt Crucible #2 • 450.2g)"
      - "Batch #RET-2026-012: Store Customer Exchange & Resale Assessment (2 Pieces)"
      - "Batch #REF-2026-008: Acid Digestion & Chemical Refining Sludge Output"

  * Right Column (35% width) - Selected Scrap Lot Metrology & Smelt Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Lot #BB-2026-044: 22K Melt Lot" with crucible / flame icon.
    - Subtitle: "Client: Mrs. Sunita Verma • KYC & PAN Verified"
    - Status badges: "XRF Assayed" (emerald tag) and "Density Scale Locked" (gold tag).
    - Dual Metrological & Metallurgical Gauges:
      - Assayed Gold Fineness: "91.68% (Au 916.8 Standard)" with emerald progress meter
      - Melting & Dross Loss Tolerance: "0.85% (0.545 g Dross Burn)" with gold progress meter
    - Hydrostatic Density & Niton XRF Spectral Breakdown Box (clean dark card with hairline border):
      - Au (Gold): "91.68%"
      - Ag (Silver): "5.12%"
      - Cu (Copper): "2.85%"
      - Specific Gravity: "17.58 g/cm³ (High Purity Matrix)"
    - Financial Settlement & Payout Calculation:
      - Net Fine Gold Weight: "88.210 g"
      - Spot Benchmark Price: "₹ 7,340.50 / g"
      - Melting & Refining Deduction (1.5%): "- ₹ 9,715.00"
      - Total Payout Payable: "₹ 6,37,867.00"
    - Action Deck:
      - 2-column secondary action buttons: "Print Metallurgical Assay Slip" & "Convert to Store Credit"
      - Full-width Primary Gold Button: "Authorize Immediate RTGS Payout & Seal Crucible"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, 5, 6, 7, and 8.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 9...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 9 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
