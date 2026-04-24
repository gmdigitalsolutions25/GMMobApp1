/**
 * auth.verifyPin — Verify a PIN against the stored bcrypt hash and return JWT
 *
 * Returns success: true with JWT token and user profile if PIN matches.
 * Returns success: false with a message if the PIN is wrong or user not found.
 *
 * Includes attempt tracking to prevent brute-force attacks.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { createToken } from "../jwt-utils";

// In-memory attempt tracker (replace with Redis in production for multi-instance support)
const pinAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const verifyPinProcedure = publicProcedure
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

      // Check lockout
      const tracker = pinAttempts.get(input.phone);
      if (tracker && tracker.lockedUntil > Date.now()) {
        const remainingSeconds = Math.ceil((tracker.lockedUntil - Date.now()) / 1000);
        return {
          success: false,
          message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
          locked: true,
        };
      }

      // Fetch user by phone (primary identifier)
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { success: false, message: "User not found. Please register first." };
      }

      // New user — no PIN set yet (first-time setup)
      if (!user.pinHash) {
        return {
          success: false,
          message: "No PIN set. Please set a PIN first.",
          requiresPinSetup: true,
        };
      }

      // Compare PIN with stored hash
      const isValid = await bcrypt.compare(input.pin, user.pinHash);

      if (!isValid) {
        // Track failed attempt
        const current = pinAttempts.get(input.phone) ?? { count: 0, lockedUntil: 0 };
        current.count += 1;

        if (current.count >= MAX_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
          pinAttempts.set(input.phone, current);
          return {
            success: false,
            message: "Too many failed attempts. Your account is locked for 5 minutes.",
            locked: true,
          };
        }

        pinAttempts.set(input.phone, current);
        return {
          success: false,
          message: `Incorrect PIN. ${MAX_ATTEMPTS - current.count} attempts remaining.`,
        };
      }

      // PIN correct — clear attempt tracker and issue JWT
      pinAttempts.delete(input.phone);

      const token = createToken(user.id, user.phone);

      console.log(`[AUTH] PIN verified for phone: ${input.phone}, user: ${user.id}`);

      return {
        success: true,
        message: "PIN verified successfully",
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
      console.error('[auth.verifyPin] Error:', error);
      throw new Error("Failed to verify PIN. Please try again.");
    }
  });
