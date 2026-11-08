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
  // Seeded Argon2id hash for default password: JewelCore@2026
  const dummyHash =
    "$argon2id$v=19$m=19456,t=2,p=1$boXwNYA3SipXVGifZ89rnA$DjAB+4iNmKdglnBDOUWafz4rOOYj61kjm/IvHIjGBi0";
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
      id: "0192e300-0080-7000-8000-000000000001",
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
      id: "0192e300-0080-7000-8000-000000000002",
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
      id: "0192e300-0080-7000-8000-000000000003",
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'IN', $10, $11, 'ACTIVE', NOW(), NOW())
       ON CONFLICT (organization_id, customer_code) DO UPDATE
       SET id = EXCLUDED.id,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           tax_identifier = EXCLUDED.tax_identifier,
           tags = EXCLUDED.tags`,
      [
        c.id,
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
  const storeVault01 = "0192e300-0001-7000-8000-000000000002";
  const storeShow02 = "0192e300-0001-7000-8000-000000000003";

  const vaults = [
    {
      id: "0192e350-0001-7000-8000-000000000001",
      storeId: storeInv11,
      code: "VLT-01",
      name: "Vault 01: Primary Bullion & Diamond Safe",
      type: "MAIN_VAULT",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000002",
      storeId: storeInv11,
      code: "VLT-02",
      name: "Vault 02: Retail Strongroom (High Turnaround POS Staging)",
      type: "SHOWROOM_SAFE",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000003",
      storeId: storeInv11,
      code: "VLT-03",
      name: "Vault 03: Analytical QC Lab & Assay Isolation Safe",
      type: "INTAKE_HOLDING",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000011",
      storeId: storeVault01,
      code: "VLT-HUB-01",
      name: "Central Treasury Bullion Reserve Strongroom",
      type: "MAIN_VAULT",
      accessLevel: "STORE_MANAGER",
    },
    {
      id: "0192e350-0001-7000-8000-000000000021",
      storeId: storeShow02,
      code: "VLT-UPT-01",
      name: "Uptown Strongroom Safe",
      type: "SHOWROOM_SAFE",
      accessLevel: "STORE_MANAGER",
    },
  ];

  for (const v of vaults) {
    await pool.query(
      `INSERT INTO vaults (id, store_id, code, name, vault_type, access_level_required, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (store_id, code) DO NOTHING`,
      [v.id, v.storeId, v.code, v.name, v.type, v.accessLevel],
    );
  }

  const lockers = [
    {
      id: "0192e350-0002-7000-8000-000000000001",
      vaultId: "0192e350-0001-7000-8000-000000000001",
      storeId: storeInv11,
      code: "LCK-02",
      name: "Locker 02: High-Jewellery Trays",
      lockerNumber: "SAFE-B04",
      capacityRating: "Grade V Heavy Door • Biometric Armed",
    },
    {
      id: "0192e350-0002-7000-8000-000000000002",
      vaultId: "0192e350-0001-7000-8000-000000000001",
      storeId: storeInv11,
      code: "LCK-01",
      name: "Locker 01: Bullion Bars & Cast Ingots",
      lockerNumber: "SAFE-A01",
      capacityRating: "Grade VI Reinforced Vault Lock",
    },
    {
      id: "0192e350-0002-7000-8000-000000000004",
      vaultId: "0192e350-0001-7000-8000-000000000002",
      storeId: storeInv11,
      code: "LCK-04",
      name: "Locker 04: Counter A Showroom Trays",
      lockerNumber: "SAFE-D01",
      capacityRating: "Quick Turnaround Smart-Lock",
    },
    {
      id: "0192e350-0002-7000-8000-000000000005",
      vaultId: "0192e350-0001-7000-8000-000000000003",
      storeId: storeInv11,
      code: "LCK-05",
      name: "Locker 05: Inbound Quarantine Bay",
      lockerNumber: "QUAR-01",
      capacityRating: "Assay Quarantined",
    },
    {
      id: "0192e350-0002-7000-8000-000000000011",
      vaultId: "0192e350-0001-7000-8000-000000000011",
      storeId: storeVault01,
      code: "LCK-HUB-01",
      name: "Bullion Ingot Staging Rack",
      lockerNumber: "RACK-01",
      capacityRating: "Grade VII High-Security Rack",
    },
    {
      id: "0192e350-0002-7000-8000-000000000021",
      vaultId: "0192e350-0001-7000-8000-000000000021",
      storeId: storeShow02,
      code: "LCK-UPT-01",
      name: "Diamond Salon Showcase Safe",
      lockerNumber: "SAFE-U01",
      capacityRating: "Showroom Vault Quick-Lock",
    },
  ];

  for (const l of lockers) {
    await pool.query(
      `INSERT INTO lockers (id, vault_id, store_id, code, name, locker_number, capacity_rating, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
       ON CONFLICT (vault_id, code) DO NOTHING`,
      [l.id, l.vaultId, l.storeId, l.code, l.name, l.lockerNumber, l.capacityRating],
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
      storeId: storeInv11,
      code: "COMP-05-Q1",
      name: "Ingot Intake Inspection Holding",
      compartmentNumber: "Q1",
      maxWeight: 10000,
      maxItems: 15,
    },
    // Under LCK-HUB-01 (Treasury Ingot Staging Rack)
    {
      id: "0192e350-0003-7000-8000-000000000050",
      lockerId: "0192e350-0002-7000-8000-000000000011",
      storeId: storeVault01,
      code: "COMP-HUB-01",
      name: "Valcambi Good Delivery Cast Bars",
      compartmentNumber: "T1",
      maxWeight: 50000,
      maxItems: 50,
    },
    // Under LCK-UPT-01 (Uptown Diamond Showcase)
    {
      id: "0192e350-0003-7000-8000-000000000060",
      lockerId: "0192e350-0002-7000-8000-000000000021",
      storeId: storeShow02,
      code: "COMP-UPT-01",
      name: "High-Carat Solitaires Showcase",
      compartmentNumber: "U1",
      maxWeight: 5000,
      maxItems: 30,
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
        comp.storeId || storeInv11,
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

  // 11. Seed Inbound GRN, Shipment, Technical QC, and Serialized Physical Pieces (FEAT-INV-01)
  // eslint-disable-next-line no-console
  console.log("[11/11] Seeding Inbound GRN, QC Approval Lineage & Serialized Showroom Pieces...");
  const grnId = "0192e300-0050-7000-8000-000000000001";
  await pool.query(
    `INSERT INTO goods_receipt_notes (id, organization_id, store_id, supplier_id, grn_number, status, supplier_invoice_number, received_date, created_by_user_id, version, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'GRN-2026-0842', 'RECEIVED', 'INV-VAL-90412', NOW(), $5, 1, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [grnId, orgId, storeInv11, "0192e300-0010-7000-8000-000000000001", adminId],
  );

  const shipmentId = "0192e300-0051-7000-8000-000000000001";
  await pool.query(
    `INSERT INTO shipments (id, goods_receipt_note_id, shipment_number, carrier_name, tracking_number, declared_package_count, received_package_count, status, received_at, received_by_user_id, created_at, updated_at)
     VALUES ($1, $2, 'SHP-2026-0842', 'Brinks Armored Logistics', 'LX-94022', 1, 1, 'RECEIVED', NOW(), $3, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [shipmentId, grnId, adminId],
  );

  const shipmentItems = [
    {
      id: "0192e300-0052-7000-8000-000000000001",
      skuId: "0192e300-0031-7000-8000-000000000001",
      line: 1,
      supplierCode: "VAL-SOL-081",
      gross: 5.42,
      net: 5.116,
    },
    {
      id: "0192e300-0052-7000-8000-000000000002",
      skuId: "0192e300-0031-7000-8000-000000000002",
      line: 2,
      supplierCode: "VAL-CHK-015",
      gross: 68.3,
      net: 52.1,
    },
    {
      id: "0192e300-0052-7000-8000-000000000003",
      skuId: "0192e300-0031-7000-8000-000000000003",
      line: 3,
      supplierCode: "VAL-KAD-005",
      gross: 28.6,
      net: 27.56,
    },
    {
      id: "0192e300-0052-7000-8000-000000000004",
      skuId: "0192e300-0031-7000-8000-000000000003",
      line: 4,
      supplierCode: "VAL-KAD-042",
      gross: 88.5,
      net: 86.2,
    },
    {
      id: "0192e300-0052-7000-8000-000000000011",
      skuId: "0192e300-0031-7000-8000-000000000004",
      line: 5,
      supplierCode: "VAL-BAR-01",
      gross: 1000.042,
      net: 1000.042,
    },
    {
      id: "0192e300-0052-7000-8000-000000000012",
      skuId: "0192e300-0031-7000-8000-000000000004",
      line: 6,
      supplierCode: "VAL-BAR-02",
      gross: 1000.038,
      net: 1000.038,
    },
    {
      id: "0192e300-0052-7000-8000-000000000021",
      skuId: "0192e300-0031-7000-8000-000000000001",
      line: 7,
      supplierCode: "VAL-SOL-082",
      gross: 6.84,
      net: 6.438,
    },
    {
      id: "0192e300-0052-7000-8000-000000000022",
      skuId: "0192e300-0031-7000-8000-000000000002",
      line: 8,
      supplierCode: "VAL-CHK-014",
      gross: 54.2,
      net: 46.85,
    },
  ];

  for (const si of shipmentItems) {
    await pool.query(
      `INSERT INTO shipment_items (id, shipment_id, product_sku_id, line_number, supplier_item_code, declared_piece_count, received_piece_count, declared_gross_weight_grams, measured_gross_weight_grams, declared_net_weight_grams, reconciliation_status, version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 1, 1, $6, $6, $7, 'MATCHED', 1, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [si.id, shipmentId, si.skuId, si.line, si.supplierCode, si.gross, si.net],
    );
  }

  const qcId = "0192e300-0053-7000-8000-000000000001";
  await pool.query(
    `INSERT INTO quality_checks (id, shipment_id, store_id, inspector_user_id, session_sequence_number, status, inspection_type, started_at, completed_at, version, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 1, 'APPROVED', 'INITIAL_INTAKE', NOW(), NOW(), 1, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [qcId, shipmentId, storeInv11, adminId],
  );

  const qcItems = [
    {
      id: "0192e300-0054-7000-8000-000000000001",
      shipmentItemId: "0192e300-0052-7000-8000-000000000001",
      seq: 1,
      gross: 5.42,
      net: 5.116,
      stoneCarat: 1.52,
    },
    {
      id: "0192e300-0054-7000-8000-000000000002",
      shipmentItemId: "0192e300-0052-7000-8000-000000000002",
      seq: 2,
      gross: 68.3,
      net: 52.1,
      stoneCarat: 18.5,
    },
    {
      id: "0192e300-0054-7000-8000-000000000003",
      shipmentItemId: "0192e300-0052-7000-8000-000000000003",
      seq: 3,
      gross: 28.6,
      net: 27.56,
      stoneCarat: 5.2,
    },
    {
      id: "0192e300-0054-7000-8000-000000000004",
      shipmentItemId: "0192e300-0052-7000-8000-000000000004",
      seq: 4,
      gross: 88.5,
      net: 86.2,
      stoneCarat: 0.0,
    },
    {
      id: "0192e300-0054-7000-8000-000000000011",
      shipmentItemId: "0192e300-0052-7000-8000-000000000011",
      seq: 5,
      gross: 1000.042,
      net: 1000.042,
      stoneCarat: 0.0,
    },
    {
      id: "0192e300-0054-7000-8000-000000000012",
      shipmentItemId: "0192e300-0052-7000-8000-000000000012",
      seq: 6,
      gross: 1000.038,
      net: 1000.038,
      stoneCarat: 0.0,
    },
    {
      id: "0192e300-0054-7000-8000-000000000021",
      shipmentItemId: "0192e300-0052-7000-8000-000000000021",
      seq: 7,
      gross: 6.84,
      net: 6.438,
      stoneCarat: 2.01,
    },
    {
      id: "0192e300-0054-7000-8000-000000000022",
      shipmentItemId: "0192e300-0052-7000-8000-000000000022",
      seq: 8,
      gross: 54.2,
      net: 46.85,
      stoneCarat: 6.5,
    },
  ];

  for (const qci of qcItems) {
    await pool.query(
      `INSERT INTO quality_check_items (id, quality_check_id, shipment_item_id, item_sequence_number, status, verified_material_id, verified_purity_id, gross_weight_grams, net_weight_grams, stone_weight_carats, hallmark_verified, visual_inspection_passed, damage_detected, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'APPROVED', $5, $6, $7, $8, $9, true, true, false, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        qci.id,
        qcId,
        qci.shipmentItemId,
        qci.seq,
        goldMatId,
        purity18kId,
        qci.gross,
        qci.net,
        qci.stoneCarat,
      ],
    );
  }

  const inventoryPieces = [
    // INV-11: Downtown Showroom Floor Pieces
    {
      id: "0192e300-0060-7000-8000-000000000001",
      storeId: storeInv11,
      skuId: "0192e300-0031-7000-8000-000000000001",
      qcItemId: "0192e300-0054-7000-8000-000000000001",
      purityId: purity18kId,
      serial: "JC-SOL-2026-081",
      name: "18K Oval Solitaire Diamond Ring (1.52ct F-VVS1)",
      gross: 5.42,
      net: 5.116,
      price: 485000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000020",
      epc: "EPC-E280-1160-9941",
    },
    {
      id: "0192e300-0060-7000-8000-000000000002",
      storeId: storeInv11,
      skuId: "0192e300-0031-7000-8000-000000000002",
      qcItemId: "0192e300-0054-7000-8000-000000000002",
      purityId: purity18kId,
      serial: "JC-CHK-2026-015",
      name: "18K Rose Gold Waterfall Cascading Necklace (18.5ct)",
      gross: 68.3,
      net: 52.1,
      price: 1850000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000002",
      epc: "EPC-E280-1160-8813",
    },
    {
      id: "0192e300-0060-7000-8000-000000000003",
      storeId: storeInv11,
      skuId: "0192e300-0031-7000-8000-000000000003",
      qcItemId: "0192e300-0054-7000-8000-000000000003",
      purityId: purity18kId,
      serial: "JC-KAD-2026-005",
      name: "18K White Gold Micro-Prong Tennis Bangle (5.20ct)",
      gross: 28.6,
      net: 27.56,
      price: 625000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000004",
      epc: "EPC-E280-1160-7714",
    },
    {
      id: "0192e300-0060-7000-8000-000000000004",
      storeId: storeInv11,
      skuId: "0192e300-0031-7000-8000-000000000003",
      qcItemId: "0192e300-0054-7000-8000-000000000004",
      purityId: purity18kId,
      serial: "JC-BAN-2026-042",
      name: "22K Temple Filigree Peacock Kada Pair",
      gross: 88.5,
      net: 86.2,
      price: 715000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000004",
      epc: "EPC-E280-1160-7715",
    },
    // VAULT-01: Central Treasury Vault Hub Bullion
    {
      id: "0192e300-0060-7000-8000-000000000011",
      storeId: storeVault01,
      skuId: "0192e300-0031-7000-8000-000000000004",
      qcItemId: "0192e300-0054-7000-8000-000000000011",
      purityId: purity24kId,
      serial: "VAL-BAR-01",
      name: "999.9 Fine Gold Cast Ingot (1000g LBMA Good Delivery)",
      gross: 1000.042,
      net: 1000.042,
      price: 7450312.0,
      compartmentId: "0192e350-0003-7000-8000-000000000050",
      epc: "EPC-VAL-BAR-01-UHF",
    },
    {
      id: "0192e300-0060-7000-8000-000000000012",
      storeId: storeVault01,
      skuId: "0192e300-0031-7000-8000-000000000004",
      qcItemId: "0192e300-0054-7000-8000-000000000012",
      purityId: purity24kId,
      serial: "VAL-BAR-02",
      name: "999.9 Fine Gold Cast Ingot (1000g LBMA Good Delivery)",
      gross: 1000.038,
      net: 1000.038,
      price: 7450283.0,
      compartmentId: "0192e350-0003-7000-8000-000000000050",
      epc: "EPC-VAL-BAR-02-UHF",
    },
    // SHOW-02: Uptown Luxury Boutique Pieces
    {
      id: "0192e300-0060-7000-8000-000000000021",
      storeId: storeShow02,
      skuId: "0192e300-0031-7000-8000-000000000001",
      qcItemId: "0192e300-0054-7000-8000-000000000021",
      purityId: purity18kId,
      serial: "JC-SOL-2026-082",
      name: "18K Yellow Gold Cushion Halo Ring (2.01ct D-VVS2)",
      gross: 6.84,
      net: 6.438,
      price: 890000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000060",
      epc: "EPC-E280-1160-9942",
    },
    {
      id: "0192e300-0060-7000-8000-000000000022",
      storeId: storeShow02,
      skuId: "0192e300-0031-7000-8000-000000000002",
      qcItemId: "0192e300-0054-7000-8000-000000000022",
      purityId: purity18kId,
      serial: "JC-CHK-2026-014",
      name: "22K Antique Heritage Jadau Polki Choker",
      gross: 54.2,
      net: 46.85,
      price: 1250000.0,
      compartmentId: "0192e350-0003-7000-8000-000000000060",
      epc: "EPC-E280-1160-8814",
    },
  ];

  for (const piece of inventoryPieces) {
    await pool.query(
      `INSERT INTO inventory_items (id, organization_id, store_id, product_sku_id, quality_check_item_id, serial_number, item_name, gross_weight_grams, net_weight_grams, purity_id, quality_state, approval_state, custody_state, commercial_state, current_compartment_id, selling_price_cad, version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'QC_APPROVED', 'APPROVED', 'IN_DISPLAY', 'AVAILABLE_FOR_SALE', $11, $12, 1, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        piece.id,
        orgId,
        piece.storeId,
        piece.skuId,
        piece.qcItemId,
        piece.serial,
        piece.name,
        piece.gross,
        piece.net,
        piece.purityId,
        piece.compartmentId,
        piece.price,
      ],
    );

    const tagId = `0192e300-0070-7000-8000-${piece.id.slice(-12)}`;
    await pool.query(
      `INSERT INTO rfid_tags (id, organization_id, epc, status, frequency_band, created_at, updated_at)
       VALUES ($1, $2, $3, 'ACTIVE', 'UHF_860_960_MHZ', NOW(), NOW())
       ON CONFLICT (organization_id, epc) DO NOTHING`,
      [tagId, orgId, piece.epc],
    );

    await pool.query(
      `INSERT INTO rfid_tag_assignments (id, organization_id, inventory_item_id, rfid_tag_id, status, assigned_by_user_id, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'ACTIVE', $4, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [orgId, piece.id, tagId, adminId],
    );
  }

  // 12. Seed Inter-Store Armored Transit Orders & Dual-Custody Manifests
  // eslint-disable-next-line no-console
  console.log("[12/13] Seeding Inter-Store Armored Transit Orders & Dual-Custody Manifests...");
  const transferOrders = [
    {
      id: "0192e300-0090-7000-8000-000000000001",
      orderNumber: "TR-2026-8801",
      sourceStoreId: storeVault01,
      destinationStoreId: storeInv11,
      status: "IN_TRANSIT",
      priority: "HIGH",
      notes: "Armored bullion replenishment consignment via Brinks Van #BR-09",
      manifest: {
        id: "0192e300-0091-7000-8000-000000000001",
        manifestNumber: "MNF-2026-0881",
        carrierName: "Brinks India Armored Logistics",
        trackingNumber: "BR-LX-94022",
        sealNumber: "TS-8821",
      },
    },
    {
      id: "0192e300-0090-7000-8000-000000000002",
      orderNumber: "TR-2026-8802",
      sourceStoreId: storeVault01,
      destinationStoreId: storeShow02,
      status: "COMPLETED",
      priority: "NORMAL",
      notes: "High-value Solitaire and Polki boutique consignment to Bandra Pavilion",
      manifest: {
        id: "0192e300-0091-7000-8000-000000000002",
        manifestNumber: "MNF-2026-0882",
        carrierName: "SecureCorp Vault Transit Escort",
        trackingNumber: "SC-CH-22198",
        sealNumber: "TS-8825",
      },
    },
  ];

  for (const t of transferOrders) {
    await pool.query(
      `INSERT INTO transfer_orders (id, organization_id, order_number, source_store_id, destination_store_id, status, priority, requested_by_user_id, approved_by_user_id, notes, approved_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
       ON CONFLICT (organization_id, order_number) DO NOTHING`,
      [
        t.id,
        orgId,
        t.orderNumber,
        t.sourceStoreId,
        t.destinationStoreId,
        t.status,
        t.priority,
        adminId,
        "0192e300-0002-7000-8000-000000000002", // Vikram M.
        t.notes,
      ],
    );

    await pool.query(
      `INSERT INTO transfer_manifests (id, organization_id, manifest_number, transfer_order_id, dispatcher_user_id, witness_user_id, carrier_name, tracking_number, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DISPATCHED', $9, NOW())
       ON CONFLICT (organization_id, manifest_number) DO NOTHING`,
      [
        t.manifest.id,
        orgId,
        t.manifest.manifestNumber,
        t.id,
        adminId,
        "0192e300-0002-7000-8000-000000000002",
        t.manifest.carrierName,
        t.manifest.trackingNumber,
        t.notes,
      ],
    );

    await pool.query(
      `INSERT INTO security_seals (id, organization_id, transfer_manifest_id, seal_number, seal_type, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'SECURITY_BAG', 'ATTACHED', NOW())
       ON CONFLICT DO NOTHING`,
      [orgId, t.manifest.id, t.manifest.sealNumber],
    );
  }

  // 13. Seed Tamper-Evident Merkle Audit Trail Records (INV-09, FEAT-GOV-02)
  // eslint-disable-next-line no-console
  console.log("[13/13] Seeding Cryptographic Merkle Audit Trail Records...");
  const auditEvents = [
    {
      id: "0192e300-0095-7000-8000-000000000001",
      storeId: storeVault01,
      action: "PROCUREMENT_GRN_ACCEPTED",
      resourceType: "procurement_grns",
      resourceId: "0192e300-0050-7000-8000-000000000001",
      reason: "Valcambi LBMA 3000g Good Delivery Bar Inward Accepted",
      payload: { supplier: "Valcambi Suisse", barsCount: 3, declaredWeight: 3000.0, seal: "TS-8821" },
    },
    {
      id: "0192e300-0095-7000-8000-000000000002",
      storeId: storeInv11,
      action: "METALLURGICAL_ASSAY_PASSED",
      resourceType: "quality_checks",
      resourceId: "0192e300-0053-7000-8000-000000000001",
      reason: "XRF Spectrometry certified 99.98% Au fine purity",
      payload: { instrument: "Thermo Niton XL5 Plus", auPurity: 99.98, iso17025Calibrated: true },
    },
    {
      id: "0192e300-0095-7000-8000-000000000003",
      storeId: storeInv11,
      action: "PIECE_GENESIS_BIRTHED",
      resourceType: "inventory_items",
      resourceId: "0192e300-0060-7000-8000-000000000001",
      reason: "Piece JC-SOL-2026-081 registered in lineage master ledger",
      payload: { serial: "JC-SOL-2026-081", grossWeight: 5.42, giaCert: "GIA-2210894511" },
    },
    {
      id: "0192e300-0095-7000-8000-000000000004",
      storeId: storeInv11,
      action: "UHF_RFID_TAG_COMMISSIONED",
      resourceType: "rfid_tags",
      resourceId: "0192e300-0070-7000-8000-000000000001",
      reason: "EPC Gen2 Tag EPC-E280-1160-9941 encoded and thermal printed",
      payload: { epc: "EPC-E280-1160-9941", reader: "Impinj Speedway R420", port: 1 },
    },
    {
      id: "0192e300-0095-7000-8000-000000000005",
      storeId: storeInv11,
      action: "DUAL_CONTROL_QUORUM_UNLATCHED",
      resourceType: "stock_approvals",
      resourceId: "0192e300-0060-7000-8000-000000000001",
      reason: "SmartCard Key 1 and Key 2 dual-sign authorized release to salon floor",
      payload: { signatoryKey1: "Rachel R. (Store Manager)", signatoryKey2: "Vikram M. (Compliance Officer)" },
    },
  ];

  for (const a of auditEvents) {
    await pool.query(
      `INSERT INTO audit_events (id, organization_id, store_id, actor_user_id, actor_ip_address, action, resource_type, resource_id, payload_after_json, reason, occurred_at, created_at)
       VALUES ($1, $2, $3, $4, '127.0.0.1', $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        orgId,
        a.storeId,
        adminId,
        a.action,
        a.resourceType,
        a.resourceId,
        JSON.stringify(a.payload),
        a.reason,
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
