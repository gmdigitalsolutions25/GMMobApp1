/**
 * Qaraj GM — Auth Store
 *
 * Manages authentication state with SecureStore for sensitive data (JWT, phone).
 * AsyncStorage is still used for non-sensitive app state (vehicles, settings).
 *
 * Session rules:
 *   - JWT token: 30-day expiry (server-side)
 *   - Quick unlock (PIN/biometric): within 7 days of last activity
 *   - Full re-auth (OTP): after 30 days or manual logout
 *
 * Phone number is the primary identifier for all user data.
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  JWT_TOKEN: 'qaraj_jwt_token',
  USER_PHONE: 'qaraj_user_phone',
  USER_DATA: 'qaraj_user_data',
  LAST_ACTIVITY: 'qaraj_last_activity',
  BIOMETRIC_ENABLED: 'qaraj_biometric_enabled',
  PIN_SET: 'qaraj_pin_set',
};

// ── Token Management ──────────────────────────────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.JWT_TOKEN, token);
  await SecureStore.setItemAsync(KEYS.LAST_ACTIVITY, Date.now().toString());
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.JWT_TOKEN);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.JWT_TOKEN);
}

// ── Phone (Primary ID) ───────────────────────────────────────────────────────

export async function savePhone(phone: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.USER_PHONE, phone);
}

export async function getPhone(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.USER_PHONE);
}

export async function clearPhone(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.USER_PHONE);
}

// ── User Data Cache ───────────────────────────────────────────────────────────

export interface CachedUser {
  id: string;
  phone: string;
  username: string;
  email?: string;
  avatar?: string;
  language: string;
  theme: string;
  createdAt: string;
}

export async function saveUserData(user: CachedUser): Promise<void> {
  await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
}

export async function getUserData(): Promise<CachedUser | null> {
  const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data) as CachedUser;
  } catch {
    return null;
  }
}

export async function clearUserData(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.USER_DATA);
}

// ── Activity Tracking ─────────────────────────────────────────────────────────

export async function updateLastActivity(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.LAST_ACTIVITY, Date.now().toString());
}

export async function getLastActivity(): Promise<number> {
  const ts = await SecureStore.getItemAsync(KEYS.LAST_ACTIVITY);
  return ts ? parseInt(ts, 10) : 0;
}

/**
 * Determine what auth level is needed based on last activity.
 *
 * - 'none': Active within 1 hour → go straight to home
 * - 'pin': Active within 7 days → ask for PIN or biometric
 * - 'otp': Inactive for 30+ days or no session → full re-auth
 */
export async function getRequiredAuthLevel(): Promise<'none' | 'pin' | 'otp'> {
  const token = await getToken();
  if (!token) return 'otp';

  const lastActivity = await getLastActivity();
  if (!lastActivity) return 'otp';

  const now = Date.now();
  const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

  if (hoursSinceActivity < 1) return 'none';       // Fresh — skip auth (1 hour grace)
  if (hoursSinceActivity < 7 * 24) return 'pin';   // Within a week — PIN/biometric
  return 'otp';                                      // Stale — full re-auth
}

// ── Biometric Preference ──────────────────────────────────────────────────────

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
}

export async function isBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
  return val === 'true';
}

// ── PIN Status ────────────────────────────────────────────────────────────────

export async function setPinStatus(isSet: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.PIN_SET, isSet ? 'true' : 'false');
}

export async function isPinSet(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(KEYS.PIN_SET);
  return val === 'true';
}

// ── Full Logout ───────────────────────────────────────────────────────────────

export async function clearAllAuthData(): Promise<void> {
  await Promise.all([
    clearToken(),
    clearPhone(),
    clearUserData(),
    SecureStore.deleteItemAsync(KEYS.LAST_ACTIVITY),
    SecureStore.deleteItemAsync(KEYS.BIOMETRIC_ENABLED),
    SecureStore.deleteItemAsync(KEYS.PIN_SET),
  ]);
}
