import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { appointmentStore } from "@/backend/store";

export const updateAppointmentStatusProcedure = publicProcedure
  .input(
    z.object({
      appointmentId: z.string(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    })
  )
  .mutation(async ({ input }) => {
    const appointment = appointmentStore.updateStatus(input.appointmentId, input.status);
    if (!appointment) {
      throw new Error(`Appointment ${input.appointmentId} not found`);
    }
    return { success: true, appointment };
  });
