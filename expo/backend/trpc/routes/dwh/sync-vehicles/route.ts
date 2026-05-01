/**
 * dwh.syncVehicles — Sync vehicles from DWH staging tables into the user's garage
 *
 * Flow:
 *   1. Receive phone number (from login)
 *   2. Look up customer_no in `clients` table by mobile_phone_no or phone_no
 *   3. Safety check: if phone maps to >5 distinct customer_nos, skip (data quality issue)
 *   4. Fetch all vehicles from `stg_vehicles` by customer_no
 *   5. For each vehicle, upsert into `vehicles` table (dedup by VIN or crm_vehicle_id)
 *   6. Link crm_customer_id on the user record
 *   7. Enrich user name from DWH if missing
 *   8. Return the list of synced vehicles
 *
 * This runs automatically after login/hydration so the user sees their cars
 * without manually adding them. Non-fatal — if DWH tables are empty or
 * unreachable, the app continues with whatever is already in the vehicles table.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, vehicles } from "../../../../../db/schema";
import { eq, and, sql } from "drizzle-orm";

// Max distinct customer_nos per phone before we consider it ambiguous
const MAX_CUSTOMER_NOS = 5;

export const syncVehiclesProcedure = publicProcedure
  .input(z.object({ phone: z.string().min(5).max(20) }))
  .query(async ({ input }) => {
    try {
      if (!db) {
        return { synced: 0, vehicles: [], error: null };
      }

      // 1. Find our app user
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { synced: 0, vehicles: [], error: 'User not found' };
      }

      // 2. Look up customer_no from clients table by phone
      //    Normalize phone: strip non-digits, match last 9 digits (Azerbaijan mobile)
      const phoneDigits = input.phone.replace(/\D/g, '');
      const phoneSuffix = phoneDigits.slice(-9);

      const clientRows = await db.execute(sql`
        SELECT DISTINCT customer_no, full_name, first_name, last_name
        FROM clients
        WHERE REPLACE(REPLACE(REPLACE(mobile_phone_no, '+', ''), ' ', ''), '-', '') LIKE ${'%' + phoneSuffix}
           OR REPLACE(REPLACE(REPLACE(phone_no, '+', ''), ' ', ''), '-', '') LIKE ${'%' + phoneSuffix}
        LIMIT 20
      `);

      if (!clientRows || clientRows.length === 0) {
        return { synced: 0, vehicles: [], error: 'Customer not found in DWH' };
      }

      // 3. Safety check: too many customer_nos = ambiguous phone (data quality issue)
      const customerNos = [...new Set(clientRows.map((r: any) => r.customer_no))];

      if (customerNos.length > MAX_CUSTOMER_NOS) {
        console.warn(`[dwh.syncVehicles] Phone ${input.phone} maps to ${customerNos.length} customer_nos — skipping as ambiguous`);
        return {
          synced: 0,
          vehicles: [],
          error: `Phone maps to ${customerNos.length} customers in DWH — too ambiguous to sync automatically`,
        };
      }

      // 4. Link crm_customer_id on user if not set
      if (!user.crmCustomerId && customerNos.length > 0) {
        await db.update(users)
          .set({ crmCustomerId: customerNos[0] })
          .where(eq(users.id, user.id));
      }

      // 5. Enrich user name from DWH if missing
      const firstClient: any = clientRows[0];
      if (!user.firstName && firstClient.first_name) {
        await db.update(users)
          .set({
            firstName: firstClient.first_name,
            lastName: firstClient.last_name ?? undefined,
          })
          .where(eq(users.id, user.id));
      }

      // 6. Fetch vehicles from stg_vehicles for all customer_nos
      const stgVehicles = await db.execute(sql`
        SELECT
          sv.model_no,
          sv.vin,
          sv.license_no,
          sv.make_code,
          sv.model,
          sv.vehicle_status,
          sv.customer_no,
          sv.mileage,
          sv.model_code,
          sv.prod_year,
          sv.date_of_sale,
          b.name AS brand_name
        FROM stg_vehicles sv
        LEFT JOIN brands b ON UPPER(sv.make_code) = UPPER(b.name)
        WHERE sv.customer_no = ANY(${customerNos})
      `);

      if (!stgVehicles || stgVehicles.length === 0) {
        // stg_vehicles is empty or no vehicles for this customer — not an error
        console.log(`[dwh.syncVehicles] Phone ${input.phone}: found ${customerNos.length} customer(s), 0 DWH vehicles`);
        return { synced: 0, vehicles: [], error: null };
      }

      // 7. Upsert each vehicle into our vehicles table
      const syncedVehicles: any[] = [];
      let syncCount = 0;

      for (const sv of stgVehicles as any[]) {
        const brandName = sv.brand_name || sv.make_code || 'Toyota';
        const modelName = sv.model || sv.model_code || 'Unknown';
        const vin = (sv.vin || '').trim();
        const licensePlate = (sv.license_no || '').trim();
        const year = parseInt(sv.prod_year) || new Date().getFullYear();
        const mileage = parseInt(sv.mileage) || null;
        const crmVehicleId = sv.model_no || sv.model_code || null;

        // Dedup: check if vehicle already exists by VIN or crm_vehicle_id
        let existingVehicle = null;

        if (vin && vin.length >= 5) {
          existingVehicle = await db.query.vehicles.findFirst({
            where: and(
              eq(vehicles.userId, user.id),
              eq(vehicles.vin, vin),
            ),
          });
        }

        if (!existingVehicle && crmVehicleId) {
          existingVehicle = await db.query.vehicles.findFirst({
            where: and(
              eq(vehicles.userId, user.id),
              eq(vehicles.crmVehicleId, crmVehicleId),
            ),
          });
        }

        if (existingVehicle) {
          // Update mileage if DWH has newer data
          if (mileage && (!existingVehicle.mileage || mileage > existingVehicle.mileage)) {
            await db.update(vehicles)
              .set({ mileage, updatedAt: new Date() })
              .where(eq(vehicles.id, existingVehicle.id));
          }
          syncedVehicles.push({
            id: existingVehicle.id,
            brand: existingVehicle.brand,
            model: existingVehicle.model,
            year: existingVehicle.year,
            action: 'existing',
          });
          continue;
        }

        // Insert new vehicle
        const [newVehicle] = await db.insert(vehicles)
          .values({
            userId: user.id,
            brand: brandName,
            model: modelName,
            year,
            vin,
            licensePlate,
            mileage,
            crmVehicleId,
            source: 'dwh',
          })
          .returning();

        syncCount++;
        syncedVehicles.push({
          id: newVehicle.id,
          brand: brandName,
          model: modelName,
          year,
          vin,
          licensePlate,
          mileage,
          action: 'created',
        });
      }

      console.log(`[dwh.syncVehicles] Phone ${input.phone}: found ${customerNos.length} customer(s), ${stgVehicles.length} DWH vehicles, synced ${syncCount} new`);

      return {
        synced: syncCount,
        vehicles: syncedVehicles,
        error: null,
      };
    } catch (error) {
      console.error('[dwh.syncVehicles] Error:', error);
      return { synced: 0, vehicles: [], error: 'Sync failed — check server logs' };
    }
  });
