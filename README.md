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

|   #    | Workstation                  | Route            | Operational Functionality                                                                                               |
| :----: | :--------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Executive Control Tower**  | `/`              | Real-time bullion metrics, load cell reconciliation, showroom inventory status, and live MCX/LBMA tickers               |
| **2**  | **Vault & Physical Storage** | `/storage`       | Multi-tier compartment tree (`VAULT` → `LOCKER` → `COMPARTMENT` → `TRAY`), dual-custody access verification           |
| **3**  | **Inward Receiving & GRN**   | `/procurement`   | Supplier shipment intake, Mettler Toledo RS-232 auto-tare gravimetric weighing, GRN reconciliation                     |
| **4**  | **Analytical QC & Assay**    | `/qc`            | Spectrometry, XRF assays, 4Cs gemstone grading, and **Bureau of Indian Standards (BIS) 6-Character HUID Registry**     |
| **5**  | **Piece Master & Birth**     | `/inventory`     | Cryptographic asset birth, laser hallmark engraving, lineage tracking, and multi-vault stock balance ledgers           |
| **6**  | **UHF RFID Station**         | `/rfid`          | Impinj Speedway R420 360° antenna sweeps, batch EPC printing & encoding queues with hardware failover isolation        |
| **7**  | **Stock Approval Gate**      | `/governance`    | HSM dual-custody authorization quorum, Maker-Checker signoffs, and forensic compliance audit stream                     |
| **8**  | **Bullion Market Pricing**   | `/pricing`       | Real-time MCX & LBMA spot rate boards, tiered making charge policies, gemstone valuation matrices, and OCC snapshots   |
| **9**  | **POS Cashier & Billing**    | `/pos`           | VIP salon checkout, split tender, old gold trade-in, and **NIC Statutory GST E-Invoice & 12-Digit E-Way Bill Engine**   |
| **10** | **Returns & Melt Refinery**  | `/returns`       | PMLA/AML compliant buyback settlement, smelting yield assay calculations, and customer store credit ledger              |
| **11** | **Armored Store Transfers**  | `/transfers`     | Inter-branch armored transit tracking, dual-custody dispatch/intake PBAC, and tamper-evident electronic seals           |
| **12** | **Atelier Manufacturing**    | `/manufacturing` | Karigar job-work orders, mass balance metal reconciliation, bullion spot recovery, and **Statutory Form GST ITC-04**   |
| **13** | **General Ledger & Tax**     | `/accounting`    | Financial ledger entries, chart of accounts, trial balances, and statutory tax reconciliation reports                   |
| **14** | **Gold Savings Schemes**     | `/schemes`       | Monthly chit schemes, gold accumulation plans, maturity bonuses, and AML-compliant installment ledgers                 |
| **15** | **VIP Client Portal**        | `/portal`        | Client digital vault, high-jewellery reservations, certificates of authenticity, and valuation appraisals              |

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

The JewelCore ERP monorepo maintains rigorous automated quality standards with comprehensive unit, integration, and end-to-end browser coverage:

```bash
# Typecheck all monorepo workspace packages (0 TypeScript errors)
pnpm run typecheck

# Execute complete Vitest integration test suite (888/888 passed across 125 test suites)
pnpm test

# Run complete Playwright browser E2E test suite across all 20 screens and workstations (154/154 passed across 33 spec files)
pnpm run test:e2e
```

---

## 🛡️ Enterprise Security, Zero Trust & Statutory Compliance

JewelCore ERP implements defense-in-depth security, physical vault dual-custody controls, and statutory compliance with Indian and international jewellery regulations:

### 🔐 Zero Trust IAM & Workstation Protection
- **Active Workstation Sessions & Remote Revocation (Milestone 1)**: Real-time operator heartbeat monitoring, remote terminal kill-switches, and concurrent terminal management.
- **NIST SP 800-63B Credential Governance (Milestone 2)**: Client-side zxcvbn entropy scoring meter, mandatory 90-day password rotation cadence, and dictionary attack mitigation.
- **Delegated Authority & Quorum Co-Signature (Milestone 3)**: Time-bound supervisor privilege elevation, two-person rule for high-value vault movements and overrides.
- **Forensic IAM Security Audit Stream (Milestone 4)**: Immutable event logging, real-time security filtering by IP/actor/action, and forensic CSV export.
- **FIDO2 / WebAuthn Hardware Passkeys (Milestone 5)**: Biometric authentication (Touch ID, Windows Hello) and FIDO2 physical keys (YubiKey) with cryptographic attestation.
- **Showroom LAN Geofencing & Hardware Fingerprinting (Milestone 6)**: Strict subnet CIDR whitelist verification and browser/device fingerprinting preventing off-premises terminal access.
- **High-Assurance Step-Up Verification (Milestone 7)**: Re-authentication challenges for high-value vault approvals, transfer dispatches, and master price revaluations.
- **Break-Glass Emergency Protocol (Milestone 8)**: NIST SP 800-53 / SOC 2 compliant dual-custody emergency bypass for catastrophic network isolation or life-safety emergencies.
- **AAL3 Hardware Security Token Binding (Milestone 10)**: Cryptographic binding of hardware security tokens to physical showroom workstations (NIST SP 800-63B Authenticator Assurance Level 3).

### 🏛️ Statutory Indian Jewellery & Tax Regulatory Engines
- **Statutory GST E-Invoice & E-Way Bill (Milestone 11)**:
  - Full adherence to **NIC E-Invoice Schema v1.03** and **CGST Rule 48(4) & 138**.
  - Generation of 64-character SHA-256 Invoice Reference Numbers (IRN), signed B2B/B2C QR codes, and 12-digit E-Way Bills with real-time transit distance validation.
- **Bureau of Indian Standards (BIS) Hallmarking & HUID Registry (Milestone 12)**:
  - Strict compliance with **IS 1417:2016** purity benchmarks (14K, 18K, 22K, 24K).
  - Centralized **6-Character Alphanumeric HUID** (Hallmark Unique Identification) laser engraving registry with Assaying & Hallmarking Centre (AHC) attestation and direct verification against the BIS Care Portal.
- **Karigar Job-Work Metal Reconciliation & Form GST ITC-04 (Milestone 13)**:
  - Adherence to **CGST Act Section 143 & Rule 45** governing job-work movement of precious raw materials.
  - Granular mass balance reconciliation (`Issued Metal = Gross Finished Item + Recoverable Scrap + Unaccounted Loss`).
  - Automated excess shrinkage financial recovery calculated at live bullion spot rates and quarterly **Form GST ITC-04 Delivery Challans**.

### 🔒 Physical Custody & Data Immutability
- **Armored Consignment Dual-Custody PBAC & Electronic Seals (Milestone 9)**: Dual-operator electronic seal generation and chain-of-custody handoffs for armored transit.
- **Optimistic Concurrency Control (OCC)**: Zero lost updates across concurrent showroom transactions via atomic version increment checks.
- **Append-Only Merkle Audit Trail**: Immutability enforced by PostgreSQL database triggers (`INV-09`).
- **PMLA / KYC Verification**: Mandatory tax identifiers (PAN) and high-value cash transaction threshold enforcement.
- **QuickLock Terminal**: PIN-protected session lock for physical showroom counters (`Default PIN: 1234`).
