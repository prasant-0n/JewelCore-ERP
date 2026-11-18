import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const appDir = path.resolve(__dirname, "../src/app");

fs.mkdirSync(publicDir, { recursive: true });

// 1. Scalable App Icon / Favicon SVG (Obsidian & 24K Gold Facets)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <!-- Rich 24K Bullion Metallic Gradient -->
    <linearGradient id="goldLuster" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="25%" stop-color="#FDF3B8"/>
      <stop offset="50%" stop-color="#C59B27"/>
      <stop offset="75%" stop-color="#FAE893"/>
      <stop offset="100%" stop-color="#9A741E"/>
    </linearGradient>

    <!-- Deep Satin Gold for Facet Shading -->
    <linearGradient id="goldShade" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6B4F12"/>
      <stop offset="45%" stop-color="#9A7422"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>

    <!-- Luminous Highlights -->
    <linearGradient id="goldHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFFFF5" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.7"/>
    </linearGradient>

    <!-- Platinum Core Accent -->
    <linearGradient id="platAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <!-- Dark Luxury Obsidian Gradient for Icon Base -->
    <linearGradient id="obsidianBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181A1D"/>
      <stop offset="50%" stop-color="#0E0F12"/>
      <stop offset="100%" stop-color="#070809"/>
    </linearGradient>

    <!-- Subtle Radial Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="48%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.22"/>
      <stop offset="65%" stop-color="#9A7422" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Filter for subtle drop shadow on facets -->
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Obsidian Rounded App Icon Container -->
  <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#obsidianBg)" stroke="url(#goldLuster)" stroke-width="1.75" stroke-opacity="0.45"/>
  <rect x="5.5" y="5.5" width="117" height="117" rx="26.5" fill="none" stroke="#FFFFFF" stroke-width="0.75" stroke-opacity="0.06"/>
  <circle cx="64" cy="64" r="48" fill="url(#centerGlow)"/>

  <!-- Master Diamond & Vault Core Emblem -->
  <g id="gemCore">
    <!-- Outer Facet 1: Crown Table (Top Trapezoid) -->
    <polygon points="44,26 84,26 74,42 54,42" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Outer Facet 2: Crown Left Corner (Star Kite) -->
    <polygon points="44,26 54,42 22,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Outer Facet 3: Crown Right Corner (Star Kite) -->
    <polygon points="84,26 106,50 74,42" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Crown Center Triangle (Upper Table Facet) -->
    <polygon points="54,42 74,42 64,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Crown Girdle Triangles -->
    <polygon points="22,50 54,42 42,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="42,52 54,42 64,52" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,52 74,42 86,52" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="86,52 74,42 106,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Pavilion Upper Flanks -->
    <polygon points="22,50 42,52 32,70" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="106,50 96,70 86,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- The Isometric Core (The "JewelCore" Heart Monogram) -->
    <!-- Top Rhombus Face -->
    <polygon points="64,54 80,64 64,74 48,64" fill="url(#platAccent)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Left Vault Cube Flank ("J" facet) -->
    <polygon points="48,64 64,74 64,94 48,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Right Vault Cube Flank ("C" facet) -->
    <polygon points="64,74 80,64 80,84 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Outer Lower Pavilion Triangles (Connecting Girdle to Culet 64,106) -->
    <polygon points="22,50 32,70 64,106" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="32,70 48,84 64,106" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="48,84 64,94 64,106" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="106,50 64,106 96,70" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="96,70 64,106 80,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="80,84 64,106 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <!-- Diamond Pavilion Culet Core Glow Dot -->
    <circle cx="64" cy="74" r="2.4" fill="#FFFFFF" filter="url(#subtleGlow)"/>

    <!-- Signature Luxury 4-Point Star Glint at Top Right Crown -->
    <g transform="translate(86, 22)">
      <path d="M0,-8.5 Q0,0 8.5,0 Q0,0 0,8.5 Q0,0 -8.5,0 Q0,0 0,-8.5 Z" fill="url(#goldHighlight)"/>
      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF"/>
    </g>
  </g>
</svg>`;

// 2. Transparent Standalone Mark SVG (for inline embeds, header, modals)
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="16 16 96 96" width="100%" height="100%">
  <defs>
    <linearGradient id="goldLuster" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="25%" stop-color="#FDF3B8"/>
      <stop offset="50%" stop-color="#C59B27"/>
      <stop offset="75%" stop-color="#FAE893"/>
      <stop offset="100%" stop-color="#9A741E"/>
    </linearGradient>

    <linearGradient id="goldShade" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6B4F12"/>
      <stop offset="45%" stop-color="#9A7422"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>

    <linearGradient id="goldHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFFFF5" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.7"/>
    </linearGradient>

    <linearGradient id="platAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <g id="gemCore">
    <polygon points="44,26 84,26 74,42 54,42" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="44,26 54,42 22,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="84,26 106,50 74,42" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="54,42 74,42 64,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="22,50 54,42 42,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="42,52 54,42 64,52" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,52 74,42 86,52" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="86,52 74,42 106,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="22,50 42,52 32,70" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="106,50 96,70 86,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="64,54 80,64 64,74 48,64" fill="url(#platAccent)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="48,64 64,74 64,94 48,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,74 80,64 80,84 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="22,50 32,70 64,106" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="32,70 48,84 64,106" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="48,84 64,94 64,106" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <polygon points="106,50 64,106 96,70" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="96,70 64,106 80,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="80,84 64,106 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>

    <circle cx="64" cy="74" r="2.4" fill="#FFFFFF" filter="url(#subtleGlow)"/>

    <g transform="translate(86, 22)">
      <path d="M0,-8.5 Q0,0 8.5,0 Q0,0 0,8.5 Q0,0 -8.5,0 Q0,0 0,-8.5 Z" fill="url(#goldHighlight)"/>
      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF"/>
    </g>
  </g>
</svg>`;

