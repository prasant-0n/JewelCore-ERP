import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { runAllMigrations, closePool, loadDatabaseConfig } from "../src/index.js";

const execFileAsync = promisify(execFile);

describe("PostgreSQL Automated Disaster Recovery & AES-256 Encryption Drill (Pathway D)", () => {
  let tmpDir: string;
  const testEncryptionKey = "test_super_secret_aes256_passphrase_2026";
  const dbConfig = loadDatabaseConfig();
  const pgHost = dbConfig.host;
  const pgPort = String(dbConfig.port);
  const pgUser = dbConfig.user;
  const pgPassword = dbConfig.password;
  const pgDatabase = dbConfig.database;

  beforeAll(async () => {
    await runAllMigrations();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "jewelcore-dr-drill-"));
  });

  afterAll(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
    await closePool();
  });

  it("Scenario 1: executes atomic pg_dump, gzip compression, and SHA-256 digest creation", async () => {
    const rawSqlGzPath = path.join(tmpDir, "snapshot.sql.gz");

    // Execute pg_dump piped through gzip
    const dumpCmd = `PGPASSWORD="${pgPassword}" pg_dump -h "${pgHost}" -p "${pgPort}" -U "${pgUser}" -d "${pgDatabase}" --no-owner --clean | gzip > "${rawSqlGzPath}"`;
    await execFileAsync("bash", ["-c", dumpCmd]);

    const stats = await fs.stat(rawSqlGzPath);
    expect(stats.size).toBeGreaterThan(1000); // Non-empty compressed SQL dump

    // Calculate cryptographic SHA-256 digest
    const fileBytes = await fs.readFile(rawSqlGzPath);
    const sha256 = crypto.createHash("sha256").update(fileBytes).digest("hex");
    expect(sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("Scenario 2: encrypts compressed dump with OpenSSL AES-256-CBC with PBKDF2 salt", async () => {
    const rawSqlGzPath = path.join(tmpDir, "snapshot.sql.gz");
    const encPath = path.join(tmpDir, "snapshot.sql.gz.enc");

    // Encrypt with OpenSSL AES-256-CBC
    await execFileAsync("openssl", [
      "enc",
      "-aes-256-cbc",
      "-salt",
      "-pbkdf2",
      "-iter",
      "100000",
      "-in",
      rawSqlGzPath,
      "-out",
      encPath,
      "-pass",
      `pass:${testEncryptionKey}`,
    ]);

    const encStats = await fs.stat(encPath);
    expect(encStats.size).toBeGreaterThan(0);

    // Verify encrypted file does not contain plain SQL headers
    const encBytes = await fs.readFile(encPath);
    const encHeader = encBytes.subarray(0, 16).toString("utf8");
    expect(encHeader).toContain("Salted__"); // OpenSSL salted encryption envelope
  });

  it("Scenario 3: decrypts encrypted snapshot and verifies SHA-256 match", async () => {
    const rawSqlGzPath = path.join(tmpDir, "snapshot.sql.gz");
    const encPath = path.join(tmpDir, "snapshot.sql.gz.enc");
    const decryptedGzPath = path.join(tmpDir, "decrypted.sql.gz");

    // Decrypt
    await execFileAsync("openssl", [
      "enc",
      "-d",
      "-aes-256-cbc",
      "-salt",
      "-pbkdf2",
      "-iter",
      "100000",
      "-in",
      encPath,
      "-out",
      decryptedGzPath,
      "-pass",
      `pass:${testEncryptionKey}`,
    ]);

    const originalBytes = await fs.readFile(rawSqlGzPath);
    const decryptedBytes = await fs.readFile(decryptedGzPath);

    const originalSha = crypto.createHash("sha256").update(originalBytes).digest("hex");
    const decryptedSha = crypto.createHash("sha256").update(decryptedBytes).digest("hex");

    expect(decryptedSha).toBe(originalSha);
  });

  it("Scenario 4: unzips decrypted dump and verifies critical schema structures exist", async () => {
    const decryptedGzPath = path.join(tmpDir, "decrypted.sql.gz");
    const unzippedSqlPath = path.join(tmpDir, "decrypted.sql");

    await execFileAsync("bash", ["-c", `gzip -d -c "${decryptedGzPath}" > "${unzippedSqlPath}"`]);

    const sqlContent = await fs.readFile(unzippedSqlPath, "utf8");

    // Verify presence of core and newly added strategic pathway tables
    expect(sqlContent).toContain("organizations");
    expect(sqlContent).toContain("daily_market_rates");
    expect(sqlContent).toContain("karigars");
    expect(sqlContent).toContain("manufacturing_job_orders");
    expect(sqlContent).toContain("savings_schemes");
    expect(sqlContent).toContain("vip_loyalty_profiles");
    expect(sqlContent).toContain("accounts");
    expect(sqlContent).toContain("journal_entries");
    expect(sqlContent).toContain("journal_lines");
  });

  it("Scenario 5: rejects decryption attempt when passphrase is invalid", async () => {
    const encPath = path.join(tmpDir, "snapshot.sql.gz.enc");
    const badDecryptedPath = path.join(tmpDir, "bad.sql.gz");

    let threw = false;
    try {
      await execFileAsync("openssl", [
        "enc",
        "-d",
        "-aes-256-cbc",
        "-salt",
        "-pbkdf2",
        "-iter",
        "100000",
        "-in",
        encPath,
        "-out",
        badDecryptedPath,
        "-pass",
        "pass:wrong_passphrase_unauthorized",
      ]);
    } catch {
      threw = true;
    }

    expect(threw).toBe(true);
  });
});
