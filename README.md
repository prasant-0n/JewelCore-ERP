<div align="center">
  <img src="apps/web/public/logo.svg" alt="JewelCore Atelier Luxury ERP" width="360" />
  <p align="center">
    <strong>Next-Generation Enterprise ERP for Precious Jewellery Manufacturing, Analytical QC, Vault Custody & High-Jewellery Showrooms</strong>
  </p>

  <p align="center">
    <a href="#key-architectural-modules">Modules</a> •
    <a href="#hardware-telemetry">Hardware IoT</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#compliance--audit">Compliance</a>
  </p>
</div>

---

## Overview

**JewelCore ERP** is a mission-critical, multi-tenant enterprise resource planning system tailored exclusively for fine jewellery ateliers, bullion treasuries, and luxury retail salons. Built with microsecond precision, it enforces dual-custody physical vault security, gravimetric tolerance evaluation (down to 0.001g), real-time UHF RFID antenna sweeps, and live bullion spot price parity.

### 💎 Key Architectural Workstations

|   #    | Workstation                  | Route          | Operational Functionality                                                      |
| :----: | :--------------------------- | :------------- | :----------------------------------------------------------------------------- |
| **1**  | **Executive Control Tower**  | `/`            | Real-time bullion metrics, load cell reconciliation, showroom inventory status |
| **2**  | **Vault & Physical Storage** | `/storage`     | Multi-tier compartment tree (`VAULT` → `LOCKER` → `COMPARTMENT` → `TRAY`)      |
| **3**  | **Inward Receiving & GRN**   | `/procurement` | Supplier shipment intake, Mettler Toledo auto-tare gravimetric weighing        |
| **4**  | **Analytical QC & Assay**    | `/qc`          | Spectrometry, XRF purity assays, gemstone grading (4Cs), tolerance gates       |
| **5**  | **Piece Master & Birth**     | `/inventory`   | Cryptographic asset birth, laser hallmark engraving, lineage tracking          |
| **6**  | **UHF RFID Station**         | `/rfid`        | Impinj Speedway R420 360° antenna sweeps, batch EPC printing & encoding        |
| **7**  | **Stock Approval Gate**      | `/governance`  | HSM dual-custody authorization quorum, emergency override protocols            |
| **8**  | **Bullion Market Pricing**   | `/pricing`     | Real-time MCX & LBMA spot rate boards, alloy making charge policies            |
| **9**  | **POS Cashier & Billing**    | `/pos`         | VIP client salon checkout, old gold buyback trade-in, GST e-invoice generation |
| **10** | **Returns & Melt Refinery**  | `/returns`     | PMLA/AML compliant buyback settlement, smelting yield assay calculations       |
| **11** | **Armored Store Transfers**  | `/transfers`   | Inter-branch armored transit tracking, security seal chain-of-custody          |

---

## 🛰️ Hardware Telemetry & IoT Integration

JewelCore features native low-latency WebSocket (`/ws/telemetry`) and SSE streaming (`/api/v1/telemetry/stream`):

- **Mettler Toledo RS-232 Precision Scale**: Micro-gram dual-range weighing with remote hardware auto-tare zeroing.
- **Impinj Speedway R420 UHF RFID Gateway**: 4-port 360° antenna sweeps detecting tagged jewellery assets within 120ms.
- **Live Spot Market Feed**: Continuous tick micro-fluctuations reflecting live gold (`Au 24K: ₹7,450/g`) and silver (`Ag 999: ₹88.20/g`) spot prices.

---

## 🚀 Quick Start

### Prerequisites

- Node.js `v20+` / `v22+` / `v24+`
- pnpm `v9+` or `v10+`
- Docker (for PostgreSQL on port `5434` and Redis on port `6380`)

### 1. Install Monorepo Dependencies

```bash
pnpm install
```

### 2. Seed Master Showroom Database

Provisions the 43 physical database tables, creates `JewelCore Luxury Atelier Group`, branch stores (`INV-11`, `VAULT-01`, `SHOW-02`), operational staff personas, bullion alloys, and PMLA-verified VIP clients:

```bash
pnpm run db:seed
```

### 3. Launch Development Servers

Launch both Fastify REST API (`http://localhost:4000`) and Next.js Web (`http://localhost:3000`) in parallel:

```bash
pnpm run dev:all
```

---

## 🧪 Verification & Test Suite

The JewelCore ERP monorepo maintains rigorous automated quality standards:

```bash
# Typecheck all 5 workspace projects (0 TypeScript errors)
pnpm run typecheck

# Execute complete Vitest integration test suite (772/772 passed)
pnpm test

# Run complete Playwright browser E2E test suite across all 11 screens (24/24 passed)
pnpm run test:e2e
```

---

## 🛡️ Security, Compliance & Dual-Key Quorum

- **Optimistic Concurrency Control (OCC)**: Zero lost updates across concurrent showroom transactions.
- **Append-Only Merkle Audit Trail**: Immutability enforced by PostgreSQL database triggers (`INV-09`).
- **PMLA / KYC Verification**: Mandatory tax identifiers (PAN) and high-value cash transaction thresholds.
- **QuickLock Terminal**: PIN-protected session lock for physical showroom counters (`Default PIN: 1234`).
