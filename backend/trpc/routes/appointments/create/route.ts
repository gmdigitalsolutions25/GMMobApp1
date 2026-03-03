import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, appointments } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const createAppointmentProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      vehicleId: z.string().uuid(),
      serviceTypes: z.array(z.string()).min(1),
      serviceCenter: z.string(),
      serviceCenterAddress: z.string().optional(),
      serviceCenterId: z.string().uuid().optional(),
      date: z.string(),
      time: z.string(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');
      // Find or auto-create user
      let user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ phone: input.phone, username: input.phone })
          .returning();
        user = newUser;
      }

      // Create appointment
      const [appointment] = await db
        .insert(appointments)
        .values({
          userId: user.id,
          vehicleId: input.vehicleId,
          serviceCenter: input.serviceCenter,
          serviceCenterAddress: input.serviceCenterAddress,
          serviceCenterId: input.serviceCenterId ?? null,
          serviceTypes: input.serviceTypes,
          date: input.date,
          time: input.time,
          status: 'pending',
          notes: input.notes,
        })
        .returning();

      return {
        success: true,
        appointment: {
          id: appointment.id,
          vehicleId: appointment.vehicleId,
          serviceTypes: appointment.serviceTypes,
          serviceCenter: appointment.serviceCenter,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          notes: appointment.notes ?? undefined,
          createdAt: appointment.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('[appointments.create] DB error:', error);
      throw new Error('Failed to create appointment. Please try again.');
    }
  });
