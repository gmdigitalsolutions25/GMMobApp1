/**
 * Shared in-memory OTP store
 *
 * Both send-otp and verify-otp import from this single module,
 * ensuring they share the same Map instance.
 *
 * In production with multiple server instances, replace with Redis.
 */

export interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

export const otpStore: Map<string, OtpRecord> = new Map();

/**
 * Normalize phone number to last 9 digits for consistent lookup.
 * This handles various formats: +994501234567, 994501234567, 0501234567, 501234567
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Always use last 9 digits — the actual subscriber number
  return digits.length >= 9 ? digits.slice(-9) : digits;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore) {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
