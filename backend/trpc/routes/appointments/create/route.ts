import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { appointmentStore, userStore } from "@/backend/store";

export const createAppointmentProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      vehicleId: z.string(),
      serviceTypes: z.array(z.string()).min(1),
      serviceCenter: z.string(),
      serviceCenterAddress: z.string().optional(),
      date: z.string(),
      time: z.string(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    let user = userStore.getByPhone(input.phone);
    if (!user) {
      user = userStore.upsert({
        phone: input.phone,
        username: input.phone,
        language: "en",
        theme: "dark",
      });
    }

    const appointment = appointmentStore.create({
      userId: user.id,
      vehicleId: input.vehicleId,
      serviceTypes: input.serviceTypes,
      serviceCenter: input.serviceCenter,
      serviceCenterAddress: input.serviceCenterAddress,
      date: input.date,
      time: input.time,
      status: "pending",
      notes: input.notes,
    });

    return { success: true, appointment };
  });
