# Contributing to JewelCore ERP

Thank you for your interest in contributing to **JewelCore ERP**! We welcome contributions from engineers, bullion specialists, gemologists, and open-source advocates worldwide.

Please take a moment to review this document before submitting issues or pull requests.

---

## 📜 Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat all community members with empathy, respect, and professionalism.

---

## 🏛️ Monorepo Architecture

JewelCore is structured as a high-performance **pnpm workspace monorepo**:

```
JewelCore-ERP/
├── apps/
│   ├── web/           # Next.js 15 App Router frontend (20 workstations & screens)
│   ├── api/           # Express 5 / Fastify REST API & Telemetry Gateway (port 4000)
│   └── worker/        # BullMQ asynchronous background processor (E-Invoice, BIS, Queues)
├── packages/
│   ├── database/      # PostgreSQL 16 schema (43 tables), Kysely/pg pool, seed scripts
│   └── shared/        # Zod validation schemas, TypeScript DTOs, statutory utilities
└── .github/           # GitHub Actions CI/CD workflows, issue & PR templates
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v9.x` or `v10.x` (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker & Docker Compose**: For local PostgreSQL 16 (port `5434`) and Redis 7 (port `6380`)

### 1. Fork & Clone the Repository
```bash
git clone https://github.com/<your-username>/JewelCore-ERP.git
cd JewelCore-ERP
```

### 2. Install Monorepo Dependencies
```bash
pnpm install
```

### 3. Spin Up Supporting Infrastructure
```bash
docker compose up -d
```
Verify containers are healthy:
```bash
docker compose ps
```

### 4. Seed the Master Database
Provisions the 43 physical database tables, branch stores (`INV-11`, `VAULT-01`, `SHOW-02`), 12 operational staff personas, bullion alloys, and PMLA VIP clients:
```bash
pnpm run db:seed
```

### 5. Launch Development Servers
Runs both Fastify/Express REST API (`http://localhost:4000`) and Next.js Web (`http://localhost:3000`) concurrently:
```bash
pnpm run dev:all
```

---

## 🧪 Quality Assurance & Testing Standards

Every contribution must pass all automated quality gates before being merged:

```bash
# 1. Monorepo Typecheck (Must pass with 0 errors across all 5 projects)
pnpm run typecheck

# 2. Run Vitest Unit & Integration Test Suite (888 / 888 passing)
pnpm test

# 3. Run Playwright End-to-End Browser Test Suite (154 / 154 passing)
pnpm run test:e2e
```

---

## 🌿 Git Branch & Commit Strategy

### Branch Naming Conventions
- `feat/<feature-name>`: New workstation capability or statutory engine
- `fix/<issue-name>`: Bug fix or security hardening
- `docs/<doc-name>`: Documentation updates or architectural specs
- `perf/<perf-name>`: Performance optimizations or indexing improvements
- `refactor/<refactor-name>`: Code restructuring without functional behavior changes

### Conventional Commits
JewelCore enforces [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description in present tense>

[optional body explaining WHY this change was made]

[optional footer referencing issue or breaking change]
```

**Allowed Types:**
- `feat`: A new feature for the user or system
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, or auxiliary tools

**Allowed Scopes:**
- `web`, `api`, `database`, `shared`, `worker`, `iam`, `pos`, `qc`, `bis`, `itc04`, `security`

*Example:*
```bash
git commit -m "feat(bis): implement 6-character HUID alphanumeric validation against IS 1417:2016"
```

---

## 📬 Submitting a Pull Request (PR)

1. **Create your feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Make your changes** following clean architecture patterns and zero-trust security standards.
3. **Verify tests and types**:
   Ensure `pnpm run typecheck`, `pnpm test`, and `pnpm run test:e2e` pass with 100% success.
4. **Push your branch** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch. Complete all sections of the [PR Template](./.github/pull_request_template.md).

---

## 🤝 Review & Community

- Maintainers will review your PR within 48–72 hours.
- If changes are requested, push additional commits to your branch; GitHub Actions will re-verify the build automatically.
- Once approved and CI checks pass green, your PR will be squashed and merged into `main`.

Thank you for helping build the world's most transparent, resilient open-source high-jewellery ERP!
