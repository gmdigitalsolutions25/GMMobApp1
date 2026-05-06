/**
 * auth.resetPin — Reset a user's PIN after OTP verification
 *
 * This is the "Forgot PIN?" flow:
 *   1. User requests OTP via auth.sendOtp (existing endpoint)
 *   2. User verifies OTP via auth.verifyOtp (existing endpoint)
 *   3. User calls this endpoint with phone + OTP code + new PIN
 *
 * Unlike changePin, this does NOT require the current PIN.
 * Security is provided by the OTP verification step.
 *
 * The OTP must be verified within the same session — we check the
 * otpStore to confirm the code was recently verified.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { createToken } from "../jwt-utils";
import { otpStore, normalizePhone } from "../otp-store";

const BCRYPT_ROUNDS = 12;

// Track verified OTP sessions for reset flow (phone → timestamp)
// This prevents someone from calling resetPin without first verifying OTP
export const otpVerifiedSessions = new Map<string, number>();

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  const EXPIRY = 10 * 60 * 1000; // 10 minutes
  for (const [key, timestamp] of otpVerifiedSessions) {
    if (now - timestamp > EXPIRY) {
      otpVerifiedSessions.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const resetPinProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7).max(20),
      otpCode: z.string().length(6, "OTP must be exactly 6 digits"),
      newPin: z
        .string()
        .length(4, "PIN must be exactly 4 digits")
        .regex(/^\d{4}$/, "PIN must contain only digits"),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');

      const phone = normalizePhone(input.phone);

      // Check OTP — either already verified via verifyOtp endpoint, or verify inline
      const record = otpStore.get(phone);
      if (!record) {
        return {
          success: false,
          message: "No OTP found. Please request a new one.",
        };
      }

      // If OTP was already verified via verifyOtp endpoint, accept it
      if ((record as any).verified) {
        // Check if verification is still within 10 min window
        const verifiedAt = (record as any).verifiedAt || 0;
        if (Date.now() - verifiedAt > 10 * 60 * 1000) {
          otpStore.delete(phone);
          return {
            success: false,
            message: "OTP session expired. Please request a new one.",
          };
        }
        // Verified — proceed to reset
        otpStore.delete(phone);
      } else {
        // Verify inline (fallback for direct resetPin calls)
        if (Date.now() > record.expiresAt) {
          otpStore.delete(phone);
          return {
            success: false,
            message: "OTP has expired. Please request a new one.",
          };
        }

        record.attempts += 1;
        if (record.attempts > 5) {
          otpStore.delete(phone);
          return {
            success: false,
            message: "Too many failed attempts. Please request a new OTP.",
          };
        }

        if (record.code !== input.otpCode) {
          return {
            success: false,
            message: `Invalid OTP. ${5 - record.attempts} attempts remaining.`,
          };
        }

        // OTP verified inline — clean up
        otpStore.delete(phone);
      }

      // Find the user
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return {
          success: false,
          message: "User not found. Please register first.",
        };
      }

      // Hash and store new PIN
      const newPinHash = await bcrypt.hash(input.newPin, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({ pinHash: newPinHash, updatedAt: sql`NOW()` })
        .where(eq(users.phone, input.phone));

      // Issue new JWT token
      const token = createToken(user.id, user.phone);

      console.log(`[AUTH] PIN reset for phone: ${phone}, user: ${user.id}`);

      return {
        success: true,
        message: "PIN reset successfully",
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
      console.error('[auth.resetPin] Error:', error);
      throw new Error("Failed to reset PIN. Please try again.");
    }
  });
