import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Inter-Branch Custody Transfers & Armored Transit" (/transfers).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 9:
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > Logistics & Fleet Custody > Inter-Branch Transfers & Armored Transit", Live hardware telemetry badge "Brinks Armored Van #MH-01-BX-9021 • GPS / Cellular Gate Locked • Latency 12ms" with pulsing emerald beacon, Title "Inter-Branch Custody Transfers & Armored Transit", top right buttons: "+ Schedule Armored Transfer" and "Dual-Sign Vault Transit Dispatch" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. Active In-Transit Shipments: "4 Dispatches" (₹ 18.42 Cr Specie Insured, emerald trend)
  2. Custody Sealed Pieces: "186 Pieces" (100% RFID Tamper-Taped & Boxed)
  3. Transit ETA Compliance: "99.4% On-Schedule" (GPS Geofenced Route Corridor)
  4. Transit Security Incidents: "0 Breach Alerts" (Armored Escort Guard Active)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Transit Manifests & Consignments Directory:
    - Search input & Filter pills: "All Dispatches (4)" (active gold), "Flagship to Delhi Safe", "Airport Bonded Transit", "Atelier Replenishment", "Delivered & Reconciled".
    - Expanded Manifest Card: "Manifest #TR-2026-0881: Mumbai Flagship to New Delhi Connaught Place Vault (Brinks Van #04)" (Header with truck/shield icon, 59 Items in Consignment, 6,391.450g Total Weight, ₹6,65,52,500 Valuation, Status "En Route (GPS Locked)").
    - Inside Expanded Manifest: 3-column grid of Consignment Cards:
      - Card 1 (SELECTED): "TR-ITM-01" ("Solitaire Rings Vault Tray #01" • 42 Pieces • Gross: "248.850g" • Valuation: "₹1,84,50,000" • Seal: "ELEC-SEAL-9912" • Status: "GEOFENCE LOCKED" emerald) with glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "TR-ITM-02" ("Royal Kundan Bridal Chokers Tray" • 12 Pieces • Gross: "1,142.600g" • Valuation: "₹1,14,00,000" • Seal: "ELEC-SEAL-9913" • Status: "EN ROUTE").
      - Card 3: "TR-ITM-03" ("24K Fine Bullion Ingot Box" • 5 Bars • Gross: "5,000.000g" • Valuation: "₹3,67,02,500" • Seal: "ELEC-SEAL-9914" • Status: "EN ROUTE").
    - Collapsed accordion tiers for:
      - "Manifest #TR-2026-0882: Surat Atelier to Mumbai Vault (Raw Diamond Casts • 68 Pieces)"
      - "Manifest #TR-2026-0883: Mumbai Vault to Bangalore Showroom (Heritage Polki Sets • 24 Pieces)"
      - "Manifest #TR-2026-0880: Airport Bonded Transit (Geneva Salon • Reconciled & Delivered)"

  * Right Column (35% width) - Selected Transit Consignment & Security Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Consignment #TR-2026-0881: Mumbai -> New Delhi" with truck / shield icon.
    - Subtitle: "Carrier: Brinks Global Secure Logistics • Van #MH-01-BX-9021"
    - Status badges: "Dual-Custody Signed" (emerald tag) and "Geofence Locked" (gold tag).
    - Dual Logistics & Security Gauges:
      - Armored Transit Progress: "68% (Distance to Delhi Vault)" with progress meter
      - Tamper Sensor Mesh Integrity: "100% (All 186 Electronic Seals Responding)" with emerald progress meter
    - Fleet & Geofence Coordinates Box (clean dark card with hairline border):
      - Vehicle Escort: "Brinks Heavy Armored B6 Level (Van #04)"
      - Active Highway Corridor: "NH-48 National Express (Geofenced ±50m corridor)"
      - Custody Transfer Officers: "Lead Escort: Capt. R. Sengupta / Receiving: D. Singhania"
      - Digital Handover Hash: "SHA-256: 9f8a42...310c89 (Digitally Encrypted)"
    - Specie Insurance & Consignment Value Box:
      - Total Consignment Gross Weight: "6,391.450 g"
      - Lloyd's Syndicate Insurance: "Policy #LL-99128 ($10M Specie Cover)"
      - Estimated Vault Delivery: "Today, 19:45 IST (In 3h 30m)"
    - Action Deck:
      - 2-column secondary action buttons: "Ping Real-Time GPS Telemetry" & "Print Transit Gate Pass"
      - Full-width Primary Gold Button: "Acknowledge Inward Vault Handover & De-Seal"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, 5, 6, 7, 8, and 9.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 10...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 10 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
