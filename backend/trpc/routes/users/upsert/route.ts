import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { userStore } from "@/backend/store";

export const upsertUserProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      username: z.string().min(1),
      email: z.string().email().optional(),
      avatar: z.string().optional(),
      language: z.enum(["en", "az", "ru"]).default("en"),
      theme: z.enum(["light", "dark"]).default("dark"),
    })
  )
  .mutation(async ({ input }) => {
    const user = userStore.upsert({
      phone: input.phone,
      username: input.username,
      email: input.email,
      avatar: input.avatar,
      language: input.language,
      theme: input.theme,
    });
    return { success: true, user };
  });
