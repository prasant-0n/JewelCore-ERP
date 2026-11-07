import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Dual-Custody Audit & Governance Approval Center" (/governance).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 10 (Transfers):
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > Security & Compliance > Dual-Custody Audit & Governance Approval Center", Live hardware telemetry badge "HSM Cryptographic Key Card & Dual Biometric Scanner Synced • Zero Failures" with pulsing emerald beacon, Title "Dual-Custody Audit & Governance Approval Center", top right buttons: "+ Emergency Override Request" and "Dual-Sign & Release Pending Approvals" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. Pending Dual-Sign Approvals: "5 Requests" (High-Security Custody Holds, amber trend)
  2. Cryptographic Audit Ledger: "100% Verified" (SHA-256 Merkle Root Chained)
  3. Vault Compliance Score: "99.98% Pass" (ISO 9001 & BIS Hallmarked)
  4. Security Discrepancies: "0 Open Flags" (Real-Time Reconciled & Audited)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Governance Action Ledger & Approvals Directory:
    - Search input & Filter pills: "All Requests (5)" (active gold), "Vault Access", "High-Value POS", "Refining Smelt", "Armored Transit".
    - Expanded Request Card: "Request #GOV-2026-091: High-Security Safe 01 Bullion Withdrawal (₹ 3,67,02,500)" (Header with shield/key icon, 5 Items, Key 1 Signed, Key 2 Pending, Status "Awaiting 2nd Key").
    - Inside Expanded Request: 3-column grid of Governance Item Cards:
      - Card 1 (SELECTED): "GOV-REQ-01" ("5x 1Kg 24K Minted Bullion Withdrawal" • Gross: "5,000.000g" • Value: "₹3,67,02,500" • Key 1: "M. Nair" • Key 2: "Pending S. Joshi" • Status: "AWAITING SECOND KEY" amber) with glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "GOV-REQ-02" ("VIP High-Value POS Release (Order #TXN-9811)" • Gross: "73.720g" • Value: "₹23,35,000" • Key 1: "Store Lead" • Key 2: "Pending Controller" • Status: "AWAITING SECOND KEY").
      - Card 3: "GOV-REQ-03" ("Induction Smelt Crucible #BB-044 Release" • Gross: "103.700g" • Value: "₹6,37,867" • Key 1: "Assay Chemist" • Key 2: "Pending Manager" • Status: "AWAITING SECOND KEY").
    - Collapsed accordion tiers for:
      - "Cryptographic Audit Ledger Archive (Past 24 Hours • 48 Events Verified)"
      - "Automated Merkle Tree Proof Records (Block #89,120 • Zero Tamper)"
      - "Regulatory Compliance & Hallmarking Certifications (BIS & PMLA)"

  * Right Column (35% width) - Selected Governance Approval & Dual-Key Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Approval Request #GOV-REQ-01" with shield / key icon.
    - Subtitle: "Action: Bullion Vault Safe 01 Withdrawal • Threshold ₹1 Cr"
    - Status badges: "Dual-Key Protocol Armed" (gold tag) and "Merkle Chained" (emerald tag).
    - Dual Governance & Cryptographic Gauges:
      - Dual-Key Quorum Progress: "50% (Key 1/2 Signed • Awaiting Key 2)" with amber/gold progress meter
      - Merkle Proof Cryptographic Validity: "100% (Valid Mathematical Chain)" with emerald progress meter
    - Keyholders & Biometric Signatures Box (clean dark card with hairline border):
      - Keyholder 1 (Initiator): "M. Nair (Head Custodian #CS-401) • Biometric Signed at 15:40:12"
      - Keyholder 2 (Required): "S. Joshi (Chief Compliance Officer #CCO-102) • Awaiting SmartCard PIN"
      - Vault Target Safe: "Main Safe 01 • Compartment Ingot-Rack A"
      - Digital Handover Hash: "SHA-256: 7d1a98...44b201 (Signed Hardware Key)"
    - Statutory Audit & PMLA Verification Box:
      - Transaction Value: "₹ 3,67,02,500 (Exceeds Mandatory Dual-Key Rule)"
      - AML / Statutory Status: "100% Clean • Board Resolution Pre-Cleared"
      - Lockout Expiry: "Auto-expires in 14m 28s if unsigned"
    - Action Deck:
      - 2-column secondary action buttons: "Reject Request & Lock Safe" & "View Merkle Audit Trail"
      - Full-width Primary Gold Button: "Insert SmartCard & Dual-Sign Release (Key 2)"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, 5, 6, 7, 8, 9, and 10.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 11...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 11 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
