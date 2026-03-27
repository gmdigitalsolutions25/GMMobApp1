import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { vehicles } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const deleteVehicleProcedure = publicProcedure
  .input(z.object({ vehicleId: z.string().uuid() }))
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');
      const result = await db
        .delete(vehicles)
        .where(eq(vehicles.id, input.vehicleId))
        .returning({ id: vehicles.id });

      return { success: result.length > 0 };
    } catch (error) {
      console.error('[vehicles.delete] DB error:', error);
      throw new Error('Failed to delete vehicle. Please try again.');
    }
  });
