-- Migration 009: Add is_gm_brand flag and custom_brand to vehicles table
-- Purpose: Distinguish Groupmotors-serviced vehicles from "Other" brand vehicles
-- Run this in pgAdmin against the Neon database

-- Add the column (default true for all existing vehicles since they came from DWH)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS is_gm_brand BOOLEAN NOT NULL DEFAULT true;

-- Add custom_brand column for "Other" vehicles (free-text brand name)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS custom_brand VARCHAR(100);

-- Comment for clarity
COMMENT ON COLUMN public.vehicles.is_gm_brand IS 'true = Groupmotors brand (Toyota, Lexus), false = Other brand added by user';
COMMENT ON COLUMN public.vehicles.custom_brand IS 'Free-text brand name when is_gm_brand = false (e.g. Honda, BMW, Mercedes)';

-- Backfill: mark any existing vehicles with non-GM brands as is_gm_brand = false
UPDATE public.vehicles
SET is_gm_brand = false
WHERE LOWER(brand) NOT IN ('toyota', 'lexus')
  AND source = 'user';
