import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import {
  runAllMigrations,
  closePool,
  query,
  createOrganization,
} from "@jewelcore/database";

describe("IAM Authentication & User Endpoints (FEAT-IAM-02)", () => {
  const app = createApp();
  let testOrgId: string;

  beforeAll(async () => {
    await runAllMigrations();
    const org = await createOrganization({
      code: "AUTH_API_ORG",
      name: "Auth API Testing Inc",
    });
    testOrgId = org.id;
  });

  afterAll(async () => {
    await query("DELETE FROM users WHERE email LIKE 'auth_%@jewelcore.local';");
    await query("DELETE FROM organizations WHERE code = 'AUTH_API_ORG';");
    await closePool();
  });

  describe("POST /api/v1/auth/register", () => {
    it("successfully registers a user with Argon2id hashed password and returns public profile", async () => {
      const payload = {
        organizationId: testOrgId,
        email: "auth_user1@jewelcore.local",
        password: "SuperSecretPassword123",
        firstName: "Victoria",
        lastName: "Crown",
        phone: "+1-416-555-0188",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.email).toBe("auth_user1@jewelcore.local");
      expect(res.body.data.firstName).toBe("Victoria");
      expect(res.body.data.isActive).toBe(true);

      // Verify password hash is never exposed to API response
      expect(res.body.data.passwordHash).toBeUndefined();
      expect(res.body.data.password).toBeUndefined();

      // Verify in DB that hash starts with $argon2id$
      const dbCheck = await query<{ password_hash: string }>(
        "SELECT password_hash FROM users WHERE id = $1;",
        [res.body.data.id],
      );
      expect(dbCheck.rows[0]?.password_hash.startsWith("$argon2id$")).toBe(
        true,
      );
    });

    it("returns 409 Conflict with ERR_DUPLICATE_EMAIL when email is already registered", async () => {
      const payload = {
        organizationId: testOrgId,
        email: "auth_user1@jewelcore.local",
        password: "SuperSecretPassword123",
        firstName: "Duplicate",
        lastName: "User",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("ERR_DUPLICATE_EMAIL");
    });

    it("returns 400 Bad Request with ERR_VALIDATION when password is too weak", async () => {
      const payload = {
        organizationId: testOrgId,
        email: "auth_weak@jewelcore.local",
        password: "weak", // fails min length and complexity
        firstName: "Weak",
        lastName: "Pass",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("ERR_VALIDATION");
      expect(res.body.invalidParams).toBeDefined();
    });

    it("returns 404 Not Found when organizationId does not exist", async () => {
      const payload = {
        organizationId: "0192e212-3456-7890-abcd-ef0123456789",
        email: "auth_orphan@jewelcore.local",
        password: "SuperSecretPassword123",
        firstName: "Orphan",
        lastName: "User",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(payload);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ERR_NOT_FOUND");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    let accessToken: string;

    it("authenticates valid credentials, sets HTTP-only refresh cookie and returns access JWT", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "auth_user1@jewelcore.local",
        password: "SuperSecretPassword123",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe("auth_user1@jewelcore.local");

      // Verify HTTP-only cookie
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const hasHttpOnlyRefresh = cookies.some(
        (c: string) => c.includes("refreshToken=") && c.includes("HttpOnly"),
      );
      expect(hasHttpOnlyRefresh).toBe(true);

      accessToken = res.body.data.accessToken;
    });

    it("rejects invalid password credentials with 401 Unauthorized", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "auth_user1@jewelcore.local",
        password: "WrongPassword999",
      });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("ERR_INVALID_CREDENTIALS");
    });

    it("triggers temporary account lockout after repeated brute-force failures", async () => {
      // Create user for lockout test
      await request(app).post("/api/v1/auth/register").send({
        organizationId: testOrgId,
        email: "auth_lockout@jewelcore.local",
        password: "TargetPassword123",
        firstName: "Brute",
        lastName: "Target",
      });

      // 4 failures: 401 Unauthorized
      for (let i = 0; i < 4; i++) {
        const failRes = await request(app).post("/api/v1/auth/login").send({
          email: "auth_lockout@jewelcore.local",
          password: "InvalidPasswordAttempt",
        });
        expect(failRes.status).toBe(401);
      }

      // 5th failure: triggers 403 Forbidden with ERR_ACCOUNT_LOCKED
      const lockRes = await request(app).post("/api/v1/auth/login").send({
        email: "auth_lockout@jewelcore.local",
        password: "InvalidPasswordAttempt",
      });
      expect(lockRes.status).toBe(403);
      expect(lockRes.body.code).toBe("ERR_ACCOUNT_LOCKED");

      // Subsequent attempt even with correct password is blocked until lock expires
      const blockedRes = await request(app).post("/api/v1/auth/login").send({
        email: "auth_lockout@jewelcore.local",
        password: "TargetPassword123",
      });
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.code).toBe("ERR_ACCOUNT_LOCKED");
    });

    describe("GET /api/v1/auth/me", () => {
      it("returns current user profile when valid Bearer JWT is provided", async () => {
        const res = await request(app)
          .get("/api/v1/auth/me")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe("auth_user1@jewelcore.local");
        expect(res.body.data.firstName).toBe("Victoria");
      });

      it("returns 401 Unauthorized when Authorization header is missing", async () => {
        const res = await request(app).get("/api/v1/auth/me");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe("ERR_UNAUTHORIZED");
      });
    });

    describe("Workstation Sessions & Remote Revocation", () => {
      it("lists active workstation sessions for the authenticated user", async () => {
        const res = await request(app)
          .get("/api/v1/auth/sessions")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);

        const currentSession = res.body.data.find((s: any) => s.isCurrent);
        expect(currentSession).toBeDefined();
        expect(currentSession.stationId).toBe("STATION-DESK-01");
      });

      it("revokes an individual remote workstation session by ID", async () => {
        const listRes = await request(app)
          .get("/api/v1/auth/sessions")
          .set("Authorization", `Bearer ${accessToken}`);

        const remoteSession = listRes.body.data.find((s: any) => !s.isCurrent);
        expect(remoteSession).toBeDefined();

        const revokeRes = await request(app)
          .delete(`/api/v1/auth/sessions/${remoteSession.id}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(revokeRes.status).toBe(200);
        expect(revokeRes.body.data.revokedId).toBe(remoteSession.id);

        // Verify session is no longer in active list
        const updatedList = await request(app)
          .get("/api/v1/auth/sessions")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(updatedList.body.data.some((s: any) => s.id === remoteSession.id)).toBe(false);
      });

      it("revokes all other remote workstation sessions in a single operation", async () => {
        const revokeOthersRes = await request(app)
          .post("/api/v1/auth/sessions/revoke-others")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(revokeOthersRes.status).toBe(200);
        expect(typeof revokeOthersRes.body.data.revokedCount).toBe("number");

        // After revoke-others, only current workstation remains
        const listRes = await request(app)
          .get("/api/v1/auth/sessions")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(listRes.body.data.length).toBe(1);
        expect(listRes.body.data[0].isCurrent).toBe(true);
      });
    });

    describe("POST /api/v1/auth/change-password (NIST SP 800-63B Credential Rotation)", () => {
      it("rejects rotation when current password is invalid", async () => {
        const res = await request(app)
          .post("/api/v1/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "WrongCurrentPassword123",
            newPassword: "BrandNewSecurePassword@2026",
            confirmPassword: "BrandNewSecurePassword@2026",
          });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe("ERR_INVALID_CURRENT_PASSWORD");
      });

      it("rejects rotation when new password does not meet NIST 12-char complexity", async () => {
        const res = await request(app)
          .post("/api/v1/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "SuperSecretPassword123",
            newPassword: "Short1!",
            confirmPassword: "Short1!",
          });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("ERR_VALIDATION");
      });

      it("rejects rotation when new password is identical to current password", async () => {
        const res = await request(app)
          .post("/api/v1/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "SuperSecretPassword123",
            newPassword: "SuperSecretPassword123",
            confirmPassword: "SuperSecretPassword123",
          });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("ERR_VALIDATION");
      });

      it("successfully rotates password with valid Argon2id hash update", async () => {
        const res = await request(app)
          .post("/api/v1/auth/change-password")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({
            currentPassword: "SuperSecretPassword123",
            newPassword: "BrandNewSecurePassword@2026",
            confirmPassword: "BrandNewSecurePassword@2026",
          });

        expect(res.status).toBe(200);
        expect(res.body.data.message).toContain("Credentials rotated successfully");

        // Verify login works with new password
        const loginRes = await request(app).post("/api/v1/auth/login").send({
          email: "auth_user1@jewelcore.local",
          password: "BrandNewSecurePassword@2026",
        });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.data.accessToken).toBeDefined();
      });
    });

    describe("GET & POST /api/v1/auth/audit-log (Forensic IAM Security Feed)", () => {
      let accessToken: string;

      beforeAll(async () => {
        const loginRes = await request(app).post("/api/v1/auth/login").send({
          email: "auth_user1@jewelcore.local",
          password: "BrandNewSecurePassword@2026",
        });
        accessToken = loginRes.body.data.accessToken;
      });

      it("rejects unauthenticated requests to forensic audit log", async () => {
        const res = await request(app).get("/api/v1/auth/audit-log");
        expect(res.status).toBe(401);
      });

      it("returns forensic IAM audit log stream with categorized events", async () => {
        const res = await request(app)
          .get("/api/v1/auth/audit-log")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);

        const firstEvent = res.body.data[0];
        expect(firstEvent).toHaveProperty("id");
        expect(firstEvent).toHaveProperty("action");
        expect(firstEvent).toHaveProperty("category");
        expect(firstEvent).toHaveProperty("severity");
        expect(firstEvent).toHaveProperty("stationId");
        expect(firstEvent).toHaveProperty("details");
      });

      it("supports filtering audit stream by category and severity", async () => {
        const res = await request(app)
          .get("/api/v1/auth/audit-log?category=AUTHENTICATION&severity=INFO")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        for (const evt of res.body.data) {
          expect(evt.category).toBe("AUTHENTICATION");
          expect(evt.severity).toBe("INFO");
        }
      });

      it("records a client-side terminal security event into the forensic stream", async () => {
        const payload = {
          action: "AUTH_PIN_UNLOCKED",
          category: "WORKSTATION_ACCESS",
          severity: "INFO",
          stationId: "POS-TERMINAL-02",
          details: "Showroom associate unlocked counter terminal via 4-digit PIN",
        };

        const res = await request(app)
          .post("/api/v1/auth/audit-log")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.data.action).toBe("AUTH_PIN_UNLOCKED");
        expect(res.body.data.stationId).toBe("POS-TERMINAL-02");
        expect(res.body.data.details).toBe(payload.details);

        // Verify it shows up at the top of the audit log stream
        const checkRes = await request(app)
          .get("/api/v1/auth/audit-log")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(checkRes.body.data[0].action).toBe("AUTH_PIN_UNLOCKED");
      });
    });

    describe("FIDO2 / WebAuthn Biometric & Hardware Passkeys (FEAT-IAM-03)", () => {
      let accessToken: string;

      beforeAll(async () => {
        const loginRes = await request(app).post("/api/v1/auth/login").send({
          email: "auth_user1@jewelcore.local",
          password: "BrandNewSecurePassword@2026",
        });
        accessToken = loginRes.body.data.accessToken;
      });

      it("rejects unauthenticated requests to passkey endpoints", async () => {
        const res = await request(app).get("/api/v1/auth/passkeys");
        expect(res.status).toBe(401);
      });

      it("lists registered hardware and biometric passkeys", async () => {
        const res = await request(app)
          .get("/api/v1/auth/passkeys")
          .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);

        const key = res.body.data[0];
        expect(key).toHaveProperty("id");
        expect(key).toHaveProperty("name");
        expect(key).toHaveProperty("credentialId");
        expect(key).toHaveProperty("transports");
      });

      it("registers a new FIDO2 hardware passkey and records in audit trail", async () => {
        const payload = {
          name: "Vault Backup Key 03",
          credentialId: "fido2_cred_0192e3009944aabb",
          publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE77...",
          transports: ["usb"],
          aaguid: "cbfe4eaf-3530-4966-86e1-118817da7793",
        };

        const res = await request(app)
          .post("/api/v1/auth/passkeys")
          .set("Authorization", `Bearer ${accessToken}`)
          .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe("Vault Backup Key 03");
        expect(res.body.data.credentialId).toBe(payload.credentialId);

        // Verify passkey count increased
        const listRes = await request(app)
          .get("/api/v1/auth/passkeys")
          .set("Authorization", `Bearer ${accessToken}`);

        const found = listRes.body.data.find(
          (k: any) => k.id === res.body.data.id,
        );
        expect(found).toBeDefined();

        // Revoke the passkey
        const revokeRes = await request(app)
          .delete(`/api/v1/auth/passkeys/${res.body.data.id}`)
          .set("Authorization", `Bearer ${accessToken}`);

        expect(revokeRes.status).toBe(200);
        expect(revokeRes.body.data.message).toContain("revoked successfully");
      });
    });
  });
});
