/**
 * pushTokens.register — Store an Expo Push Token for a user
 *
 * Called after the user signs in and notification permissions are granted.
 * Tokens are stored per device and used to send server-side push notifications.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, pushTokens } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";

export const registerPushTokenProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      token: z.string().min(10),
      platform: z.enum(["ios", "android"]),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Upsert push token (update if token already exists)
      await db
        .insert(pushTokens)
        .values({
          userId: user.id,
          token: input.token,
          platform: input.platform,
          active: true,
        })
        .onConflictDoUpdate({
          target: pushTokens.token,
          set: {
            userId: user.id,
            platform: input.platform,
            active: true,
            updatedAt: sql`NOW()`,
          },
        });

      return { success: true, message: "Push token registered" };
    } catch (error) {
      console.error('[pushTokens.register] Error:', error);
      return { success: false, message: "Failed to register push token" };
    }
  });
