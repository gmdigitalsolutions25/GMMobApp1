import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { userStore } from "@/backend/store";

export const getUserByPhoneProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    const user = userStore.getByPhone(input.phone);
    return { user: user ?? null };
  });
