import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";
import fs from "node:fs/promises";
import path from "node:path";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Real-Time UHF RFID Showroom & Bulk Vault Scan Kiosk" (/rfid).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 3:
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > RFID Telemetry & Mesh > Kiosk Rapid Scan", Live hardware telemetry badge "Impinj Speedway R420 UHF • 4-Antenna Matrix Active • 99.98% Sync" with pulsing emerald beacon, Title "Real-Time RFID Showroom & Bulk Vault Scan Kiosk", top right buttons: "+ Manual Tag Intake" and "Trigger 360° Antenna Sweep" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. RFID Tags Detected: "84 / 85 Detected" (98.8% Match Rate, Emerald)
  2. Discrepancy / Flagged: "1 Piece Flagged" (Amber/Rose alert badge)
  3. Load Cell Total Weight: "1,248.500 g" (Mettler Toledo ±0.001g synced)
  4. Antenna RSSI Signal: "-42 dBm Avg" (Zero cross-talk isolation)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Scan Trays Directory (matching Screen 2 & 3 hierarchy):
    - Search input & Filter pills: "All Tags" (active gold), "Discrepancies / Missing", "Showroom Tray #01", "Vault Drawer #04".
    - Expanded Tray Card: "Tray #01: High-Jewellery Solitaire Rings (Showroom Display Counter A)" (Header with radio signal icon, 42 Expected, 41 Verified, 1 Missing, Status "Live Mesh Synced").
    - Inside Expanded Tray: 3-column grid of RFID Piece Cards:
      - Card 1 (SELECTED): "EPC-E280-1160-9941" ("JWL-2026-081" • 18K Oval Solitaire Ring 1.52ct • 5.420g • Net Au: 5.116g • Status: "VERIFIED IN TRAY" emerald • Signal: "-42 dBm") with a glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "EPC-E280-1160-9942" ("JWL-2026-082" • 18K Cushion Halo Ring 2.01ct • 6.840g • Net Au: 6.438g • Status: "VERIFIED IN TRAY" emerald • Signal: "-39 dBm").
      - Card 3: "EPC-E280-1160-9943" ("JWL-2026-083" • Platinum 950 Emerald-Cut Solitaire • 8.120g • Status: "MISSING FROM TRAY" rose alert • Signal: "Not Responding").
    - Collapsed accordion tiers for:
      - "Tray #02: Kundan & Polki Bridal Necklaces (Showroom Counter B)" (12 Units Expected, 12 Detected, 100% Match)
      - "Tray #03: Royal Calcutta Filigree Bangles (Main Vault Tray 04)" (16 Units Expected, 16 Detected, 100% Match)
      - "Tray #04: Minted Bullion & Ingot Assay Rack" (15 Units Expected, 15 Detected, 100% Match)

  * Right Column (35% width) - Selected RFID Tag Metrology & Custody Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Tag EPC-E280-1160-9941" with radio wave icon.
    - Subtitle: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)"
    - Status badges: "Verified Present in Tray" (emerald tag) and "Antenna #2 Locked" (gold tag).
    - Dual Metrological & Radio Frequency Gauges:
      - Signal RSSI Quality: "96% (-42 dBm)" with progress meter
      - Load Cell Weight Calibration: "99.9% (5.420 g / 5.420 g Target)" with emerald progress meter
    - Real-Time RF Telemetry Box:
      - Antenna Port: "Antenna Port #2 (Near-Field Array)"
      - Read Count: "142 Reads / sec"
      - Frequency Channel: "866.500 MHz (ETSI Band)"
      - Phase Angle: "142.8°"
    - Custody & Expected Coordinates:
      - Expected Location: "Showroom Counter A, Tray 01, Slot 01"
      - Last Custody Audit: "Today, 15:20:11 (Automated Scan)"
      - Custodian in Charge: "M. Nair (Badge #CS-401)"
    - Action Deck:
      - 2-column secondary action buttons: "Force Antenna Re-sweep" & "Reprint RFID EPC Label"
      - Full-width Primary Gold Button: "Verify & Seal Tray Audit Record"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, and 5.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 6...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 6 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
