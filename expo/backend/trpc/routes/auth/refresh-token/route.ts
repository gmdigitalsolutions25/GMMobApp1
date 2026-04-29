/**
 * auth.refreshToken — Refresh a JWT token before it expires
 *
 * Called by the mobile app when the token is within 7 days of expiry.
 * Requires a valid (non-expired) token to issue a new one.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { verifyToken, createToken } from "../jwt-utils";

export const refreshTokenProcedure = publicProcedure
  .input(
    z.object({
      token: z.string().min(10).max(500),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify the existing token
      const payload = verifyToken(input.token);

      if (!payload) {
        return {
          success: false,
          message: "Token is invalid or expired. Please log in again.",
          requiresReauth: true,
        };
      }

      // Verify user still exists in DB
      if (db) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.userId),
        });

        if (!user) {
          return {
            success: false,
            message: "User not found. Please log in again.",
            requiresReauth: true,
          };
        }

        // Issue new token
        const newToken = createToken(user.id, user.phone);

        console.log(`[AUTH] Token refreshed for user: ${user.id}`);

        return {
          success: true,
          message: "Token refreshed successfully",
          token: newToken,
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
      }

      // No DB — just reissue based on token payload
      const newToken = createToken(payload.userId, payload.phone);
      return {
        success: true,
        message: "Token refreshed successfully",
        token: newToken,
      };
    } catch (error) {
      console.error('[auth.refreshToken] Error:', error);
      throw new Error("Failed to refresh token. Please try again.");
    }
  });
