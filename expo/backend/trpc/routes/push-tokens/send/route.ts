/**
 * pushTokens.send — Send a push notification to a user by phone number
 *
 * Admin endpoint: looks up the user's Expo Push Token(s) from the DB,
 * then sends the notification via Expo Push API.
 *
 * Supports:
 *   - title, body, data (arbitrary JSON payload)
 *   - type: appointment | service | vehicle | promotion | general
 */
import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { pushTokens, users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export const sendPushProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      title: z.string().min(1),
      body: z.string().min(1),
      data: z.record(z.unknown()).optional(),
      adminKey: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    // SECURITY: Require admin key for sending push notifications
    const expectedAdminKey = process.env.PUSH_ADMIN_KEY || process.env.QARAJ_API_KEY;
    if (!expectedAdminKey || input.adminKey !== expectedAdminKey) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid admin key for push notifications',
      });
    }
    try {
      if (!db) {
        return { success: false, error: "Database not available" };
      }

      // 1. Find user by phone
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { success: false, error: `User not found for phone: ${input.phone}` };
      }

      // 2. Find all push tokens for this user
      const tokens = await db.query.pushTokens.findMany({
        where: eq(pushTokens.userId, user.id),
      });

      if (tokens.length === 0) {
        return { success: false, error: `No push tokens registered for user ${user.id}` };
      }

      // 3. Send push notification via Expo Push API
      const messages = tokens.map((t) => ({
        to: t.token,
        sound: "default" as const,
        title: input.title,
        body: input.body,
        data: input.data || {},
      }));

      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

      console.log(
        `[pushTokens.send] Sent to ${tokens.length} device(s) for ${input.phone}: ${input.title}`
      );

      return {
        success: true,
        devicesReached: tokens.length,
        expoResponse: result,
      };
    } catch (error) {
      console.error("[pushTokens.send] Error:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  });
