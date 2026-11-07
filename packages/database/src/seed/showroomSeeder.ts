import { getPool, closePool } from "../pool.js";
import { runMigrations } from "../migrator.js";
import { allMigrations } from "../migrations/index.js";

export async function seedShowroomDatabase(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("=== [JewelCore ERP] Starting Showroom Database Seeding ===");

  const pool = getPool();

  // 1. Run migrations to ensure full 43-entity schema is provisioned
  // eslint-disable-next-line no-console
  console.log("[1/6] Verifying & applying physical database migrations...");
  const migrationReport = await runMigrations(allMigrations, pool);
  // eslint-disable-next-line no-console
  console.log(
    `[1/6] Migrations complete. Status: ${migrationReport.status} (Newly Applied: ${migrationReport.newlyApplied.length})`,
  );

  // 2. Provision Core Organization & Multi-Tenant Showroom Stores
  // eslint-disable-next-line no-console
  console.log("[2/6] Seeding Organization & Multi-Store Hierarchy...");
  const orgId = "0192e300-0000-7000-8000-000000000001";
  await pool.query(
    `INSERT INTO organizations (id, code, name, currency, tax_identifier, is_active, created_at, updated_at)
     VALUES ($1, 'JEWELCORE-ATELIER', 'JewelCore Luxury Atelier Group', 'INR', 'GSTIN27AABCU9603R1ZM', true, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [orgId],
  );

  const stores = [
    {
      id: "0192e300-0001-7000-8000-000000000001",
      code: "INV-11",
      name: "Downtown Showroom",
      type: "RETAIL_STORE",
      address: {
        address: "Atelier Flagship, Colaba Causeway",
        city: "Mumbai",
        state: "MH",
        country: "India",
      },
      phone: "+91 22 2200 1100",
      email: "downtown@jewelcore.internal",
    },
    {
      id: "0192e300-0001-7000-8000-000000000002",
      code: "VAULT-01",
      name: "Central Treasury Vault Hub",
      type: "VAULT_HUB",
      address: {
        address: "Zaveri Bazaar Treasury Complex",
        city: "Mumbai",
        state: "MH",
        country: "India",
      },
      phone: "+91 22 2340 5500",
      email: "treasury@jewelcore.internal",
    },
    {
      id: "0192e300-0001-7000-8000-000000000003",
      code: "SHOW-02",
      name: "Uptown Luxury Boutique",
      type: "SHOWROOM",
      address: {
        address: "Bandra Heritage Pavilion",
        city: "Mumbai",
        state: "MH",
        country: "India",
      },
      phone: "+91 22 2640 8800",
      email: "uptown@jewelcore.internal",
    },
  ];

  for (const s of stores) {
    await pool.query(
      `INSERT INTO stores (id, organization_id, code, name, store_type, address_json, phone, email, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        s.id,
        orgId,
        s.code,
        s.name,
        s.type,
        JSON.stringify(s.address),
        s.phone,
        s.email,
      ],
    );
  }

  // 3. Seed Showroom Operational Staff Personas & User Roles
  // eslint-disable-next-line no-console
  console.log("[3/6] Seeding Showroom Operational Personas & Credentials...");
  const dummyHash =
    "$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQ$testpasswordhash";
  const users = [
    {
      id: "0192e300-0002-7000-8000-000000000001",
      email: "rachel.r@jewelcore.internal",
      firstName: "Rachel",
      lastName: "R.",
      phone: "+91 98200 11001",
      roleId: "0192e302-0001-7000-8000-000000000002", // STORE_MANAGER
      storeId: "0192e300-0001-7000-8000-000000000001", // INV-11
    },
    {
      id: "0192e300-0002-7000-8000-000000000002",
      email: "vikram.m@jewelcore.internal",
      firstName: "Vikram",
      lastName: "M.",
      phone: "+91 98200 11002",
      roleId: "0192e302-0001-7000-8000-000000000003", // INVENTORY_CONTROLLER
      storeId: "0192e300-0001-7000-8000-000000000002", // VAULT-01
    },
    {
      id: "0192e300-0002-7000-8000-000000000003",
      email: "devika.s@jewelcore.internal",
      firstName: "Devika",
      lastName: "S.",
      phone: "+91 98200 11003",
      roleId: "0192e302-0001-7000-8000-000000000004", // SALES_ASSOCIATE
      storeId: "0192e300-0001-7000-8000-000000000001", // INV-11
    },
    {
      id: "0192e300-0002-7000-8000-000000000004",
      email: "arjun.k@jewelcore.internal",
      firstName: "Arjun",
      lastName: "K.",
      phone: "+91 98200 11004",
      roleId: "0192e302-0001-7000-8000-000000000001", // SYSTEM_ADMIN
      storeId: "0192e300-0001-7000-8000-000000000001", // INV-11
    },
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, phone, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [u.id, orgId, u.email, dummyHash, u.firstName, u.lastName, u.phone],
    );

    await pool.query(
      `INSERT INTO user_roles (id, user_id, role_id, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [u.id, u.roleId],
    );

    const orgMemId = `0192e300-0003-7000-8000-00000000000${u.id.slice(-1)}`;
    await pool.query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, is_active, joined_at, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [orgMemId, orgId, u.id],
    );

    const storeMemId = `0192e300-0004-7000-8000-00000000000${u.id.slice(-1)}`;
    await pool.query(
      `INSERT INTO store_memberships (id, organization_membership_id, store_id, is_default, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, true, NOW(), NOW())
       ON CONFLICT (organization_membership_id, store_id) DO NOTHING`,
      [storeMemId, orgMemId, u.storeId],
    );
  }

  // 4. Seed Bullion Materials & Purities
  // eslint-disable-next-line no-console
  console.log("[4/6] Seeding Precious Metal Materials & Purities...");
  const rawMaterials = [
    {
      id: "0192e300-0005-7000-8000-000000000001",
      code: "GOLD",
      name: "Fine & Standard Gold",
      baseMetalType: "GOLD",
      purities: [
        {
          id: "0192e300-0006-7000-8000-000000000001",
          code: "AU-9999",
          name: "24K Fine Gold",
          karatage: "24K",
          percentage: 99.99,
          ratio: 0.9999,
          hallmark: "999",
        },
        {
          id: "0192e300-0006-7000-8000-000000000002",
          code: "AU-916",
          name: "22K Standard Gold",
          karatage: "22K",
          percentage: 91.6,
          ratio: 0.916,
          hallmark: "916",
        },
        {
          id: "0192e300-0006-7000-8000-000000000003",
          code: "AU-750",
          name: "18K Artisan Gold",
          karatage: "18K",
          percentage: 75.0,
          ratio: 0.75,
          hallmark: "750",
        },
      ],
    },
    {
      id: "0192e300-0005-7000-8000-000000000002",
      code: "PLATINUM",
      name: "Platinum Fine",
      baseMetalType: "PLATINUM",
      purities: [
        {
          id: "0192e300-0006-7000-8000-000000000004",
          code: "PT-950",
          name: "Platinum 950",
          karatage: "PT950",
          percentage: 95.0,
          ratio: 0.95,
          hallmark: "Pt950",
        },
      ],
    },
    {
      id: "0192e300-0005-7000-8000-000000000003",
      code: "SILVER",
      name: "Sterling & Fine Silver",
      baseMetalType: "SILVER",
      purities: [
        {
          id: "0192e300-0006-7000-8000-000000000005",
          code: "AG-999",
          name: "Fine Silver 999",
          karatage: "999",
          percentage: 99.9,
          ratio: 0.999,
          hallmark: "999",
        },
      ],
    },
  ];

  for (const m of rawMaterials) {
    await pool.query(
      `INSERT INTO materials (id, organization_id, code, name, base_metal_type, is_precious, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, true, NOW(), NOW())
       ON CONFLICT (organization_id, code) DO NOTHING`,
      [m.id, orgId, m.code, m.name, m.baseMetalType],
    );

    for (const p of m.purities) {
      await pool.query(
        `INSERT INTO purities (id, material_id, code, name, karatage, purity_percentage, purity_ratio, hallmark_code, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
         ON CONFLICT (material_id, code) DO NOTHING`,
        [
          p.id,
          m.id,
          p.code,
          p.name,
          p.karatage,
          p.percentage,
          p.ratio,
          p.hallmark,
        ],
      );
    }
  }

  // 5. Seed Daily Market Rates (FEAT-PRICE-01)
  // eslint-disable-next-line no-console
  console.log("[5/6] Seeding Spot Market Daily Bullion Rates...");
  const adminId = "0192e300-0002-7000-8000-000000000001";
  const dailyRates = [
    { metal: "GOLD", rate: 7450.0 },
    { metal: "PLATINUM", rate: 3200.0 },
    { metal: "SILVER", rate: 88.2 },
  ];

  for (const r of dailyRates) {
    await pool.query(
      `INSERT INTO daily_market_rates (id, organization_id, store_id, metal_type, rate_per_gram_cad, currency, effective_from, rate_source, is_active, recorded_by_user_id, notes, created_at)
       VALUES (gen_random_uuid(), $1, NULL, $2, $3, 'INR', NOW(), 'SIMULATED_FEED', true, $4, 'MCX Spot Parity Seeding', NOW())
       ON CONFLICT DO NOTHING`,
      [orgId, r.metal, r.rate, adminId],
    );
  }

  // 6. Seed Showroom VIP Clients (HNW / UHNW)
  // eslint-disable-next-line no-console
  console.log("[6/6] Seeding Showroom VIP Clients (PMLA / AML Verified)...");
  const clients = [
    {
      code: "CLI-01",
      firstName: "Radhika",
      lastName: "Singhania",
      taxId: "AAAPS9012K",
      phone: "+91 98201 44892",
      email: "radhika.s@atelier-client.vip",
      address: "14 Altamount Road",
      city: "Mumbai",
      tags: ["UHNW", "Solitaire Collector", "Salon-1"],
    },
    {
      code: "CLI-02",
      firstName: "Vikramaditya",
      lastName: "Birla",
      taxId: "BPLPB1104M",
      phone: "+91 99302 77120",
      email: "v.birla@heritage-client.vip",
      address: "5 Carmichael Road",
      city: "Mumbai",
      tags: ["Centurion VIP", "High-Security Vault", "Heritage"],
    },
    {
      code: "CLI-03",
      firstName: "Ananya",
      lastName: "Piramal",
      taxId: "CKAPP4491J",
      phone: "+91 98110 55219",
      email: "ananya.p@bridal-client.vip",
      address: "7 Pochkhanawala Road, Worli",
      city: "Mumbai",
      tags: ["Bridal HNW", "Salon-2", "Kundan Collector"],
    },
  ];

  for (const c of clients) {
    await pool.query(
      `INSERT INTO customers (id, organization_id, customer_code, first_name, last_name, email, phone, address_line1, city, country, tax_identifier, tags, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'IN', $9, $10, 'ACTIVE', NOW(), NOW())
       ON CONFLICT (organization_id, customer_code) DO NOTHING`,
      [
        orgId,
        c.code,
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.taxId,
        c.tags,
      ],
    );
  }

  // 7. Seed Physical 3-Tier Storage Hierarchy (INV-05, INV-17)
  // eslint-disable-next-line no-console
  console.log("[7/10] Seeding Physical Storage Hierarchy (Vaults, Lockers, Compartments)...");
  const storeInv11 = "0192e300-0001-7000-8000-000000000001";
  const vaults = [
    {
      id: "0192e350-0001-7000-8000-000000000001",
      code: "VLT-01",
      name: "Vault 01: Primary Bullion & Diamond Safe",
      type: "MAIN_VAULT",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000002",
      code: "VLT-02",
      name: "Vault 02: Retail Strongroom (High Turnaround POS Staging)",
      type: "SHOWROOM_SAFE",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000003",
      code: "VLT-03",
      name: "Vault 03: Analytical QC Lab & Assay Isolation Safe",
      type: "INTAKE_HOLDING",
      accessLevel: "STORE_MANAGER",
    },
  ];

  for (const v of vaults) {
    await pool.query(
      `INSERT INTO vaults (id, store_id, code, name, vault_type, access_level_required, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (store_id, code) DO NOTHING`,
      [v.id, storeInv11, v.code, v.name, v.type, v.accessLevel],
    );
  }

  const lockers = [
    {
      id: "0192e350-0002-7000-8000-000000000001",
      vaultId: "0192e350-0001-7000-8000-000000000001",
      code: "LCK-02",
      name: "Locker 02: High-Jewellery Trays",
      lockerNumber: "SAFE-B04",
      capacityRating: "Grade V Heavy Door • Biometric Armed",
    },
    {
      id: "0192e350-0002-7000-8000-000000000002",
      vaultId: "0192e350-0001-7000-8000-000000000001",
      code: "LCK-01",
      name: "Locker 01: Bullion Bars & Cast Ingots",
      lockerNumber: "SAFE-A01",
      capacityRating: "Grade VI Reinforced Vault Lock",
    },
    {
      id: "0192e350-0002-7000-8000-000000000004",
      vaultId: "0192e350-0001-7000-8000-000000000002",
      code: "LCK-04",
      name: "Locker 04: Counter A Showroom Trays",
      lockerNumber: "SAFE-D01",
      capacityRating: "Quick Turnaround Smart-Lock",
    },
    {
      id: "0192e350-0002-7000-8000-000000000005",
      vaultId: "0192e350-0001-7000-8000-000000000003",
      code: "LCK-05",
      name: "Locker 05: Inbound Quarantine Bay",
      lockerNumber: "QUAR-01",
      capacityRating: "Assay Quarantined",
    },
  ];

  for (const l of lockers) {
    await pool.query(
      `INSERT INTO lockers (id, vault_id, store_id, code, name, locker_number, capacity_rating, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (vault_id, code) DO NOTHING`,
      [l.id, l.vaultId, storeInv11, l.code, l.name, l.lockerNumber, l.capacityRating],
    );
  }

  const compartments = [
    // Under LCK-02 (High-Jewellery Trays)
    {
      id: "0192e350-0003-7000-8000-000000000001",
      lockerId: "0192e350-0002-7000-8000-000000000001",
      code: "COMP-02-A1",
      name: "Antique Kundan Necklaces",
      compartmentNumber: "A1",
      maxWeight: 5000,
      maxItems: 25,
    },
    {
      id: "0192e350-0003-7000-8000-000000000002",
      lockerId: "0192e350-0002-7000-8000-000000000001",
      code: "COMP-02-A2",
      name: "Bridal Diamond Sets",
      compartmentNumber: "A2",
      maxWeight: 5000,
      maxItems: 25,
    },
    {
      id: "0192e350-0003-7000-8000-000000000003",
      lockerId: "0192e350-0002-7000-8000-000000000001",
      code: "COMP-02-A3",
      name: "Platinum Brooches & Pins",
      compartmentNumber: "A3",
      maxWeight: 3000,
      maxItems: 25,
    },
    {
      id: "0192e350-0003-7000-8000-000000000004",
      lockerId: "0192e350-0002-7000-8000-000000000001",
      code: "COMP-02-B1",
      name: "Solitaire Rings & Pave Bands",
      compartmentNumber: "B1",
      maxWeight: 5000,
      maxItems: 20,
    },
    {
      id: "0192e350-0003-7000-8000-000000000005",
      lockerId: "0192e350-0002-7000-8000-000000000001",
      code: "COMP-02-B2",
      name: "Solitaire Pendants & Drops",
      compartmentNumber: "B2",
      maxWeight: 3000,
      maxItems: 20,
    },
    // Under LCK-01 (Bullion Bars)
    {
      id: "0192e350-0003-7000-8000-000000000010",
      lockerId: "0192e350-0002-7000-8000-000000000002",
      code: "COMP-01-A1",
      name: "Fine Gold Bullion 1kg Bars",
      compartmentNumber: "A1",
      maxWeight: 20000,
      maxItems: 20,
    },
    {
      id: "0192e350-0003-7000-8000-000000000011",
      lockerId: "0192e350-0002-7000-8000-000000000002",
      code: "COMP-01-A2",
      name: "Fine Silver 30kg Cast Bars",
      compartmentNumber: "A2",
      maxWeight: 60000,
      maxItems: 10,
    },
    // Under LCK-04 (Counter A Showroom)
    {
      id: "0192e350-0003-7000-8000-000000000020",
      lockerId: "0192e350-0002-7000-8000-000000000004",
      code: "COMP-04-A1",
      name: "Showcase Gold Rings",
      compartmentNumber: "D1",
      maxWeight: 4000,
      maxItems: 30,
    },
    // Under LCK-05 (Inbound Quarantine)
    {
      id: "0192e350-0003-7000-8000-000000000030",
      lockerId: "0192e350-0002-7000-8000-000000000005",
      code: "COMP-05-Q1",
      name: "Ingot Intake Inspection Holding",
      compartmentNumber: "Q1",
      maxWeight: 10000,
      maxItems: 15,
    },
  ];

  for (const comp of compartments) {
    await pool.query(
      `INSERT INTO compartments (id, locker_id, store_id, code, name, compartment_number, max_weight_capacity_grams, max_item_capacity, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
       ON CONFLICT (locker_id, code) DO NOTHING`,
      [
        comp.id,
        comp.lockerId,
        storeInv11,
        comp.code,
        comp.name,
        comp.compartmentNumber,
        comp.maxWeight,
        comp.maxItems,
      ],
    );
  }

  // 8. Seed Procurement Suppliers Master (FEAT-PROC-01)
  // eslint-disable-next-line no-console
  console.log("[8/10] Seeding Procurement Suppliers Directory...");
  const suppliers = [
    {
      id: "0192e300-0010-7000-8000-000000000001",
      code: "SUP-01",
      name: "Valcambi Suisse LBMA Refinery",
      contactName: "Jean-Luc Moreau",
      email: "contact@valcambi.internal",
      phone: "+41 91 695 5111",
      taxId: "CHE-101.442.901",
      currency: "INR",
      terms: "NET_30",
    },
    {
      id: "0192e300-0010-7000-8000-000000000002",
      code: "SUP-02",
      name: "MMTC-PAMP India Bullion Refinery",
      contactName: "Rajesh Sharma",
      email: "procurement@mmtcpamp.internal",
      phone: "+91 124 496 1100",
      taxId: "06AAACM4421P1Z0",
      currency: "INR",
      terms: "ADVANCE",
    },
    {
      id: "0192e300-0010-7000-8000-000000000003",
      code: "SUP-03",
      name: "De Beers Diamond Sight-Holders",
      contactName: "Alistair Finch",
      email: "gemstone.trade@debeers.internal",
      phone: "+44 20 7404 4444",
      taxId: "GB243009122",
      currency: "INR",
      terms: "LETTER_OF_CREDIT",
    },
  ];

  for (const sup of suppliers) {
    await pool.query(
      `INSERT INTO suppliers (id, organization_id, code, name, contact_name, email, phone, tax_identifier, currency_code, payment_terms, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
       ON CONFLICT (organization_id, code) DO NOTHING`,
      [
        sup.id,
        orgId,
        sup.code,
        sup.name,
        sup.contactName,
        sup.email,
        sup.phone,
        sup.taxId,
        sup.currency,
        sup.terms,
      ],
    );
  }

  // 9. Seed Taxonomy Categories, Subcategories, Gemstones, Products & SKUs
  // eslint-disable-next-line no-console
  console.log("[9/10] Seeding Taxonomy Catalog (Categories, Products, SKUs)...");
  const categories = [
    {
      id: "0192e300-0020-7000-8000-000000000001",
      code: "CAT-RNG",
      name: "Rings",
      desc: "Solitaire, bridal and eternity finger rings",
    },
    {
      id: "0192e300-0020-7000-8000-000000000002",
      code: "CAT-NCK",
      name: "Necklaces & Chokers",
      desc: "High jewellery chokers, necklaces, and pendants",
    },
    {
      id: "0192e300-0020-7000-8000-000000000003",
      code: "CAT-BNG",
      name: "Bangles & Kadas",
      desc: "Tennis bangles, kadas, and cuff bracelets",
    },
    {
      id: "0192e300-0020-7000-8000-000000000004",
      code: "CAT-BUL",
      name: "Bullion & Coins",
      desc: "Investment grade cast bars and minted coins",
    },
  ];

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (id, organization_id, code, name, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (organization_id, code) DO NOTHING`,
      [cat.id, orgId, cat.code, cat.name, cat.desc],
    );
  }

  const subcategories = [
    {
      id: "0192e300-0021-7000-8000-000000000001",
      catId: "0192e300-0020-7000-8000-000000000001",
      code: "SUB-SOL-RNG",
      name: "Solitaire Rings",
      desc: "Single stone statement rings",
    },
    {
      id: "0192e300-0021-7000-8000-000000000002",
      catId: "0192e300-0020-7000-8000-000000000002",
      code: "SUB-CAS-NCK",
      name: "Cascading Necklaces",
      desc: "Diamond and gold multi-tier chokers",
    },
    {
      id: "0192e300-0021-7000-8000-000000000003",
      catId: "0192e300-0020-7000-8000-000000000003",
      code: "SUB-TNS-BNG",
      name: "Tennis Bangles",
      desc: "Eternity micro-prong continuous bracelets",
    },
    {
      id: "0192e300-0021-7000-8000-000000000004",
      catId: "0192e300-0020-7000-8000-000000000004",
      code: "SUB-BAR-BUL",
      name: "Investment Cast Bars",
      desc: "LBMA stamped fine gold bars",
    },
  ];

  for (const sub of subcategories) {
    await pool.query(
      `INSERT INTO subcategories (id, category_id, code, name, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       ON CONFLICT (category_id, code) DO NOTHING`,
      [sub.id, sub.catId, sub.code, sub.name, sub.desc],
    );
  }

  const gemstones = [
    {
      id: "0192e300-0025-7000-8000-000000000001",
      code: "GEM-DIA",
      name: "Natural Diamond",
      type: "PRECIOUS",
    },
    {
      id: "0192e300-0025-7000-8000-000000000002",
      code: "GEM-RUB",
      name: "Burmese Ruby",
      type: "PRECIOUS",
    },
    {
      id: "0192e300-0025-7000-8000-000000000003",
      code: "GEM-EMR",
      name: "Zambian Emerald",
      type: "PRECIOUS",
    },
  ];

  for (const gem of gemstones) {
    await pool.query(
      `INSERT INTO gemstones (id, organization_id, code, name, gemstone_type, default_measurement_unit, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'CARAT', true, NOW(), NOW())
       ON CONFLICT (organization_id, code) DO NOTHING`,
      [gem.id, orgId, gem.code, gem.name, gem.type],
    );
  }

  const goldMatId = "0192e300-0005-7000-8000-000000000001";
  const purity18kId = "0192e300-0006-7000-8000-000000000003";
  const purity24kId = "0192e300-0006-7000-8000-000000000001";

  const products = [
    {
      id: "0192e300-0030-7000-8000-000000000001",
      catId: "0192e300-0020-7000-8000-000000000001",
      subId: "0192e300-0021-7000-8000-000000000001",
      purityId: purity18kId,
      code: "PRD-SOL-01",
      name: "Oval Solitaire Diamond Ring",
      desc: "Iconic 4-prong claw oval solitaire in 18K gold",
      collection: "Solitaire Icons",
    },
    {
      id: "0192e300-0030-7000-8000-000000000002",
      catId: "0192e300-0020-7000-8000-000000000002",
      subId: "0192e300-0021-7000-8000-000000000002",
      purityId: purity18kId,
      code: "PRD-CHK-01",
      name: "Waterfall Cascading Diamond Necklace",
      desc: "Multi-row graduated diamond necklace in 18K gold",
      collection: "Royal Bridal",
    },
    {
      id: "0192e300-0030-7000-8000-000000000003",
      catId: "0192e300-0020-7000-8000-000000000003",
      subId: "0192e300-0021-7000-8000-000000000003",
      purityId: purity18kId,
      code: "PRD-TNS-01",
      name: "Micro-Prong Tennis Bangle",
      desc: "Seamless micro-prong round brilliant bracelet",
      collection: "Everyday Haute",
    },
    {
      id: "0192e300-0030-7000-8000-000000000004",
      catId: "0192e300-0020-7000-8000-000000000004",
      subId: "0192e300-0021-7000-8000-000000000004",
      purityId: purity24kId,
      code: "PRD-BAR-01",
      name: "Cast Fine Gold Ingot 1kg",
      desc: "LBMA accredited 999.9 serialized investment bar",
      collection: "Treasury Bullion",
    },
  ];

  for (const prd of products) {
    await pool.query(
      `INSERT INTO products (id, organization_id, category_id, subcategory_id, material_id, default_purity_id, product_code, name, description, collection, default_tracking_type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'SERIALIZED', true, NOW(), NOW())
       ON CONFLICT (organization_id, product_code) DO NOTHING`,
      [
        prd.id,
        orgId,
        prd.catId,
        prd.subId,
        goldMatId,
        prd.purityId,
        prd.code,
        prd.name,
        prd.desc,
        prd.collection,
      ],
    );
  }

  const skus = [
    {
      id: "0192e300-0031-7000-8000-000000000001",
      productId: "0192e300-0030-7000-8000-000000000001",
      code: "SKU-SOL-18KW-150",
      variantName: "18K White Gold Oval Solitaire Ring 1.5ct",
      purityId: purity18kId,
      grossWeight: 5.42,
      metalWeight: 5.116,
    },
    {
      id: "0192e300-0031-7000-8000-000000000002",
      productId: "0192e300-0030-7000-8000-000000000002",
      code: "SKU-CHK-18KR-185",
      variantName: "18K Rose Gold Waterfall Necklace 18.5ct",
      purityId: purity18kId,
      grossWeight: 68.3,
      metalWeight: 52.1,
    },
    {
      id: "0192e300-0031-7000-8000-000000000003",
      productId: "0192e300-0030-7000-8000-000000000003",
      code: "SKU-TNS-18KW-520",
      variantName: "18K White Gold Micro-Prong Tennis Bangle 5.2ct",
      purityId: purity18kId,
      grossWeight: 28.6,
      metalWeight: 27.56,
    },
    {
      id: "0192e300-0031-7000-8000-000000000004",
      productId: "0192e300-0030-7000-8000-000000000004",
      code: "SKU-BAR-24K-1000",
      variantName: "24K Fine Gold Cast Ingot 1000g",
      purityId: purity24kId,
      grossWeight: 1000.0,
      metalWeight: 1000.0,
    },
  ];

  for (const sku of skus) {
    await pool.query(
      `INSERT INTO product_skus (id, organization_id, product_id, sku_code, variant_name, target_purity_id, target_gross_weight_grams, target_metal_weight_grams, tracking_type, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SERIALIZED', true, NOW(), NOW())
       ON CONFLICT (organization_id, sku_code) DO NOTHING`,
      [
        sku.id,
        orgId,
        sku.productId,
        sku.code,
        sku.variantName,
        sku.purityId,
        sku.grossWeight,
        sku.metalWeight,
      ],
    );
  }

  // 10. Seed Making Charges & Pricing Policies (FEAT-PRICE-02)
  // eslint-disable-next-line no-console
  console.log("[10/10] Seeding Making Charge Rules & Pricing Policies...");
  const policies = [
    {
      id: "0192e300-0040-7000-8000-000000000001",
      catId: "0192e300-0020-7000-8000-000000000001",
      name: "Atelier High-Jewellery Solitaire Policy",
      chargeType: "PER_GRAM",
      rate: 650.0,
      wastage: 0.02,
      margin: 0.15,
    },
    {
      id: "0192e300-0040-7000-8000-000000000002",
      catId: "0192e300-0020-7000-8000-000000000002",
      name: "Atelier Bridal Cascading Suite Policy",
      chargeType: "PERCENTAGE_OF_METAL",
      rate: 0.18,
      wastage: 0.025,
      margin: 0.2,
    },
    {
      id: "0192e300-0040-7000-8000-000000000003",
      catId: "0192e300-0020-7000-8000-000000000004",
      name: "Investment Bullion Cast Bar Policy",
      chargeType: "PER_GRAM",
      rate: 45.0,
      wastage: 0.002,
      margin: 0.03,
    },
  ];

  for (const pol of policies) {
    await pool.query(
      `INSERT INTO pricing_policies (id, organization_id, store_id, category_id, policy_name, charge_type, charge_rate, wastage_percentage, default_margin_percentage, is_active, effective_from, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        pol.id,
        orgId,
        storeInv11,
        pol.catId,
        pol.name,
        pol.chargeType,
        pol.rate,
        pol.wastage,
        pol.margin,
      ],
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    "=== [JewelCore ERP] Showroom Database Seeding Successfully Completed ===",
  );
}

// Allow direct CLI execution: `node --loader tsx src/seed/showroomSeeder.ts`
if (
  process.argv[1]?.endsWith("showroomSeeder.ts") ||
  process.argv[1]?.endsWith("showroomSeeder.js")
) {
  seedShowroomDatabase()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      // eslint-disable-next-line no-console
      console.error("[JewelCore ERP Seeder] Fatal Error:", err);
      await closePool();
      process.exit(1);
    });
}
