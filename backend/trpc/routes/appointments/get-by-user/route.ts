import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, appointments } from "../../../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const getAppointmentsByUserProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) return { appointments: [] };

      const userAppointments = await db.query.appointments.findMany({
        where: eq(appointments.userId, user.id),
        orderBy: [desc(appointments.createdAt)],
      });

      const mapped = userAppointments.map((a) => ({
        id: a.id,
        vehicleId: a.vehicleId,
        serviceTypes: a.serviceTypes,
        serviceCenter: a.serviceCenter,
        serviceCenterAddress: a.serviceCenterAddress ?? undefined,
        date: a.date,
        time: a.time,
        status: a.status,
        notes: a.notes ?? undefined,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }));

      return { appointments: mapped };
    } catch (error) {
      console.error('[appointments.getByUser] DB error:', error);
      return { appointments: [] };
    }
  });
