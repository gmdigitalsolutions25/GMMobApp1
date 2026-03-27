import { publicProcedure } from "../../../create-context";
import { z } from "zod";

// Shared OTP store (same instance as send-otp)
const otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();

// Export for use in send-otp
export { otpStore };

export const verifyOtpProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      code: z.string().length(6),
    })
  )
  .mutation(async ({ input }) => {
    const record = otpStore.get(input.phone);

    if (!record) {
      return { success: false, message: "No OTP found for this phone number. Please request a new one." };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(input.phone);
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    record.attempts += 1;

    if (record.attempts > 5) {
      otpStore.delete(input.phone);
      return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }

    if (record.code !== input.code) {
      return { success: false, message: `Invalid OTP. ${5 - record.attempts} attempts remaining.` };
    }

    // OTP verified — clean up
    otpStore.delete(input.phone);

    return { success: true, message: "OTP verified successfully" };
  });
