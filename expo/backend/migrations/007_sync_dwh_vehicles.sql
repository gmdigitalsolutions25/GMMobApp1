-- ===========================================================================
-- Qaraj GM: Manual Sync Script
-- Source: clientdata.vehicles -> Target: public.vehicles
-- Run in: Neon SQL Editor (https://console.neon.tech)
-- ===========================================================================

-- STEP 1: Data Quality Check (run first, review results)
-- SELECT TRIM(vin) AS clean_vin, COUNT(*)
-- FROM clientdata.vehicles
-- WHERE vin IS NOT NULL AND LENGTH(TRIM(vin)) >= 5
-- GROUP BY TRIM(vin)
-- HAVING COUNT(*) > 1;

-- STEP 2: Add unique partial index (run once, skip if already exists)
DELETE FROM public.vehicles a USING (
    SELECT MIN(ctid) as ctid, vin
    FROM public.vehicles
    WHERE vin IS NOT NULL AND vin != ''
    GROUP BY vin HAVING COUNT(*) > 1
) b
WHERE a.vin = b.vin AND a.ctid <> b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS vehicles_vin_unique_idx
ON public.vehicles (vin)
WHERE vin IS NOT NULL AND vin != '';

-- STEP 3: Run the sync
WITH user_mapping AS (
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
    mileage = GREATEST(public.vehicles.mileage, EXCLUDED.mileage),
    crm_vehicle_id = EXCLUDED.crm_vehicle_id,
    source = 'dwh',
    updated_at = CURRENT_TIMESTAMP;

-- STEP 4: Verify
SELECT source, COUNT(*) FROM public.vehicles GROUP BY source;
