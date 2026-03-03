import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { appointments } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const updateAppointmentStatusProcedure = publicProcedure
  .input(
    z.object({
      appointmentId: z.string().uuid(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const [updated] = await db
        .update(appointments)
        .set({
          status: input.status,
          updatedAt: sql`NOW()`,
        })
        .where(eq(appointments.id, input.appointmentId))
        .returning();

      if (!updated) {
        throw new Error(`Appointment ${input.appointmentId} not found`);
      }

      return {
        success: true,
        appointment: {
          id: updated.id,
          vehicleId: updated.vehicleId,
          serviceTypes: updated.serviceTypes,
          serviceCenter: updated.serviceCenter,
          date: updated.date,
          time: updated.time,
          status: updated.status,
          notes: updated.notes ?? undefined,
          updatedAt: updated.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('[appointments.updateStatus] DB error:', error);
      throw new Error('Failed to update appointment status. Please try again.');
    }
  });
