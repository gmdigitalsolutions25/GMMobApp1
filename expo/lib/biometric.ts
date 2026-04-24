/**
 * Qaraj GM — Biometric Authentication Utility
 *
 * Uses expo-local-authentication for fingerprint/face unlock.
 * Biometric is LOCAL only — it unlocks the stored JWT token on the device.
 * The biometric data is never sent to the server.
 *
 * Flow:
 *   1. After first PIN setup, prompt user to enable biometric
 *   2. On subsequent app opens (within 7 days), offer biometric first
 *   3. If biometric fails 3 times, fall back to PIN entry
 */

import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | 'none';
  isEnrolled: boolean;
}

/**
 * Check if the device supports biometric authentication and has it enrolled.
 */
export async function checkBiometricAvailability(): Promise<BiometricStatus> {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isAvailable || !isEnrolled) {
      return { isAvailable: false, biometricType: 'none', isEnrolled: false };
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: BiometricStatus['biometricType'] = 'none';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return { isAvailable: true, biometricType, isEnrolled: true };
  } catch (error) {
    console.error('[Biometric] Availability check failed:', error);
    return { isAvailable: false, biometricType: 'none', isEnrolled: false };
  }
}

/**
 * Prompt the user for biometric authentication.
 * Returns true if authenticated, false if failed or cancelled.
 */
export async function authenticateWithBiometric(
  promptMessage: string = 'Authenticate to access Qaraj'
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true, // We handle PIN fallback ourselves
      fallbackLabel: 'Use PIN',
    });

    return result.success;
  } catch (error) {
    console.error('[Biometric] Authentication failed:', error);
    return false;
  }
}

/**
 * Get a human-readable label for the biometric type.
 */
export function getBiometricLabel(type: BiometricStatus['biometricType']): string {
  switch (type) {
    case 'fingerprint': return 'Fingerprint';
    case 'face': return 'Face ID';
    case 'iris': return 'Iris';
    default: return 'Biometric';
  }
}
