import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  runAllMigrations,
  closePool,
  query,
  createOrganization,
  createCustomer,
  createConciergeAppointment,
  listConciergeAppointmentsByCustomer,
  getConciergeAppointmentById,
} from "../src/index.js";

describe("Concierge Appointment Repository (VIP Client Portal)", () => {
  let orgId: string;
  let customerId: string;

  async function cleanFixtures() {
    await query(
      "DELETE FROM concierge_appointments WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_CONCIERGE_REPO');",
    );
    await query(
      "DELETE FROM customers WHERE organization_id IN (SELECT id FROM organizations WHERE code = 'ORG_CONCIERGE_REPO');",
    );
    await query(
      "DELETE FROM organizations WHERE code = 'ORG_CONCIERGE_REPO';",
    );
  }

  beforeAll(async () => {
    await runAllMigrations();
    await cleanFixtures();

    const org = await createOrganization({
      code: "ORG_CONCIERGE_REPO",
      name: "Atelier Concierge Org",
    });
    orgId = org.id;

    const customer = await createCustomer({
      organizationId: orgId,
      customerCode: "CUST-VIP-CONCIERGE",
      firstName: "Radhika",
      lastName: "Singhania",
      email: "radhika@singhania.vip",
      country: "IN",
      status: "ACTIVE",
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    await cleanFixtures();
    await closePool();
  });

  it("creates a concierge appointment with reference code and assigned manager", async () => {
    const appointment = await createConciergeAppointment({
      organizationId: orgId,
      customerId,
      serviceType: "CLEANING_INSPECTION",
      appointmentDate: new Date(Date.now() + 86400000),
      salonLocation: "Flagship Mumbai",
      notes: "Ultrasonic cleaning and prong tightening for 18K Solitaire Ring",
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.customerId).toBe(customerId);
    expect(appointment.serviceType).toBe("CLEANING_INSPECTION");
    expect(appointment.status).toBe("CONFIRMED");
    expect(appointment.referenceCode).toMatch(/^APT-\d{4}-\d{4}$/);
    expect(appointment.assignedManagerName).toContain("Rachel R.");
  });

  it("lists concierge appointments by customer ID", async () => {
    const list = await listConciergeAppointmentsByCustomer(customerId);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0]?.customerId).toBe(customerId);
  });

  it("retrieves appointment by ID", async () => {
    const list = await listConciergeAppointmentsByCustomer(customerId);
    const first = list[0]!;
    const fetched = await getConciergeAppointmentById(first.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(first.id);
  });
});
