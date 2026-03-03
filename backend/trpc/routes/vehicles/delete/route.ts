import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { vehicleStore } from "@/backend/store";

export const deleteVehicleProcedure = publicProcedure
  .input(z.object({ vehicleId: z.string() }))
  .mutation(async ({ input }) => {
    const deleted = vehicleStore.delete(input.vehicleId);
    return { success: deleted };
  });
