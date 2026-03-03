import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const getUserByPhoneProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) return { user: null };

      return {
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          email: user.email ?? undefined,
          avatar: user.avatar ?? undefined,
          language: user.language,
          theme: user.theme,
          createdAt: user.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('[users.getByPhone] DB error:', error);
      return { user: null };
    }
  });
