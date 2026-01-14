import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getVehiclesByPhoneProcedure } from "./routes/vehicles/get-by-phone/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  vehicles: createTRPCRouter({
    getByPhone: getVehiclesByPhoneProcedure,
  }),
});

export type AppRouter = typeof appRouter;
