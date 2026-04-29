/**
 * JWT utility for Qaraj GM authentication
 *
 * Uses HMAC-SHA256 (HS256) for token signing.
 * No external dependency — uses Node.js built-in crypto module.
 *
 * Token payload:
 *   { userId: string, phone: string, iat: number, exp: number }
 *
 * Token lifetime: 30 days (configurable via JWT_EXPIRY_DAYS env var)
 */

import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.QARAJ_API_KEY || 'qaraj-jwt-secret-change-in-production';
const JWT_EXPIRY_DAYS = parseInt(process.env.JWT_EXPIRY_DAYS || '30', 10);

interface JwtPayload {
  userId: string;
  phone: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function sign(payload: string, header: string): string {
  const input = `${header}.${payload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(input)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return signature;
}

/**
 * Create a signed JWT token for an authenticated user.
 */
export function createToken(userId: string, phone: string): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + JWT_EXPIRY_DAYS * 24 * 60 * 60;

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId,
      phone,
      iat: now,
      exp,
    })
  );

  const signature = sign(payload, header);
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify and decode a JWT token.
 * Returns the payload if valid, null if invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature (timing-safe comparison to prevent timing attacks)
    const expectedSignature = sign(payload, header);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      console.log('[JWT] Invalid signature');
      return null;
    }

    // Decode and check expiry
    const decoded = JSON.parse(base64UrlDecode(payload)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      console.log(`[JWT] Token expired for user ${decoded.phone}`);
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    return null;
  }
}

/**
 * Check if a token is close to expiry (within 7 days).
 * Used to trigger token refresh on the client side.
 */
export function isTokenNearExpiry(token: string): boolean {
  const payload = verifyToken(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  const sevenDays = 7 * 24 * 60 * 60;
  return payload.exp - now < sevenDays;
}
