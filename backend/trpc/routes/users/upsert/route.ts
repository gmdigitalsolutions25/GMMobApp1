import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";

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
    try {
      const [user] = await db
        .insert(users)
        .values({
          phone: input.phone,
          username: input.username,
          email: input.email,
          avatar: input.avatar,
          language: input.language,
          theme: input.theme,
        })
        .onConflictDoUpdate({
          target: users.phone,
          set: {
            username: input.username,
            email: input.email ?? null,
            avatar: input.avatar ?? null,
            language: input.language,
            theme: input.theme,
            updatedAt: sql`NOW()`,
          },
        })
        .returning();

      return {
        success: true,
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
      console.error('[users.upsert] DB error:', error);
      throw new Error('Failed to save user. Please try again.');
    }
  });
