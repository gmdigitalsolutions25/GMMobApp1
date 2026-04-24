/**
 * auth.setPin — Store a bcrypt-hashed PIN for a user and return JWT
 *
 * Called after OTP verification when the user sets their PIN for the first time.
 * The raw PIN is never stored — only the bcrypt hash.
 * Returns a JWT token for session management.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { createToken } from "../jwt-utils";
import { normalizePhone } from "../otp-store";

const BCRYPT_ROUNDS = 12;

export const setPinProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      pin: z
        .string()
        .length(4, "PIN must be exactly 4 digits")
        .regex(/^\d{4}$/, "PIN must contain only digits"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');

      // Hash the PIN with bcrypt (12 rounds ≈ ~300ms, good for PINs)
      const pinHash = await bcrypt.hash(input.pin, BCRYPT_ROUNDS);

      // Find or create user — phone is the primary identifier
      let user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ phone: input.phone, username: input.phone, pinHash })
          .returning();
        user = newUser;
      } else {
        await db
          .update(users)
          .set({ pinHash, updatedAt: sql`NOW()` })
          .where(eq(users.phone, input.phone));
        // Refresh user data
        user = await db.query.users.findFirst({
          where: eq(users.phone, input.phone),
        }) ?? user;
      }

      // Issue JWT token
      const token = createToken(user.id, user.phone);

      console.log(`[AUTH] PIN set for phone: ${normalizePhone(input.phone)}, user: ${user.id}`);

      return {
        success: true,
        message: "PIN set successfully",
        token,
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
      console.error('[auth.setPin] Error:', error);
      throw new Error("Failed to set PIN. Please try again.");
    }
  });
