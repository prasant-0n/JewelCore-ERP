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
