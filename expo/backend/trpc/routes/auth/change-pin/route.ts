/**
 * auth.changePin — Change a user's PIN after verifying the current one
 *
 * Requires the current PIN to be correct before allowing a new PIN to be set.
 * The new PIN is hashed with bcrypt before storage.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";

const BCRYPT_ROUNDS = 12;

export const changePinProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      currentPin: z
        .string()
        .length(4)
        .regex(/^\d{4}$/),
      newPin: z
        .string()
        .length(4, "New PIN must be exactly 4 digits")
        .regex(/^\d{4}$/, "New PIN must contain only digits"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');
      if (input.currentPin === input.newPin) {
        return {
          success: false,
          message: "New PIN must be different from the current PIN.",
        };
      }

      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user || !user.pinHash) {
        return { success: false, message: "User not found or no PIN set." };
      }

      // Verify current PIN
      const isCurrentValid = await bcrypt.compare(input.currentPin, user.pinHash);
      if (!isCurrentValid) {
        return { success: false, message: "Current PIN is incorrect." };
      }

      // Hash and store new PIN
      const newPinHash = await bcrypt.hash(input.newPin, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({ pinHash: newPinHash, updatedAt: sql`NOW()` })
        .where(eq(users.phone, input.phone));

      return { success: true, message: "PIN changed successfully." };
    } catch (error) {
      console.error('[auth.changePin] Error:', error);
      throw new Error("Failed to change PIN. Please try again.");
    }
  });
