-- Migration 008: Add vehicle specification fields (drive type, fuel type, engine type)
-- Run in Neon SQL Editor BEFORE deploying the new backend code.

-- Create enum types
DO $$ BEGIN
  CREATE TYPE drive_type AS ENUM ('2WD', '4WD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fuel_type AS ENUM ('benzin', 'diesel', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE engine_type AS ENUM ('1.5L', '1.6L', '1.8L', '2.0L', '2.4L', '2.5L', '2.7L', '2.8L', '3.3L', '3.5L', '4.0L');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add columns to vehicles table (nullable for existing records)
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS drive_type drive_type;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_type fuel_type;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_type engine_type;

-- Verify
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'vehicles'
  AND column_name IN ('drive_type', 'fuel_type', 'engine_type');
