import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { appointmentStore, userStore } from "@/backend/store";

export const getAppointmentsByUserProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    const user = userStore.getByPhone(input.phone);
    if (!user) return { appointments: [] };
    const appointments = appointmentStore.getByUserId(user.id);
    return { appointments };
  });
