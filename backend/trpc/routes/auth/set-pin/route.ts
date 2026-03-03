/**
 * auth.setPin — Store a bcrypt-hashed PIN for a user
 *
 * Called after OTP verification when the user sets their PIN for the first time.
 * The raw PIN is never stored — only the bcrypt hash.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";

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

      // Find or create user
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
      }

      return { success: true, message: "PIN set successfully" };
    } catch (error) {
      console.error('[auth.setPin] Error:', error);
      throw new Error("Failed to set PIN. Please try again.");
    }
  });
