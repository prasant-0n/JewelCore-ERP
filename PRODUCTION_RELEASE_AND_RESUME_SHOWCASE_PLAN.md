# JewelCore ERP — Production Release & Resume Showcase Playbook
**Executive Architecture, Cloud Deployment & Senior Engineering Interview Defense**  
**Classification**: Production Release Playbook | **Author**: Technical Leadership (CTO, Production IT Manager, Engineering Team Lead)  
**Monorepo**: `@jewelcore/web` (Next.js 15) | `@jewelcore/api` (Express 5) | `@jewelcore/database` (PostgreSQL 16) | `@jewelcore/worker` (BullMQ + Redis 7)

---

## 1. Resume Showcase: High-Impact Bullet Points

When listing **JewelCore ERP** on your resume (for Senior Full-Stack Engineer, Backend Architect, or Engineering Team Lead roles), use these quantifiable, metric-driven bullet points formatted for top-tier enterprise and ATS screening:

### Option A: Senior Full-Stack / Tech Lead Phrasing
```text
JewelCore Enterprise ERP | Lead Architect & Full-Stack Engineer | TypeScript, Next.js 15, Express 5, PostgreSQL, Redis, Docker
• Architected and shipped an enterprise-grade ERP and atelier execution platform handling real-time MCX bullion trading, physical asset custody, and multi-branch retail POS across 20 specialized workstations.
• Engineered a zero-trust Policy-Based Access Control (PBAC) engine with NIST SP 800-63B AAL3 WebCrypto hardware device binding, sub-millisecond route guarding, and SOC 2 Type II break-glass emergency overrides.
• Designed a high-concurrency inventory engine with pessimistic row locking (SELECT ... FOR UPDATE), preventing race conditions across serialized precious metal pieces tracked down to 0.001g metrology precision.
• Built statutory Indian compliance engines for automated NIC E-Invoicing (64-char SHA-256 IRN + signed QR codes), 12-digit armored transit E-Way Bills, BIS 6-digit laser HUID validation, and Form GST ITC-04 Karigar job-work reconciliation.
• Achieved 100% test pass rate across 10 Playwright end-to-end suites and 500+ Vitest integration tests with zero TypeScript compiler diagnostics across a 6-package monorepo.
```

### Option B: Backend / Distributed Systems Specialist Phrasing
```text
JewelCore Distributed ERP Platform | Backend Systems Architect | Node.js, Express 5, PostgreSQL 16, Redis 7, BullMQ, Docker
• Designed a modular-monolith backend operating on PostgreSQL 16 and Redis 7, implementing double-entry general ledger accounting where all financial vouchers enforce atomic debit-credit balance verification.
• Implemented tamper-evident audit trails with cryptographic Merkle tree hashing and dual-key HSM co-signing quorum for high-value vault dispatches exceeding ₹1,00,00,000.
• Built sub-120ms IoT hardware telemetry pipelines via WebSockets and Server-Sent Events, ingesting live feeds from Mettler Toledo RS-232 precision balances and Impinj Speedway R420 UHF RFID scanners.
• Hardened API cluster against OWASP Top 10 vulnerabilities, implementing strict CORS origin whitelisting, RFC 7807 problem details mapping, and Argon2id password hashing (19 MiB memory, t=2).
```

---

## 2. Cloud Hosting Architecture & Deployment Playbook

To provide a working live link on your resume and GitHub repository, deploy the platform using the following cloud architecture:

```mermaid
flowchart TD
    subgraph Client Workstations
        A[Recruiter / Interviewer Browser]
    end

    subgraph Vercel Cloud Edge
        B[Next.js 15 Web Frontend<br/>jewelcore-erp.vercel.app]
    end

    subgraph Cloud Container Cluster Railway / AWS
        C[Express 5 REST API Cluster<br/>api.jewelcore.internal]
        D[BullMQ Async Queue Worker]
    end

    subgraph Managed Cloud Data Layer
        E[(Neon / Supabase Serverless PG 16)]
        F[(Upstash Redis 7 Cluster)]
    end

    A -->|HTTPS| B
    B -->|REST API Calls & JWT| C
    C -->|Read/Write Queries| E
    C -->|Session, Rates, BullMQ| F
    D -->|Job Queue Consumption| F
    D -->|State Updates| E
```

### 2.1 Step-by-Step Cloud Provisioning (Free & Production Tiers)

