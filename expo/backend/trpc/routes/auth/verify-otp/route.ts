/**
 * auth.verifyOtp — Verify OTP code for a phone number
 *
 * On success, returns whether the user exists (hasPin) so the client
 * knows whether to show PIN setup or PIN entry.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { otpStore, normalizePhone } from "../otp-store";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const verifyOtpProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      code: z.string().length(6),
    })
  )
  .mutation(async ({ input }) => {
    const phone = normalizePhone(input.phone);
    const record = otpStore.get(phone);

    if (!record) {
      return { success: false, message: "No OTP found for this phone number. Please request a new one." };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    record.attempts += 1;

    if (record.attempts > 5) {
      otpStore.delete(phone);
      return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    if (record.code !== input.code) {
      return { success: false, message: `Invalid OTP. ${5 - record.attempts} attempts remaining.` };
    }

    // OTP verified — clean up
    otpStore.delete(phone);

    // Check if user exists and has a PIN set
    let hasPin = false;
    let userId: string | null = null;

    if (db) {
      try {
        // Search by last 9 digits using LIKE pattern
        const user = await db.query.users.findFirst({
          where: eq(users.phone, input.phone),
        });

        if (user) {
          hasPin = !!user.pinHash;
          userId = user.id;
        }
      } catch (error) {
        console.error('[auth.verifyOtp] DB lookup error:', error);
      }
    }

    return {
      success: true,
      message: "OTP verified successfully",
      hasPin,
      userId,
      // Client uses hasPin to decide: true → show PIN entry, false → show PIN setup
    };
  });
