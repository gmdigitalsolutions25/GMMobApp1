import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const getVehiclesByPhoneProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string(),
    })
  )
  .query(async ({ input }: { input: { phone: string } }) => {
    console.log("Fetching vehicles for phone:", input.phone);

    return {
      vehicles: [],
    };
  });
