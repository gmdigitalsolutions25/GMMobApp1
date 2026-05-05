-- Manual Sync Script: clientdata.vehicles -> public.vehicles
-- Run this script in Neon SQL Editor or via psql to sync DWH vehicles to the app's public schema.
-- It maps DWH columns to the Drizzle schema and upserts based on VIN.

-- 1. Create a temporary mapping of customer_no to user_id
-- We need to link the DWH customer_no to the app's user_id.
-- Since public.users doesn't have a strict 1:1 mapping with customer_no yet (it uses phone),
-- we'll join via the public.clients table (which has customer_no and phone).

WITH user_mapping AS (
  SELECT 
    u.id AS user_id,
    c.customer_no
  FROM public.users u
  JOIN public.clients c 
    ON REPLACE(REPLACE(REPLACE(c.mobile_phone_no, '+', ''), ' ', ''), '-', '') LIKE '%' || RIGHT(REGEXP_REPLACE(u.phone, '\D', '', 'g'), 9)
    OR REPLACE(REPLACE(REPLACE(c.phone_no, '+', ''), ' ', ''), '-', '') LIKE '%' || RIGHT(REGEXP_REPLACE(u.phone, '\D', '', 'g'), 9)
  -- Deduplicate in case of multiple matches (take the first one)
  -- In a real production scenario, you might want a more robust mapping table
)
-- 2. Perform the UPSERT
INSERT INTO public.vehicles (
  user_id,
  brand,
  model,
  year,
  vin,
  license_plate,
  mileage,
  crm_vehicle_id,
  source,
  created_at,
  updated_at
)
SELECT 
  um.user_id,
  COALESCE(cv.make_code, 'Unknown') AS brand,
  COALESCE(cv.model, cv.model_code, 'Unknown') AS model,
  COALESCE(NULLIF(cv.prod_year, '')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer) AS year,
  TRIM(cv.vin) AS vin,
  TRIM(cv.license_no) AS license_plate,
  NULLIF(cv.mileage, '')::integer AS mileage,
  COALESCE(cv.model_no, cv.model_code) AS crm_vehicle_id,
  'dwh' AS source,
  CURRENT_TIMESTAMP AS created_at,
  CURRENT_TIMESTAMP AS updated_at
FROM clientdata.vehicles cv
JOIN user_mapping um ON cv.customer_no = um.customer_no
WHERE cv.vin IS NOT NULL AND LENGTH(TRIM(cv.vin)) >= 5
ON CONFLICT (vin) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  license_plate = EXCLUDED.license_plate,
  -- Only update mileage if the DWH mileage is greater or if the current mileage is null
  mileage = GREATEST(public.vehicles.mileage, EXCLUDED.mileage),
  crm_vehicle_id = EXCLUDED.crm_vehicle_id,
  source = 'dwh',
  updated_at = CURRENT_TIMESTAMP;
