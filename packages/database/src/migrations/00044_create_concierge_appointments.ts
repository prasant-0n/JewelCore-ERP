import type { MigrationDefinition } from "../migrator.js";

export const migration00044CreateConciergeAppointments: MigrationDefinition = {
  name: "00044_create_concierge_appointments",
  up: `
    CREATE TABLE IF NOT EXISTS concierge_appointments (
      id UUID PRIMARY KEY,
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      service_type VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
      appointment_date TIMESTAMPTZ NOT NULL,
      salon_location VARCHAR(128) NOT NULL,
      inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
      assigned_manager_name VARCHAR(128) NOT NULL DEFAULT 'Rachel R., Private Client Director',
      notes TEXT,
      reference_code VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_concierge_customer ON concierge_appointments(customer_id);
    CREATE INDEX IF NOT EXISTS idx_concierge_date ON concierge_appointments(appointment_date);
  `,
  down: `
    DROP TABLE IF EXISTS concierge_appointments CASCADE;
  `,
};
