/**
 * dwh.syncVehicles — Sync vehicles from DWH staging tables into the user's garage
 *
 * Flow:
 *   1. Receive phone number (from login)
 *   2. Look up customer_no in `clients` table by mobile_phone_no or phone_no
 *   3. Safety check: if phone maps to >5 distinct customer_nos, skip (data quality issue)
 *   4. Fetch all vehicles from `clientdata.vehicles` by customer_no
 *   5. For each vehicle, upsert into `vehicles` table (dedup by VIN globally)
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
      const likePattern = '%' + phoneSuffix;

      const clientRows = await db.execute(sql`
        SELECT DISTINCT customer_no, full_name
        FROM clients
        WHERE REPLACE(REPLACE(REPLACE(mobile_phone_no, '+', ''), ' ', ''), '-', '') LIKE ${likePattern}
           OR REPLACE(REPLACE(REPLACE(phone_no, '+', ''), ' ', ''), '-', '') LIKE ${likePattern}
        LIMIT 20
      `);

      // Drizzle db.execute may return { rows: [...] } or directly an array
      const clientList: any[] = Array.isArray(clientRows) ? clientRows : (clientRows as any).rows || [];

      if (clientList.length === 0) {
        return { synced: 0, vehicles: [], error: 'Customer not found in DWH' };
      }

      // 3. Safety check: too many customer_nos = ambiguous phone (data quality issue)
      const customerNos = [...new Set(clientList.map((r: any) => r.customer_no))];

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
      const firstClient: any = clientList[0];
      if (!user.firstName && firstClient.full_name) {
        // Split "Sultanova Naibe" into last + first (DWH stores as "LastName FirstName")
        const nameParts = (firstClient.full_name || '').trim().split(/\s+/);
        const lastName = nameParts[0] || '';
        const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';
        await db.update(users)
          .set({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          })
          .where(eq(users.id, user.id));
      }

      // 6. Fetch vehicles from clientdata.vehicles (DWH schema with 31k records)
      const stgVehiclesResult = await db.execute(sql`
        SELECT
          model_no,
          vin,
          license_no,
          make_code,
          model,
          vehicle_status,
          customer_no,
          date_of_sale,
          mileage,
          model_code,
          prod_year
        FROM clientdata.vehicles
        WHERE customer_no IN (${sql.join(customerNos.map(n => sql`${n}`), sql`, `)})
      `);

      const stgVehicles: any[] = Array.isArray(stgVehiclesResult) ? stgVehiclesResult : (stgVehiclesResult as any).rows || [];

      if (stgVehicles.length === 0) {
        // clientdata.vehicles is empty or no vehicles for this customer — not an error
        console.log(`[dwh.syncVehicles] Phone ${input.phone}: found ${customerNos.length} customer(s), 0 DWH vehicles`);
        return { synced: 0, vehicles: [], error: null };
      }

      // 7. Upsert each vehicle into our vehicles table
      //    DEDUP STRATEGY: Check by VIN globally (not per-user) since VIN is unique worldwide
      //    This prevents duplicates even if the vehicle was previously synced by bulk SQL script
      const syncedVehicles: any[] = [];
      let syncCount = 0;

      for (const sv of stgVehicles) {
        const brandName = sv.make_code || 'Unknown';
        const modelName = sv.model || sv.model_code || 'Unknown';
        const vin = (sv.vin || '').trim();
        const licensePlate = (sv.license_no || '').trim();
        // prod_year may be a Date object, ISO string like "2008-01-01", or just "2008"
        const prodYearRaw = sv.prod_year;
        let year: number;
        if (prodYearRaw instanceof Date) {
          year = prodYearRaw.getFullYear();
        } else if (typeof prodYearRaw === 'string' && prodYearRaw.includes('-')) {
          year = new Date(prodYearRaw).getFullYear();
        } else {
          year = parseInt(prodYearRaw) || new Date().getFullYear();
        }
        const mileage = typeof sv.mileage === 'number' ? sv.mileage : (parseInt(sv.mileage) || null);
        const crmVehicleId = sv.model_no || sv.model_code || null;

        // Skip vehicles without a usable VIN
        if (!vin || vin.length < 5) {
          syncedVehicles.push({
            id: null,
            brand: brandName,
            model: modelName,
            year,
            action: 'skipped_no_vin',
          });
          continue;
        }

        // DEDUP: Check if vehicle already exists by VIN (globally, not per-user)
        // VIN is a worldwide unique identifier — if it exists for ANY user, don't insert again
        const existingVehicle = await db.query.vehicles.findFirst({
          where: eq(vehicles.vin, vin),
        });

        if (existingVehicle) {
          // Vehicle exists — update mileage if DWH has newer data, and ensure ownership
          const updates: any = {};
          if (mileage && (!existingVehicle.mileage || mileage > existingVehicle.mileage)) {
            updates.mileage = mileage;
          }
          // If vehicle belongs to a different user, reassign to current user (ownership transfer)
          if (existingVehicle.userId !== user.id) {
            updates.userId = user.id;
          }
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date();
            await db.update(vehicles)
              .set(updates)
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
    } catch (error: any) {
      console.error('[dwh.syncVehicles] Error:', error?.message || error);
      console.error('[dwh.syncVehicles] Stack:', error?.stack);
      return { synced: 0, vehicles: [], error: `Sync failed: ${error?.message || 'unknown error'}` };
    }
  });