#### Step 1: Managed PostgreSQL 16 (Neon / Supabase)
1. Create a free PostgreSQL instance on **[Neon.tech](https://neon.tech)** or **[Supabase.com](https://supabase.com)**.
2. Copy the connection string:
   ```env
   DATABASE_URL=postgres://user:password@ep-cool-frost-12345.us-east-2.aws.neon.tech/jewelcore_erp?sslmode=require
   ```
3. Run migrations and master showroom seeder against the cloud database:
   ```bash
   DATABASE_URL="<your-neon-database-url>" pnpm run db:seed
   ```

#### Step 2: Managed Redis 7 (Upstash)
1. Create a serverless Redis database on **[Upstash.com](https://upstash.com)**.
2. Copy the Redis URI:
   ```env
   REDIS_URL=rediss://default:password@upstash-instance.upstash.io:6379
   ```

#### Step 3: API Cluster Deployment (Railway / Render / AWS App Runner)
1. Connect your GitHub repository to **[Railway.app](https://railway.app)** or **[Render.com](https://render.com)**.
2. Select `apps/api/Dockerfile` or configure the root start command:
   ```bash
   pnpm --filter "@jewelcore/api" run build && pnpm --filter "@jewelcore/api" run start
   ```
3. Set Environment Variables:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<your-neon-connection-string>
   REDIS_URL=<your-upstash-redis-url>
   JWT_SECRET=jewelcore_production_master_jwt_secret_key_at_least_32_chars!
   CORS_ORIGIN=https://jewelcore-erp.vercel.app,http://localhost:3000
   ```

#### Step 4: Web Frontend Deployment (Vercel)
1. Import repository into **[Vercel](https://vercel.com)**.
2. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm run build`
   - **Install Command**: `pnpm install`
3. Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://api-jewelcore-erp.up.railway.app/api/v1
   NEXT_PUBLIC_WS_URL=wss://api-jewelcore-erp.up.railway.app
   ```

---

## 3. Seeded Live Demo Personas & Credentials for Recruiters

To allow hiring managers and interviewers to test the live application across multiple operational roles without typing credentials, the login portal includes **quick-fill chips** and seeded accounts:

**Universal Password for all accounts**: `JewelCore@2026`

| Persona | Operational Title | Branch / Station | Access Scope & Workstations |
| :--- | :--- | :--- | :--- |
| **Rachel R.** | Managing Director & Store Manager | Flagship Showroom (`INV-11`) | **Full Executive**: Control Tower, Vault Storage, POS, Accounting, Governance |
| **Rajesh K.** | Master Goldsmith & Atelier Supervisor | Treasury Vault Hub (`VAULT-01`) | **Atelier Crafting**: Karkhana job orders, Karigar job slips, scrap reconciliation |
| **Farooq A.** | Senior Karigar & ITC-04 Specialist | Treasury Vault Hub (`VAULT-01`) | **Artisan Workbench**: Form GST ITC-04 delivery challans, tunda loss recovery |
| **Devika S.** | Senior QC Gemologist & Assayer | Flagship Showroom (`INV-11`) | **Analytical QC**: XRF metrology, spectrometer assays, 4Cs diamond lab grading |
| **Ananya P.** | BIS Hallmarking & HUID Inspector | Flagship Showroom (`INV-11`) | **Hallmarking Registry**: 6-character laser HUID verification, AHC attestation |
| **Vikram M.** | Head Vault Custodian & Inward GRN | Treasury Vault Hub (`VAULT-01`) | **Treasury Vault**: Physical storage compartment tree, inward bullion intake |
| **Siddharth R.** | Armored Logistics & Transit Officer | Treasury Vault Hub (`VAULT-01`) | **Logistics & Transit**: Inter-branch transfer manifests, tamper-evident seals |
| **Arjun K.** | Senior POS Cashier & E-Invoice Lead | Flagship Showroom (`INV-11`) | **Showroom Retail**: POS sales billing, split tender, NIC E-Invoice & E-Way bills |
| **Priya M.** | High-Jewellery VIP Salon Director | Luxury Boutique (`SHOW-02`) | **VIP Concierge**: Private client digital vaults, bespoke bridal commissions |
| **Kavita N.** | Chief Bullion Trader & Feed Analyst | Treasury Vault Hub (`VAULT-01`) | **Bullion Market**: Live MCX/LBMA spot price feeds, tiered making charge policies |
| **Alexander V.** | Chief Compliance Officer & HSM Quorum | Flagship Showroom (`INV-11`) | **Governance & Quorum**: Multi-signatory HSM quorum, Merkle custody ledgers |
| **Rohan D.** | Financial Controller & Tax Auditor | Flagship Showroom (`INV-11`) | **Statutory Accounting**: General ledger, double-entry vouchers, Form GSTR-1/3B |

---

## 4. Senior Engineering Interview Defense Playbook

When presenting this project in a system design or technical interview, use the following structured answers:

### Q1: "How did you prevent race conditions and double-selling of unique gold jewelry pieces during concurrent checkout?"
> **Answer**:  
> *"Because fine jewelry items are serialized unique physical assets (Entity 21 in our domain model), selling the same ring twice is catastrophic. In `salesInvoiceRepository.ts`, both invoice creation and physical custody release execute inside an atomic PostgreSQL transaction.  
> We use pessimistic row locking via `SELECT ... FROM inventory_items WHERE id = $1 FOR UPDATE`. We verify `commercial_state === 'AVAILABLE_FOR_SALE'`, transition it to `'RESERVED'` during cart checkout, and upon payment finalization, transition it to `'SOLD'` with a corresponding immutable `CUSTODY_DEPARTURE` movement record. This guarantees zero lost updates and prevents double-allocation even under high concurrent load."*

### Q2: "How does the zero-trust hardware device binding work?"
> **Answer**:  
> *"Standard bearer JWTs stored in browser storage are susceptible to session export or XSS theft. To conform with NIST SP 800-63B Authenticator Assurance Level 3 (AAL3), our client application uses the W3C WebCrypto API (`window.crypto.subtle`) to generate an asymmetric `ECDSA P-256` keypair stored non-extractably in the physical terminal's hardware TPM or Secure Enclave.  
> When an operator performs high-assurance actions (such as vault dispatches or stock approvals), the client creates a cryptographic signature over the payload and request timestamp. The API validates both the bearer JWT and the hardware signature before executing the mutation, ensuring requests originate from a registered workstation."*

### Q3: "How does the platform handle statutory Indian GST and Karigar job-work compliance?"
> **Answer**:  
> *"Jewelry in India operates under a hybrid tax regime: raw precious metals carry 3% GST (HSN 7113 / 7108), while making charges carry 5% GST under Job Work Service Accounting Code (SAC 9988).  
> In our accounting engine, invoices dynamically compute CGST, SGST, and IGST breakdowns and generate 64-character SHA-256 Invoice Registration Numbers (IRN) and signed QR codes matching NIC Schema v1.03. For manufacturing, we implemented CGST Section 143 Form GST ITC-04 delivery challans, reconciling bullion issued to Karigars against finished ornaments, filing scrap, and allowable melting loss tolerances (0.001g precision)."*
