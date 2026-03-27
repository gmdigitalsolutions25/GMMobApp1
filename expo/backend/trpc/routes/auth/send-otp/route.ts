import { publicProcedure } from "../../../create-context";
import { z } from "zod";

// In-memory OTP store (replace with Redis or DB in production)
const otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtpProcedure = publicProcedure
  .input(z.object({ phone: z.string().min(7) }))
  .mutation(async ({ input }) => {
    const existing = otpStore.get(input.phone);

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

    otpStore.set(input.phone, { code, expiresAt, attempts: 0 });

    // In production: send via SMS gateway (Twilio, Infobip, etc.)
    // For development, the OTP is returned in the response (remove in production!)
    console.log(`[OTP] Phone: ${input.phone} | Code: ${code}`);

    return {
      success: true,
      message: "OTP sent successfully",
      // DEVELOPMENT ONLY — remove in production:
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  });
