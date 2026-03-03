import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { vehicleStore } from "@/backend/store";

export const getVehiclesByPhoneProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    console.log("Fetching vehicles for phone:", input.phone);
    const vehicles = vehicleStore.getByPhone(input.phone);
    return { vehicles };
  });
