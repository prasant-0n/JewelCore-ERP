<div align="center">
  <img src="apps/web/public/logo.svg" alt="JewelCore Atelier Luxury ERP" width="380" />
  
  # JewelCore ERP
  
  **Mission-Critical Enterprise ERP for Precious Jewellery Manufacturing, Analytical QC, Vault Custody & Luxury Showrooms**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20Strict-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![CI / CD](https://img.shields.io/github/actions/workflow/status/prasant-0n/JewelCore-ERP/ci.yml?branch=main&label=CI%2FCD&style=flat-square&logo=githubactions&logoColor=white)](https://github.com/prasant-0n/JewelCore-ERP/actions/workflows/ci.yml)
  [![Security](https://img.shields.io/github/actions/workflow/status/prasant-0n/JewelCore-ERP/security.yml?branch=main&label=DevSecOps&style=flat-square&logo=github&logoColor=white)](https://github.com/prasant-0n/JewelCore-ERP/actions/workflows/security.yml)
  [![Docker GHCR](https://img.shields.io/badge/Docker-GHCR%20OCI%20Images-2496ed?style=flat-square&logo=docker&logoColor=white)](https://github.com/prasant-0n/JewelCore-ERP/pkgs/container/jewelcore-api)
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](./LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)
  [![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa?style=flat-square)](./CODE_OF_CONDUCT.md)
  <br />
  [![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Express/Node](https://img.shields.io/badge/Express-5%20Fastify%20Core-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20ACID-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Redis](https://img.shields.io/badge/Redis-7%20Cache%20%26%20Streams-dc382d?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
  [![Tests: Vitest](https://img.shields.io/badge/Vitest-888%2F888%20Passed-6e9f18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
  [![E2E: Playwright](https://img.shields.io/badge/Playwright-154%2F154%20Passed-2e8b57?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)
  [![Compliance](https://img.shields.io/badge/Statutory-BIS%20HUID%20%7C%20GST%20ITC--04%20%7C%20NIC%20E--Invoice-gold?style=flat-square)](#-statutory-indian-jewellery--tax-regulatory-engines)
  [![Security](https://img.shields.io/badge/Security-NIST%20SP%20800--63B%20%7C%20SOC%202%20PBAC-blue?style=flat-square)](#-zero-trust-iam--physical-vault-governance)

  <p align="center">
    <a href="#-live-demo--portfolio-access"><strong>Live Demo & Credentials</strong></a> •
    <a href="#-architectural-workstations">Workstations</a> •
    <a href="#-statutory-indian-jewellery--tax-regulatory-engines">Compliance</a> •
    <a href="./ARCHITECTURE.md">Architecture</a> •
    <a href="./docs/devops-guide.md"><strong>DevOps & Deployment</strong></a> •
    <a href="./CONTRIBUTING.md">Contributing</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-verification--automated-tests">Testing</a>
  </p>
</div>

---

## Executive Summary

**JewelCore ERP** is an enterprise-grade, multi-tenant resource planning and regulatory compliance platform engineered specifically for fine jewellery ateliers, bullion treasuries, and high-jewellery retail salons. 

Unlike generic retail ERPs, JewelCore enforces:
- **Microsecond Bullion Spot Parity**: Sub-milligram gravimetric tolerance calculation (0.001g precision) linked to real-time MCX & LBMA live rate boards.
- **Physical Vault Dual-Custody & Separation of Duties**: Quorum co-signatures, time-bound supervisor delegations, and NIST SP 800-53 break-glass bypasses.
- **Statutory Indian Jewellery Compliance**: Native Bureau of Indian Standards (BIS) 6-character alphanumeric HUID laser hallmarking, CGST Act Section 143 / Rule 45 Karigar job-work metal reconciliation (Form GST ITC-04), and NIC Statutory GST E-Invoice & 12-Digit E-Way Bill generation.
- **Industrial IoT & Hardware Telemetry**: Native Mettler Toledo RS-232 dual-range load cell scales and Impinj Speedway R420 360° UHF RFID sweeps.

---

## 🔑 Live Demo & Portfolio Access

The web application features an **Interactive Quick-Login Roster** on the login screen. You can select any operational persona to auto-populate credentials and test role-based access control (PBAC) policies across all 15 workstations.

| URL / Service | Local Development Endpoint | Production Cloud Endpoint |
| :--- | :--- | :--- |
| **Web Frontend (Next.js 15)** | `http://localhost:3000` | [jewel-core-erp.vercel.app](https://jewel-core-erp.vercel.app) |
| **REST API & Telemetry Gateway** | `http://localhost:4000/api/v1` | [jewelcore-erp-dsq7.onrender.com/api/v1](https://jewelcore-erp-dsq7.onrender.com/api/v1) |
| **API Health & Deep Probe** | `http://localhost:4000/api/v1/health` | [jewelcore-erp-dsq7.onrender.com/api/v1/health](https://jewelcore-erp-dsq7.onrender.com/api/v1/health) |
| **Swagger UI OpenAPI Reference** | `http://localhost:4000/api-docs` | [jewelcore-erp-dsq7.onrender.com/api-docs](https://jewelcore-erp-dsq7.onrender.com/api-docs) |
| **Scalar Interactive API Docs** | `http://localhost:4000/reference` | [jewelcore-erp-dsq7.onrender.com/reference](https://jewelcore-erp-dsq7.onrender.com/reference) |

### Enterprise Staff Roster & Access Matrix (12 Realistic Personas)

> **Universal Staff Password:** `JewelCore@2026`  
> **Showroom QuickLock Terminal PIN:** `1234`

| # | Division | Persona Name | Operational Role | Login Email | Branch Hub | Access Scope & PBAC Token |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Executive** | **Rachel R.** | Managing Director | `rachel.r@jewelcore.internal` | `INV-11` (Flagship) | Full Enterprise Super-Admin (`ADMIN`) |
| **2** | **Executive** | **Alexander V.** | Chief Compliance Officer | `alexander.v@jewelcore.internal` | `INV-11` (Flagship) | Quorum Overseer & IAM Forensics (`ADMIN`) |
| **3** | **Vault Hub** | **Vikram M.** | Head Vault Custodian | `vikram.m@jewelcore.internal` | `VAULT-01` (Central) | Vault Master, GRN & Inward Custody (`MANAGER`) |
| **4** | **Vault Hub** | **Siddharth R.** | Armored Transit Lead | `siddharth.r@jewelcore.internal` | `VAULT-01` (Central) | Armored Handoff & E-Seal Custody (`STAFF`) |
| **5** | **QC & BIS** | **Devika S.** | Senior QC Gemologist | `devika.s@jewelcore.internal` | `INV-11` (Flagship) | XRF Assaying & 4Cs Gemology (`STAFF`) |
| **6** | **QC & BIS** | **Ananya P.** | BIS Hallmarking Inspector | `ananya.p@jewelcore.internal` | `INV-11` (Flagship) | IS 1417:2016 6-Char HUID Registry (`STAFF`) |
| **7** | **Atelier** | **Rajesh K.** | Master Goldsmith Supervisor | `rajesh.k@jewelcore.internal` | `VAULT-01` (Central) | Karigar Orders & Atelier PBAC (`MANAGER`) |
| **8** | **Atelier** | **Farooq A.** | Senior Karigar Artisan | `farooq.a@jewelcore.internal` | `VAULT-01` (Central) | Metal Fabrication & Job-Work (`STAFF`) |
| **9** | **Retail Salon**| **Arjun K.** | Senior POS Cashier | `arjun.k@jewelcore.internal` | `INV-11` (Flagship) | POS Billing & GST E-Invoice (`STAFF`) |
| **10**| **Retail Salon**| **Priya M.** | VIP Salon Director | `priya.m@jewelcore.internal` | `SHOW-02` (Uptown) | High-Jewellery Sales & Appraisals (`STAFF`) |
| **11**| **Treasury** | **Kavita N.** | Chief Bullion Trader | `kavita.n@jewelcore.internal` | `VAULT-01` (Central) | MCX/LBMA Spot Boards & Hedging (`MANAGER`) |
| **12**| **Treasury** | **Rohan D.** | Senior Tax Controller | `rohan.d@jewelcore.internal` | `INV-11` (Flagship) | General Ledger & Form ITC-04 (`ADMIN`) |

---

## 💎 Architectural Workstations

The platform encompasses 15 mission-critical operational workstations:

| # | Workstation | Route | Operational Functionality |
| :-: | :--- | :--- | :--- |
| **1** | **Executive Control Tower** | `/` | Real-time bullion metrics, load cell reconciliation, showroom inventory status, and live MCX/LBMA tickers |
| **2** | **Vault & Physical Storage** | `/storage` | Multi-tier compartment tree (`VAULT` → `LOCKER` → `COMPARTMENT` → `TRAY`), dual-custody access verification |
| **3** | **Inward Receiving & GRN** | `/procurement` | Supplier shipment intake, Mettler Toledo RS-232 auto-tare gravimetric weighing, GRN reconciliation |
| **4** | **Analytical QC & Assay** | `/qc` | Spectrometry, XRF assays, 4Cs gemstone grading, and **Bureau of Indian Standards (BIS) 6-Character HUID Registry** |
| **5** | **Piece Master & Birth** | `/inventory` | Cryptographic asset birth, laser hallmark engraving, lineage tracking, and multi-vault stock balance ledgers |
| **6** | **UHF RFID Station** | `/rfid` | Impinj Speedway R420 360° antenna sweeps, batch EPC printing & encoding queues with hardware failover isolation |
| **7** | **Stock Approval Gate** | `/governance` | HSM dual-custody authorization quorum, Maker-Checker signoffs, and forensic compliance audit stream |
| **8** | **Bullion Market Pricing** | `/pricing` | Real-time MCX & LBMA spot rate boards, tiered making charge policies, gemstone valuation matrices, and OCC snapshots |
| **9** | **POS Cashier & Billing** | `/pos` | VIP salon checkout, split tender, old gold trade-in, and **NIC Statutory GST E-Invoice & 12-Digit E-Way Bill Engine** |
| **10**| **Returns & Melt Refinery** | `/returns` | PMLA/AML compliant buyback settlement, smelting yield assay calculations, and customer store credit ledger |
| **11**| **Armored Store Transfers** | `/transfers` | Inter-branch armored transit tracking, dual-custody dispatch/intake PBAC, and tamper-evident electronic seals |
| **12**| **Atelier Manufacturing** | `/manufacturing`| Karigar job-work orders, mass balance metal reconciliation, bullion spot recovery, and **Statutory Form GST ITC-04** |
| **13**| **General Ledger & Tax** | `/accounting` | Financial ledger entries, chart of accounts, trial balances, and statutory tax reconciliation reports |
| **14**| **Gold Savings Schemes** | `/schemes` | Monthly chit schemes, gold accumulation plans, maturity bonuses, and AML-compliant installment ledgers |
| **15**| **VIP Client Portal** | `/portal` | Client digital vault, high-jewellery reservations, certificates of authenticity, and valuation appraisals |

---

## 🏛️ Statutory Indian Jewellery & Tax Regulatory Engines

JewelCore ERP implements strict, production-ready engines conforming to Indian jewellery laws and statutory mandates:

### 1. Bureau of Indian Standards (BIS) Hallmarking & HUID Engine (IS 1417:2016)
- **Mandatory 6-Character Alphanumeric HUID**: Cryptographic laser hallmark tracking conforming to Indian BIS standards.
- **IS 1417:2016 Purity Benchmark Attestation**: Automated verification for 24K (999), 22K (916), 20K (833), 18K (750), and 14K (585) precious alloys.
- **AHC Center Verification & Chain-of-Custody**: Secure dispatch to Assaying & Hallmarking Centres (AHC), certificate ingestion, and direct consumer verification against the BIS Care portal.

### 2. Karigar Job-Work Mass Balance & Form GST ITC-04 (CGST Act Section 143 & Rule 45)
- **Granular Mass-Balance Conservation Equation**:
  $$\text{Issued Metal} = \text{Gross Finished Weight} + \text{Recoverable Scrap / Dust} + \text{Unaccounted Loss (Shrinkage)}$$
- **Statutory Shrinkage Allowance Thresholds**: Hard limits (e.g., maximum 1.50% gold loss on casting / 0.80% on filing).
- **Automated Financial Recovery**: Unaccounted loss exceeding tolerance is automatically recovered from Karigar wages evaluated at the real-time MCX bullion spot rate.
- **Quarterly Form GST ITC-04 Engine**: Generates statutory delivery challans with SAC/HSN codes, pure weight content, and government reporting schedules.

### 3. NIC Statutory GST E-Invoice & 12-Digit E-Way Bill Engine
- **NIC Schema v1.03 Adherence**: Generates 64-character SHA-256 Invoice Reference Numbers (IRN), signed B2B/B2C QR codes, and E-Way Bills for consignments exceeding statutory thresholds (₹50,000 / ₹2,00,000 intra-state).
- **Dual-Mode Generation**: Seamless live-switch between direct NIC sandbox APIs and air-gapped offline signed QR fallbacks.

### 4. Prevention of Money Laundering Act (PMLA 2002) & Section 269ST KYC
- **Mandatory High-Value Cash Thresholds**: Strict block on cash tenders $\ge ₹200,000$ per Income Tax Act Section 269ST.
- **PAN Verification Enforcement**: Automated PAN requirement for bullion transactions $\ge ₹200,000$ under PMLA guidelines.

---

## 🔐 Zero-Trust IAM & Physical Vault Governance

```
                    ┌───────────────────────────────────────────┐
                    │       Physical Showroom Workstation       │
                    └─────────────────────┬─────────────────────┘
                                          │
                         [Showroom LAN Geofence Whitelist]
                                          │
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │      Hardware Token & Biometric Auth      │
                    │   (FIDO2 / WebAuthn / AAL3 Device Token)  │
                    └─────────────────────┬─────────────────────┘
                                          │
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │       Policy-Based Access Control         │
                    │        (PBAC Dynamic Role Matrix)         │
                    └─────────────────────┬─────────────────────┘
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
   [Standard Workstation Access]                       [High-Assurance Vault Operations]
   (POS Billing, QC Assaying,                          (Opening Main Vault, Consignment
    Karigar Job-Work Allocation)                        Dispatch, Quorum Price Override)
                                                                    │
                                                                    ▼
                                                       ┌─────────────────────────┐
                                                       │  Dual-Custody Quorum    │
                                                       │  Two-Person Rule / HSM  │
                                                       │  NIST SP 800-53 Bypass  │
                                                       └─────────────────────────┘
```

- **AAL3 Hardware Security Token Binding (Milestone 10)**: Cryptographic device fingerprinting and hardware token binding preventing off-premises terminal use.
- **NIST SP 800-63B Credential Governance**: Client-side entropy evaluation, mandatory 90-day rotation, and PBAC role segregation.
- **Forensic Security Audit Stream**: Real-time event capture with IP, actor, timestamp, action parameters, and Merkle immutability triggers (`INV-09`).
- **NIST SP 800-53 / SOC 2 Break-Glass Bypass**: Dual-custody supervisor quorum for emergency vault override under audited conditions.

---

## 🏗️ Monorepo Architecture & Tech Stack

```
JewelCore-ERP/
├── apps/
│   ├── web/                    # Next.js 15 App Router frontend (20 screens & workstations)
│   └── api/                    # Express 5 / Fastify REST API & Telemetry Gateway
├── packages/
│   ├── database/               # PostgreSQL schema (43 tables), Kysely/pg pool, seed scripts
│   ├── shared/                 # Zod contracts, TypeScript DTOs, statutory utilities
│   └── worker/                 # BullMQ asynchronous jobs (E-Invoice, BIS HUID sync, SMS/Email)
```

| Technology | Purpose | Production Justification |
| :--- | :--- | :--- |
| **Next.js 15 App Router** | Web Workstations | Server Components, dynamic streaming, sub-second route transitions |
| **Express 5 / Node.js 22** | Core API Gateway | Low-latency REST endpoints, WebSocket and SSE hardware streaming |
| **PostgreSQL 16** | Core Ledger Database | ACID transactions, strict schema constraints, Merkle audit triggers, row-level `FOR UPDATE` pessimistic locks |
| **Redis 7** | Cache & Job Queues | Ephemeral session tokens, live spot price boards, BullMQ distributed queues |
| **TailwindCSS & Lucide** | Luxury UI System | Bespoke high-contrast gold/slate aesthetic for tactile counter use |
| **Zod & TypeScript 5.8** | Type Safety & Validation | End-to-end type safety spanning DB schemas, API DTOs, and client forms |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **pnpm**: `v9.x` or `v10.x`
- **Docker**: For running PostgreSQL (`5434`) and Redis (`6380`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/prasanta-on/JewelCore-ERP.git
cd JewelCore-ERP
pnpm install
```

### 2. Start Supporting Infrastructure (PostgreSQL & Redis)
```bash
docker compose up -d
```

### 3. Provision & Seed Master Database
Provisions the 43 physical database tables, branch stores (`INV-11`, `VAULT-01`, `SHOW-02`), 12 operational staff personas, bullion alloys, and PMLA VIP clients:
```bash
pnpm run db:seed
```

### 4. Launch Development Servers
Starts both the Express API (`http://localhost:4000`) and Next.js Web (`http://localhost:3000`) concurrently:
```bash
pnpm run dev:all
```

---

## 🧪 Verification & Automated Tests

JewelCore maintains strict 100% test pass rates across all packages:

```bash
# 1. Typecheck all monorepo workspace packages (0 errors across 5 projects)
pnpm run typecheck

# 2. Execute full Vitest test suite (888 / 888 passing across 125 suites)
pnpm test

# 3. Execute full Playwright browser E2E test suite (154 / 154 passing across 33 spec files)
pnpm run test:e2e
```

---

## ☁️ Cloud Production Deployment

JewelCore is architected for zero-downtime, continuous deployment across modern cloud platforms:

| Component | Recommended Cloud Provider | Environment Configuration |
| :--- | :--- | :--- |
| **Web Frontend** | **Vercel Edge** | Set `NEXT_PUBLIC_API_URL` to production API |
| **REST API** | **Railway / Render** | Node 22 environment, port 4000, multi-instance autoscale |
| **Database** | **Neon / Supabase / AWS RDS** | PostgreSQL 16 with SSL connection pool |
| **Cache & Queue**| **Upstash Redis** | Managed serverless Redis for sessions and rate limiting |

For detailed step-by-step production rollout instructions, refer to:
- [`PRODUCTION_RELEASE_AND_RESUME_SHOWCASE_PLAN.md`](./PRODUCTION_RELEASE_AND_RESUME_SHOWCASE_PLAN.md)
- [`PRODUCTION_AUDIT_REPORT_CTO_IT_LEAD.md`](./PRODUCTION_AUDIT_REPORT_CTO_IT_LEAD.md)
- [`JEWELLERY_ERP_PROJECT_OVERVIEW.md`](./JEWELLERY_ERP_PROJECT_OVERVIEW.md)

---

## 🌐 Open Source Community & Governance

JewelCore ERP is proudly developed as an open-source enterprise resource planning system. We welcome contributions, bug reports, and statutory feature enhancements from the community.

| Document | Purpose | Link |
| :--- | :--- | :--- |
| **System Architecture** | Technical breakdown of monorepo, PBAC, row locks, and IoT pipelines | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| **Contributing Guide** | Step-by-step developer onboarding, Docker setup, and PR checklist | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |
| **Code of Conduct** | Community standards and expectations (Contributor Covenant v2.1) | [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) |
| **Security Policy** | Responsible vulnerability disclosure, supported versions, and SLAs | [`SECURITY.md`](./SECURITY.md) |
| **Issue Templates** | Structured bug reports, feature requests, and statutory updates | [`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/) |
| **Pull Request Template** | Verification checklist covering typechecks, Vitest, and Playwright | [`.github/pull_request_template.md`](./.github/pull_request_template.md) |

---

## 📄 License & Attribution

Licensed under the **Apache License, Version 2.0** (the "License"). You may obtain a copy of the License in [`LICENSE`](./LICENSE) or at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Architected and maintained by **Prasanta** ([@prasanta-on](https://github.com/prasanta-on)) and the JewelCore ERP Open Source Community. Built to international and Indian jewellery regulatory standards (IS 1417:2016, CGST Sec 143/Rule 45, NIC E-Invoice v1.03).