// 3. Full Brand Logo with Luxury Atelier Typography SVG
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 96" width="100%" height="100%">
  <defs>
    <linearGradient id="goldLuster" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="25%" stop-color="#FDF3B8"/>
      <stop offset="50%" stop-color="#C59B27"/>
      <stop offset="75%" stop-color="#FAE893"/>
      <stop offset="100%" stop-color="#9A741E"/>
    </linearGradient>

    <linearGradient id="goldShade" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6B4F12"/>
      <stop offset="45%" stop-color="#9A7422"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>

    <linearGradient id="goldHighlight" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFFFF5" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.7"/>
    </linearGradient>

    <linearGradient id="platAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <linearGradient id="textGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F5E08C"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#AA820A"/>
    </linearGradient>

    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Left Emblem (Scales to 80x80 within 96 height) -->
  <g transform="translate(6, 4) scale(0.85)">
    <polygon points="44,26 84,26 74,42 54,42" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="44,26 54,42 22,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="84,26 106,50 74,42" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="54,42 74,42 64,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="22,50 54,42 42,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="42,52 54,42 64,52" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,52 74,42 86,52" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="86,52 74,42 106,50" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="22,50 42,52 32,70" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="106,50 96,70 86,52" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,54 80,64 64,74 48,64" fill="url(#platAccent)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="48,64 64,74 64,94 48,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="64,74 80,64 80,84 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="22,50 32,70 64,106" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="32,70 48,84 64,106" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="48,84 64,94 64,106" fill="url(#goldHighlight)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="106,50 64,106 96,70" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round" opacity="0.9"/>
    <polygon points="96,70 64,106 80,84" fill="url(#goldShade)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <polygon points="80,84 64,106 64,94" fill="url(#goldLuster)" stroke="#8C6615" stroke-width="0.75" stroke-linejoin="round"/>
    <circle cx="64" cy="74" r="2.4" fill="#FFFFFF" filter="url(#subtleGlow)"/>
    <g transform="translate(86, 22)">
      <path d="M0,-8.5 Q0,0 8.5,0 Q0,0 0,8.5 Q0,0 -8.5,0 Q0,0 0,-8.5 Z" fill="url(#goldHighlight)"/>
      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF"/>
    </g>
  </g>

  <!-- Vertical Luxury Divider Line -->
  <line x1="112" y1="24" x2="112" y2="72" stroke="url(#goldLuster)" stroke-width="1.2" stroke-opacity="0.35"/>

  <!-- Right Typography: JEWELCORE ATELIER ERP -->
  <text x="128" y="48" font-family="'Cinzel', 'Playfair Display', 'Cinzel Decorative', 'Trajan Pro', Georgia, serif" font-size="28" font-weight="700" letter-spacing="4.5" fill="url(#textGold)">JEWELCORE</text>
  <text x="130" y="66" font-family="'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace" font-size="9.5" font-weight="600" letter-spacing="4.8" fill="#A1A1AA" opacity="0.9">ATELIER LUXURY ERP</text>

  <!-- Small Precision Gold Dot between words -->
  <circle cx="218" cy="63" r="1.5" fill="#D4AF37"/>
</svg>`;

// Write the SVG files to public directory
fs.writeFileSync(path.join(publicDir, "icon.svg"), iconSvg);
fs.writeFileSync(path.join(publicDir, "logo-mark.svg"), markSvg);
fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvg);

console.log("SVG brand assets written successfully.");

// Rasterize using Playwright Chromium to PNGs and convert to ICO with PIL
async function rasterize() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load the icon SVG directly in page
  await page.setContent(`<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;">
  ${iconSvg}
</body>
</html>`);

  const sizes = [
    { name: "icon-16.png", size: 16 },
    { name: "icon-32.png", size: 32 },
    { name: "icon-48.png", size: 48 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
  ];

  for (const { name, size } of sizes) {
    await page.setViewportSize({ width: size, height: size });
    const outPath = path.join(publicDir, name);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`Generated ${name} (${size}x${size})`);
  }

  await browser.close();

  // Now invoke Python script to generate multi-resolution favicon.ico
  const pyScript = `
from PIL import Image
import os

public_dir = "${publicDir.replace(/\\/g, "/")}"

img16 = Image.open(os.path.join(public_dir, "icon-16.png"))
img32 = Image.open(os.path.join(public_dir, "icon-32.png"))
img48 = Image.open(os.path.join(public_dir, "icon-48.png"))

ico_path_public = os.path.join(public_dir, "favicon.ico")

img48.save(ico_path_public, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

print("favicon.ico generated in public/ containing 16x16, 32x32, 48x48 frames.")
`;

  execSync("python3 -", { input: pyScript, stdio: ["pipe", "inherit", "inherit"] });
}

rasterize().catch((err) => {
  console.error("Rasterization error:", err);
  process.exit(1);
});
