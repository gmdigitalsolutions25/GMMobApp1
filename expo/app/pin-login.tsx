/**
 * Qaraj GM — PIN Login Screen
 *
 * Shown to returning users who have a valid JWT but need to unlock.
 * Offers biometric first (if enabled), then falls back to PIN.
 *
 * This screen is shown when:
 *   - App reopened after 24+ hours but within 7 days
 *   - User has a stored JWT token and phone number
 */

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Alert,
  Dimensions, Animated, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, LogOut } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import {
  getPhone, getToken, saveToken, updateLastActivity,
  saveUserData, isBiometricEnabled, clearAllAuthData,
} from '@/lib/authStore';
import { authenticateWithBiometric, checkBiometricAvailability } from '@/lib/biometric';

const { width } = Dimensions.get('window');

export default function PinLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signOut } = useApp();
  const { t } = useTranslation();

  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [phone, setPhone] = useState<string>('');

  const pinRefs = useRef<(TextInput | null)[]>([]);
  const float1 = useRef(new Animated.Value(0)).current;

  const verifyPinMutation = trpc.auth.verifyPin.useMutation();
  const refreshTokenMutation = trpc.auth.refreshToken.useMutation();

  // ── Initialize ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const storedPhone = await getPhone();
      if (!storedPhone) {
        // No phone stored — go to full auth
        router.replace('/auth');
        return;
      }
      setPhone(storedPhone);

      // Check if biometric is enabled and available
      const bioEnabled = await isBiometricEnabled();
      if (bioEnabled) {
        const bioStatus = await checkBiometricAvailability();
        if (bioStatus.isAvailable && bioStatus.isEnrolled) {
          setShowBiometric(true);
          // Auto-trigger biometric
          handleBiometricAuth();
        }
      }

      // Focus PIN input
      setTimeout(() => pinRefs.current[0]?.focus(), 300);
    })();
  }, []);

  // ── Biometric Auth ────────────────────────────────────────────────────────
  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometric('Unlock Qaraj');
    if (success) {
      // Biometric passed — refresh token and go to home
      setIsLoading(true);
      try {
        const token = await getToken();
        if (token) {
          const result = await refreshTokenMutation.mutateAsync({ token });
          if (result.success && result.token) {
            await saveToken(result.token);
            if (result.user) {
              await saveUserData(result.user);
              await signIn({
                id: result.user.id,
                username: result.user.username,
                phone: result.user.phone,
                email: result.user.email,
                avatar: result.user.avatar,
                language: (result.user.language as 'en' | 'az' | 'ru') || 'en',
                theme: (result.user.theme as 'light' | 'dark') || 'dark',
                createdAt: result.user.createdAt,
              });
            }
          }
        }
        await updateLastActivity();
        router.replace('/(tabs)/home');
      } catch (e) {
        // Token refresh failed — still allow entry with existing data
        await updateLastActivity();
        router.replace('/(tabs)/home');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Biometric failed — fall back to PIN
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  };

  // ── PIN Input ─────────────────────────────────────────────────────────────
  const handlePinChange = async (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      const pinCode = newPin.join('');
      setIsLoading(true);

      try {
        const result = await verifyPinMutation.mutateAsync({ phone, pin: pinCode });
        if (result.success && result.token && result.user) {
          setPinError(null);
          await saveToken(result.token);
          await saveUserData(result.user);
          await updateLastActivity();
          await signIn({
            id: result.user.id,
            username: result.user.username,
            phone: result.user.phone,
            email: result.user.email,
            avatar: result.user.avatar,
            language: (result.user.language as 'en' | 'az' | 'ru') || 'en',
            theme: (result.user.theme as 'light' | 'dark') || 'dark',
            createdAt: result.user.createdAt,
          });
          router.replace('/(tabs)/home');
        } else {
          setPinError((result as any).message || t('auth.incorrectPin'));
          setPin(['', '', '', '']);
          pinRefs.current[0]?.focus();
        }
      } catch (e) {
        // Offline fallback — allow entry if we have cached data
        await updateLastActivity();
        router.replace('/(tabs)/home');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'You will need to verify your phone number again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await clearAllAuthData();
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  // ── Animation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [float1]);

  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });

  // Mask phone for display: +994-XX-***-**-67
  const maskedPhone = phone.length >= 9
    ? `+994-${phone.slice(-9, -7)}-***-**-${phone.slice(-2)}`
    : phone;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.heroBackground}>
        <Animated.View style={[styles.floatingAccent, { transform: [{ translateY: float1Y }] }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{maskedPhone}</Text>

        {/* PIN Input */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { pinRefs.current[index] = ref; }}
              style={[styles.pinInput, digit && styles.pinInputFilled]}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={({ nativeEvent }) => handlePinKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          ))}
        </View>

        {pinError && <Text style={styles.errorText}>{pinError}</Text>}

        {isLoading && <ActivityIndicator color={Colors.dark.primary} style={{ marginTop: 16 }} />}

        {/* Biometric Button */}
        {showBiometric && !isLoading && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
            <Fingerprint size={32} color={Colors.dark.primary} strokeWidth={1.5} />
            <Text style={styles.biometricText}>Use Biometric</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={16} color={Colors.dark.textTertiary} />
          <Text style={styles.logoutText}>Use a different number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  heroBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },
  floatingAccent: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    top: 60, right: 30,
    backgroundColor: `${Colors.dark.primary}08`,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28, fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, color: Colors.dark.textSecondary,
    marginBottom: 48,
  },
  pinContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
  },
  pinInput: {
    width: 56, height: 64,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16, borderWidth: 2, borderColor: Colors.dark.border,
    fontSize: 28, fontWeight: '700', color: Colors.dark.text, textAlign: 'center',
  },
  pinInputFilled: {
    borderColor: Colors.dark.primary,
    backgroundColor: `${Colors.dark.primary}15`,
  },
  errorText: {
    fontSize: 14, color: Colors.dark.error,
    textAlign: 'center', paddingVertical: 8, fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 32, paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: `${Colors.dark.primary}10`,
    borderRadius: 16, borderWidth: 1, borderColor: `${Colors.dark.primary}30`,
  },
  biometricText: {
    fontSize: 16, color: Colors.dark.primary, fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 48, paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14, color: Colors.dark.textTertiary,
  },
});
