import type { Pool, PoolClient } from "pg";
import { getPool } from "../pool.js";
import { uuidv7 } from "../uuidv7.js";

type Queryable = Pool | PoolClient;

export interface ConciergeAppointmentRecord {
  id: string;
  organizationId: string;
  customerId: string;
  serviceType: string;
  status: string;
  appointmentDate: Date;
  salonLocation: string;
  inventoryItemId: string | null;
  assignedManagerName: string;
  notes: string | null;
  referenceCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConciergeAppointmentInput {
  organizationId: string;
  customerId: string;
  serviceType: string;
  appointmentDate: Date | string;
  salonLocation: string;
  inventoryItemId?: string | null;
  assignedManagerName?: string;
  notes?: string | null;
}

export interface ConciergeAppointmentRow {
  id: string;
  organization_id: string;
  customer_id: string;
  service_type: string;
  status: string;
  appointment_date: Date | string;
  salon_location: string;
  inventory_item_id: string | null;
  assigned_manager_name: string;
  notes: string | null;
  reference_code: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export function mapRowToConciergeAppointment(
  row: ConciergeAppointmentRow,
): ConciergeAppointmentRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    customerId: row.customer_id,
    serviceType: row.service_type,
    status: row.status,
    appointmentDate:
      row.appointment_date instanceof Date
        ? row.appointment_date
        : new Date(row.appointment_date),
    salonLocation: row.salon_location,
    inventoryItemId: row.inventory_item_id,
    assignedManagerName: row.assigned_manager_name,
    notes: row.notes,
    referenceCode: row.reference_code,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at
        : new Date(row.created_at),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at
        : new Date(row.updated_at),
  };
}

export async function createConciergeAppointment(
  input: CreateConciergeAppointmentInput,
  client?: Queryable,
): Promise<ConciergeAppointmentRecord> {
  const db = client ?? getPool();
  const id = uuidv7();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referenceCode = `APT-${new Date().getFullYear()}-${randomSuffix}`;
  const assignedManager =
    input.assignedManagerName || "Rachel R., Senior Private Client Director";

  const res = await db.query<ConciergeAppointmentRow>(
    `INSERT INTO concierge_appointments (
      id,
      organization_id,
      customer_id,
      service_type,
      status,
      appointment_date,
      salon_location,
      inventory_item_id,
      assigned_manager_name,
      notes,
      reference_code,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, 'CONFIRMED', $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.organizationId,
      input.customerId,
      input.serviceType,
      input.appointmentDate,
      input.salonLocation,
      input.inventoryItemId ?? null,
      assignedManager,
      input.notes ?? null,
      referenceCode,
    ],
  );

  const row = res.rows[0];
  if (!row) {
    throw new Error("Failed to create concierge appointment");
  }

  return mapRowToConciergeAppointment(row);
}

export async function listConciergeAppointmentsByCustomer(
  customerId: string,
  client?: Queryable,
): Promise<ConciergeAppointmentRecord[]> {
  const db = client ?? getPool();
  const res = await db.query<ConciergeAppointmentRow>(
    `SELECT * FROM concierge_appointments
     WHERE customer_id = $1
     ORDER BY appointment_date DESC`,
    [customerId],
  );
  return res.rows.map(mapRowToConciergeAppointment);
}

export async function getConciergeAppointmentById(
  id: string,
  client?: Queryable,
): Promise<ConciergeAppointmentRecord | null> {
  const db = client ?? getPool();
  const res = await db.query<ConciergeAppointmentRow>(
    `SELECT * FROM concierge_appointments WHERE id = $1`,
    [id],
  );
  if (!res.rows[0]) return null;
  return mapRowToConciergeAppointment(res.rows[0]);
}
