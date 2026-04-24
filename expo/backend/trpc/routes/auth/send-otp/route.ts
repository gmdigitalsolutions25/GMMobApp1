/**
 * auth.sendOtp — Generate and send OTP to phone number
 *
 * Currently uses mock mode (logs OTP to console + returns devCode).
 * When Twilio is configured, set OTP_PROVIDER=twilio in .env and provide
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { otpStore, normalizePhone, generateOtp } from "../otp-store";

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
    // TODO: When Twilio is ready, add:
    //   if (process.env.OTP_PROVIDER === 'twilio') {
    //     await sendViaTwilio(input.phone, code);
    //   }
    // For now: mock mode — log to console and return in response
    console.log(`[OTP] Phone: +994${phone} | Code: ${code}`);

    return {
      success: true,
      message: "OTP sent successfully",
      // DEVELOPMENT ONLY — remove when Twilio is active:
      devCode: process.env.OTP_PROVIDER !== 'twilio' ? code : undefined,
    };
  });
