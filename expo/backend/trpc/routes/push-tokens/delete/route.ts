/**
 * pushTokens.delete — Remove a push token from the database
 *
 * Admin endpoint: removes invalid or stale push tokens.
 * Requires adminKey for authorization.
 */
import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { pushTokens } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const deletePushTokenProcedure = publicProcedure
  .input(
    z.object({
      token: z.string().min(1).max(500),
      adminKey: z.string().min(1).max(500),
    })
  )
  .mutation(async ({ input }) => {
    const expectedAdminKey = process.env.PUSH_ADMIN_KEY || process.env.QARAJ_API_KEY;
    if (!expectedAdminKey || input.adminKey !== expectedAdminKey) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      if (!db) {
        return { success: false, error: "Database not available" };
      }

      const result = await db
        .delete(pushTokens)
        .where(eq(pushTokens.token, input.token));

      return { success: true, message: `Token deleted` };
    } catch (error) {
      console.error('[pushTokens.delete] Error:', error);
      return { success: false, error: (error as Error).message };
    }
  });
