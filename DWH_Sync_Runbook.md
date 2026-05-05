# Qaraj GM: DWH to App Vehicle Sync Runbook

**Author:** Manus AI
**Date:** May 05, 2026
**Target Audience:** Database Administrators / Backend Team

This document provides the step-by-step instructions and SQL scripts required to manually synchronize vehicle data from the Data Warehouse (`clientdata` schema) to the App's operational tables (`public` schema).

## 1. Architecture & Strategy

The application relies on the `public.vehicles` table for fast, relational queries (e.g., linking vehicles to service appointments and photos). However, the single source of truth for customer and vehicle master data is the Dealer Management System (DMS), which syncs to the `clientdata` schema.

**Sync Strategy:**
- **Source:** `clientdata.vehicles` (31k+ records)
- **Target:** `public.vehicles`
- **Matching Key:** `vin` (Vehicle Identification Number)
- **Conflict Resolution:** If a vehicle exists, update its details. Only update `mileage` if the DWH value is greater than the current app value.
- **Source Tracking:** Vehicles synced from DWH are marked with `source = 'dwh'`. Vehicles added manually by users in the app are marked with `source = 'user'`.

## 2. Prerequisites: Data Quality Check

Before applying constraints and running the sync, the team **must** verify the data quality in `clientdata.vehicles`.

Run this query in the Neon SQL Editor to check for duplicate VINs:

```sql
-- Check for duplicate VINs in the DWH data
SELECT TRIM(vin) AS clean_vin, COUNT(*) 
FROM clientdata.vehicles 
WHERE vin IS NOT NULL AND LENGTH(TRIM(vin)) >= 5
GROUP BY TRIM(vin) 
HAVING COUNT(*) > 1;
```

**Action Required:**
- If the query returns **0 rows**, proceed to Step 3.
- If the query returns rows, you have duplicate VINs in the DWH. You must either clean the data in the DMS/DWH pipeline first, or modify the sync script to deduplicate (e.g., using `DISTINCT ON (TRIM(vin))`).

## 3. Migration: Add Unique Constraint

To use PostgreSQL's `INSERT ... ON CONFLICT` feature for the upsert, the target table (`public.vehicles`) must have a unique constraint on the matching key.

Run this migration script once:

```sql
-- 1. Clean up any existing exact duplicates in public.vehicles (keep the latest one)
DELETE FROM public.vehicles a USING (
    SELECT MIN(ctid) as ctid, vin
    FROM public.vehicles 
    WHERE vin IS NOT NULL AND vin != ''
    GROUP BY vin HAVING COUNT(*) > 1
) b
WHERE a.vin = b.vin AND a.ctid <> b.ctid;

-- 2. Add the unique constraint on VIN
-- Note: We only enforce uniqueness for non-empty VINs
CREATE UNIQUE INDEX IF NOT EXISTS vehicles_vin_unique_idx 
ON public.vehicles (vin) 
WHERE vin IS NOT NULL AND vin != '';
```

## 4. The Sync Script

This is the core script that performs the synchronization. It can be run manually in the Neon SQL Editor whenever a bulk sync is required.

```sql
-- ==============================================================================
-- Qaraj GM: Manual Sync Script (clientdata.vehicles -> public.vehicles)
-- ==============================================================================

WITH user_mapping AS (
  -- Create a mapping between DWH customer_no and App user_id
  -- Matches based on normalized phone numbers
  SELECT 
    u.id AS user_id,
    c.customer_no
  FROM public.users u
  JOIN public.clients c 
    ON REPLACE(REPLACE(REPLACE(c.mobile_phone_no, '+', ''), ' ', ''), '-', '') LIKE '%' || RIGHT(REGEXP_REPLACE(u.phone, '\D', '', 'g'), 9)
    OR REPLACE(REPLACE(REPLACE(c.phone_no, '+', ''), ' ', ''), '-', '') LIKE '%' || RIGHT(REGEXP_REPLACE(u.phone, '\D', '', 'g'), 9)
)
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
SELECT DISTINCT ON (TRIM(cv.vin))
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
ORDER BY TRIM(cv.vin), cv.date_of_sale DESC NULLS LAST

ON CONFLICT (vin) WHERE vin IS NOT NULL AND vin != '' 
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  license_plate = EXCLUDED.license_plate,
  -- Only update mileage if the DWH mileage is greater
  mileage = GREATEST(public.vehicles.mileage, EXCLUDED.mileage),
  crm_vehicle_id = EXCLUDED.crm_vehicle_id,
  source = 'dwh',
  updated_at = CURRENT_TIMESTAMP;
```

### Script Details:
- **`DISTINCT ON (TRIM(cv.vin))`**: Ensures that even if the DWH has duplicate VINs, the script only attempts to insert the most recent one (based on `date_of_sale`), preventing transaction failures.
- **Phone Normalization**: Strips spaces, dashes, and plus signs, matching on the last 9 digits to ensure robust linking between `public.users` and `public.clients`.
- **Mileage Logic**: Uses `GREATEST()` to ensure the app never overwrites a higher mileage value with a lower one from an outdated DWH record.

## 5. Post-Sync Verification

After running the sync script, verify the results:

```sql
-- Check how many vehicles were synced from DWH vs added by users
SELECT source, COUNT(*) 
FROM public.vehicles 
GROUP BY source;

-- Check for any user-added vehicles that might conflict with DWH data
SELECT v.vin, v.license_plate, u.phone
FROM public.vehicles v
JOIN public.users u ON v.user_id = u.id
WHERE v.source = 'user';
```

These user-added vehicles should be periodically reviewed by the back-office team to ensure they are correctly entered into the DMS.
