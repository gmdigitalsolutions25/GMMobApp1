/**
 * auth.sendOtp — Generate and send OTP to phone number
 *
 * Uses Softline SMS gateway when SMS_PROVIDER=softline in .env.
 * Falls back to mock mode (logs OTP to console + returns devCode).
 *
 * Softline config (.env):
 *   SMS_PROVIDER=softline
 *   SMS_USER=diamondapi
 *   SMS_PASSWORD=u6s0Wo52
 *   SMS_SENDER=TOYOTA
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { otpStore, normalizePhone, generateOtp } from "../otp-store";
import { sendOtpSms } from "../sms-provider";

export const sendOtpProcedure = publicProcedure
  .input(z.object({ phone: z.string().min(7) }))
  .mutation(async ({ input }) => {
    const phone = normalizePhone(input.phone);
    const existing = otpStore.get(phone);

    // Rate limit: don't resend within 60 seconds
    if (existing && existing.expiresAt - 240000 > Date.now()) {
      return {
        success: false,
        message: "OTP already sent. Please wait before requesting a new one.",
        retryAfterSeconds: Math.ceil((existing.expiresAt - 240000 - Date.now()) / 1000),
      };
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, { code, expiresAt, attempts: 0 });

    // ── OTP Delivery ──────────────────────────────────────────────────────
    const smsResult = await sendOtpSms(phone, code);

    if (!smsResult.success) {
      console.error(`[OTP] SMS delivery failed for ${phone}: ${smsResult.error}`);
      // Still return success to client — OTP is stored, they can retry
      // Don't expose SMS provider errors to the client
    }

    const isMockMode = (process.env.SMS_PROVIDER || 'mock') === 'mock';

    return {
      success: true,
      message: smsResult.success
        ? "OTP sent successfully"
        : "OTP generated. SMS delivery may be delayed.",
      // DEVELOPMENT ONLY — only return code in mock mode:
      devCode: isMockMode ? code : undefined,
      // Include balance info for monitoring (only in non-mock mode):
      ...(smsResult.balance && !isMockMode ? { _smsBalance: smsResult.balance } : {}),
    };
  });
