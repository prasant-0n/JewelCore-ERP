import { generateScreen, downloadFile, ACTIVE_PROJECT_ID } from "./stitchClient.mjs";

const prompt = `Design an ultra-clean, minimalist, enterprise-grade dark-mode UI for luxury jewellery ERP JewelCore: "Bullion Fixing, Dynamic Making Charges & Margin Rules" (/pricing).

EXACT DESIGN PATTERN REQUIREMENT: Must strictly follow the layout pattern, visual hierarchy, and component grammar of Screen 2 (Storage & Vault Visualizer) and Screen 5:
- Theme: Deep Obsidian (#0B0F17) background, hairline slate structural borders (#1F293D), warm brushed gold accents (#D4AF37), and emerald indicators (#10B981). High contrast, generous whitespace, crystal-clear typography, JetBrains Mono tabular figures.
- Top Header: Breadcrumbs "Flagship Mumbai (INV-11) > Commercial & Treasury > Bullion Fixing & Dynamic Pricing Engine", Live market telemetry badge "MCX Gold Spot ₹7,340.50/g • Reuters IBJA Feed Live • Latency 14ms" with pulsing emerald beacon, Title "Bullion Fixing, Dynamic Making Charges & Margin Rules", top right buttons: "+ Add Purity / Margin Tier" and "Broadcast Spot Fix to POS Terminals" (primary warm gold).
- Summary Metrics Bar (4 spaced cards matching Screen 2):
  1. MCX 24K Gold Spot: "₹ 7,340.50 / g" (+0.64% Today, emerald trend)
  2. 22K Benchmark (Au 916): "₹ 6,723.90 / g" (Base Jeweller Standard)
  3. Active Margin Rules: "18 Active Tiers" (Atelier & Retail Synced)
  4. Treasury Hedging Cover: "98.4% Hedged" (MCX Gold Mini Contracts)

- 2-Column Main Workspace (65% Left / 35% Right):
  * Left Column (65% width) - Interactive Pricing & Margin Rules Directory:
    - Search input & Filter pills: "All Rules (18)" (active gold), "Gold Alloys", "Making Charges", "Diamond Carat Index", "Festival Promos".
    - Expanded Tier Card: "Gold Alloy Fixing Matrix (Live Market Pegged)" (Header with gold bar icon, 3 Active Karat Tiers, Status "Live Peg Active").
    - Inside Expanded Tier: 3-column grid of Alloy Pricing Cards:
      - Card 1 (SELECTED): "Au 999.9 Fine Gold (24K)" ("Spot Fix: ₹7,340.50/g" • Making: "₹0/g (0%)" • Wastage: "0.20%" • Status: "LIVE FIX LOCKED" emerald) with glowing gold hairline border and "SELECTED" badge in upper right corner.
      - Card 2: "Au 916 Standard Gold (22K)" ("Spot Fix: ₹6,723.90/g" • Making: "12.5% Base" • Wastage: "1.50%" • Retail Rate: "₹7,564.38/g" • Status: "ACTIVE").
      - Card 3: "Au 750 Artisan Gold (18K)" ("Spot Fix: ₹5,505.38/g" • Making: "18.0% Premium" • Wastage: "2.00%" • Retail Rate: "₹6,496.35/g" • Status: "ACTIVE").
    - Collapsed accordion tiers for:
      - "Dynamic Making Charges Matrix (Kundan, Filigree, Cast Rings)" (8 Rules Configured, 100% Synced)
      - "Diamond Rapaport & Cut Surcharge Matrix" (GIA / IGI Parity Feed Active)
      - "Treasury FX & Hedging Multipliers" (USD/INR 84.12 • MCX Cover 98.4%)

  * Right Column (35% width) - Selected Alloy & Margin Rule Inspector (matching Screen 2 CompartmentInspector):
    - Title: "Rule: Au 999.9 Fine Gold (24K)" with gold scales / chart icon.
    - Subtitle: "Primary Bullion Benchmark • 99.99% Fineness Standard"
    - Status badges: "Live MCX Peg" (emerald tag) and "Treasury Locked" (gold tag).
    - Dual Metrological & Financial Gauges:
      - Market Volatility Index: "14.2% (Low Spread Band)" with progress meter
      - Gross Margin Protection: "99.2% (Hedging Parity)" with emerald progress meter
    - Real-Time Price Component Formula Box:
      - Base Metal Rate: "₹ 7,340.50 / g"
      - Making Surcharge: "₹ 0.00 / g (0%)"
      - Atelier Wastage Tolerance: "0.25% (₹ 18.35 / g)"
      - Net Consumer Billing Rate: "₹ 7,358.85 / g (+3% GST)"
    - Terminal Sync & Distribution:
      - Target Workstations: "All 12 Flagship Showroom POS Terminals"
      - Auto-Refresh Interval: "Every 60 seconds (Live MCX WebSocket)"
      - Authorized Custodian: "Chief Treasury Officer (CTO-912)"
    - Action Deck:
      - 2-column secondary action buttons: "Simulate Price Impact" & "Edit Margin Formula"
      - Full-width Primary Gold Button: "Authorize & Lock Mid-Day Bullion Fix"

Ensure absolute visual calm, clean cards, generous whitespace, zero clutter, exactly matching Screen 2, 3, 4, 5, and 6.`;

async function main() {
  console.log("Submitting prompt to Google Stitch for Screen 7...");
  const res = await generateScreen(prompt, { projectId: ACTIVE_PROJECT_ID, deviceType: "DESKTOP" });
  console.log("Screen 7 response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
