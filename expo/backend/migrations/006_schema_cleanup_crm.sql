-- Migration 006: Schema cleanup + CRM integration fields
-- Date: 2026-05-01
-- Description:
--   1. Add CRM reference fields to users and vehicles (for DWH sync)
--   2. Fix language default from 'en' to 'az'
--   3. Add updated_at and image_url to service_centers
--   4. Drop dead primary_photo_id column from vehicles

-- ── 1. CRM reference fields ─────────────────────────────────────────────────

-- Users: link to CRM customer ID (e.g. customer 900 from Groupmotors DWH)
ALTER TABLE users ADD COLUMN IF NOT EXISTS crm_customer_id VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS users_crm_customer_id_idx
  ON users(crm_customer_id) WHERE crm_customer_id IS NOT NULL;

-- Vehicles: link to CRM vehicle ID + track data source
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS crm_vehicle_id VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'user';
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_crm_vehicle_id_idx
  ON vehicles(crm_vehicle_id) WHERE crm_vehicle_id IS NOT NULL;

-- ── 2. Fix language default ─────────────────────────────────────────────────

ALTER TABLE users ALTER COLUMN language SET DEFAULT 'az';

-- ── 3. Service centers improvements ─────────────────────────────────────────

ALTER TABLE service_centers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW() NOT NULL;
ALTER TABLE service_centers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── 4. Drop dead column ─────────────────────────────────────────────────────

ALTER TABLE vehicles DROP COLUMN IF EXISTS primary_photo_id;
