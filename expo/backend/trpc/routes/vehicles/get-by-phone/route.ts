import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, vehicles } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const getVehiclesByPhoneProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    try {
      // Look up user by phone
      if (!db) return { vehicles: [] };
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { vehicles: [] };
      }

      // Fetch all vehicles for this user
      const userVehicles = await db.query.vehicles.findMany({
        where: eq(vehicles.userId, user.id),
        with: { photos: true },
        orderBy: (v, { desc }) => [desc(v.createdAt)],
      });

      const mapped = userVehicles.map((v) => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        vin: v.vin ?? '',
        licensePlate: v.licensePlate ?? '',
        mileage: v.mileage ?? undefined,
        color: v.color ?? undefined,
        photos: (v as any).photos?.map((p: any) => p.uri) ?? [],
        primaryPhoto:
          (v as any).photos?.find((p: any) => p.isPrimary)?.uri ??
          (v as any).photos?.[0]?.uri ??
          undefined,
        createdAt: v.createdAt.toISOString(),
      }));

      return { vehicles: mapped };
    } catch (error) {
      console.error('[vehicles.getByPhone] DB error:', error);
      return { vehicles: [] };
    }
  });
