-- ============================================================================
-- Migration 005: Onboarding Profile Fields
-- Qaraj GM Backend
-- Adds first_name, last_name, monthly_mileage, last_service_date,
-- preferred_service_center to users table for onboarding flow
-- ============================================================================

-- Add onboarding profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_mileage INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_service_date VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_service_center VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
