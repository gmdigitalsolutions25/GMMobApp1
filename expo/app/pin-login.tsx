/**
 * Qaraj GM — PIN Login Screen (v2 Showroom Floor)
 *
 * Shown to returning users who have a valid JWT but need to unlock.
 * Offers biometric first (if enabled), then falls back to PIN.
 *
 * Includes "Forgot PIN?" flow:
 *   Step 1: Send OTP to stored phone
 *   Step 2: Verify OTP
 *   Step 3: Set new PIN
 */

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Animated, ActivityIndicator, ImageBackground,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAlert } from '@/components/CustomAlert';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fingerprint, LogOut, ArrowLeft, Wrench } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useDesignV2, ColorsV2 } from '@/hooks/useDesignV2';
import { AppVersion } from '@/components/AppVersion';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import {
  getPhone, getToken, saveToken, updateLastActivity,
  saveUserData, isBiometricEnabled, clearAllAuthData,
} from '@/lib/authStore';
import { authenticateWithBiometric, checkBiometricAvailability } from '@/lib/biometric';
import { requestNotificationPermissions, registerPushToken } from '@/lib/notifications';

const { width } = Dimensions.get('window');

// Hero images — same set as home screen
const HERO_IMAGES = [
  require('@/assets/images/hero-toyota-land-cruiser.jpg'),
  require('@/assets/images/hero-toyota-camry.jpg'),
  require('@/assets/images/hero-toyota-rav4.jpg'),
  require('@/assets/images/hero-toyota-prado.jpg'),
  require('@/assets/images/hero-toyota-corolla-cross.jpg'),
];

type ResetStep = 'none' | 'otp' | 'newPin';

export default function PinLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signOut } = useApp();
  const { t } = useTranslation();
  const { showInfo, showConfirm } = useAlert();
  const { isV2, theme } = useDesignV2();
  const c = isV2 ? ColorsV2[theme] : (Colors[theme] || Colors.dark);
  const styles = createStyles(c, theme);

  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [resetStep, setResetStep] = useState<ResetStep>('none');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [resetError, setResetError] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [heroIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));

  const pinRefs = useRef<(TextInput | null)[]>([]);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const newPinRefs = useRef<(TextInput | null)[]>([]);
  const float1 = useRef(new Animated.Value(0)).current;

  // tRPC mutations
  const verifyPinMutation = trpc.auth.verifyPin.useMutation();
  const refreshTokenMutation = trpc.auth.refreshToken.useMutation();
  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const resetPinMutation = trpc.auth.resetPin.useMutation();
  const registerPushTokenMutation = trpc.notifications.registerPushToken.useMutation();

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const storedPhone = await getPhone();
      if (!storedPhone) {
        router.replace('/auth');
        return;
      }
      setPhone(storedPhone);

      const bioEnabled = await isBiometricEnabled();
      if (bioEnabled) {
        const bioStatus = await checkBiometricAvailability();
        if (bioStatus.isAvailable && bioStatus.isEnrolled) {
          setShowBiometric(true);
          handleBiometricAuth();
        }
      }

      setTimeout(() => pinRefs.current[0]?.focus(), 300);
    })();
  }, []);

  // ── OTP Countdown Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // ── Biometric Auth ────────────────────────────────────────────────────────
  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometric('Unlock Qaraj');
    if (success) {
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          router.replace('/auth');
          return;
        }
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
        await updateLastActivity();

        // Register push token (non-blocking)
        try {
          await requestNotificationPermissions();
          if (result.user) await registerPushToken(result.user.phone, registerPushTokenMutation.mutateAsync);
        } catch (_) {}

        // Route to onboarding if profile incomplete, otherwise home
        const needsOnboarding = !result.user?.firstName;
        router.replace(needsOnboarding ? '/onboarding' : '/(tabs)/home');
      } catch (e: any) {
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        const msg = isNetworkError
          ? t('auth.networkError')
          : (e?.message || t('auth.networkError'));
        setPinError(msg);
        setPin(['', '', '', '']);
        pinRefs.current[0]?.focus();
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  };

  // ── PIN Input ─────────────────────────────────────────────────────────────
  const handlePinChange = async (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...pin];
    updated[index] = value;
    setPin(updated);
    setPinError(null);

    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    // When all 4 digits entered, verify
    if (updated.every(digit => digit !== '')) {
      const pinCode = updated.join('');
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

          // Register push token (non-blocking)
          try {
            await requestNotificationPermissions();
            await registerPushToken(result.user.phone, registerPushTokenMutation.mutateAsync);
          } catch (_) {}

          // Route to onboarding if profile incomplete, otherwise home
          const needsOnboarding = !result.user?.firstName;
          router.replace(needsOnboarding ? '/onboarding' : '/(tabs)/home');
        } else {
          setPinError((result as any).message || t('auth.incorrectPin'));
          setPin(['', '', '', '']);
          pinRefs.current[0]?.focus();
        }
      } catch (e: any) {
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        setPinError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.networkError')));
        setPin(['', '', '', '']);
        pinRefs.current[0]?.focus();
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

  // ── Forgot PIN: Step 1 — Send OTP ────────────────────────────────────────
  const handleForgotPin = async () => {
    setResetError(null);
    setIsLoading(true);

    try {
      const result = await sendOtpMutation.mutateAsync({ phone });
      if (result.success) {
        setResetStep('otp');
        setOtpCode(['', '', '', '', '', '']);
        setOtpCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      } else {
        setResetError((result as any).message || 'Failed to send OTP');
      }
    } catch (e: any) {
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      setResetError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.networkError')));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot PIN: Resend OTP ───────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setResetError(null);
    setIsLoading(true);

    try {
      const result = await sendOtpMutation.mutateAsync({ phone });
      if (result.success) {
        setOtpCode(['', '', '', '', '', '']);
        setOtpCountdown(60);
        otpRefs.current[0]?.focus();
      }
    } catch (e: any) {
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      setResetError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.networkError')));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot PIN: Step 2 — OTP Input ───────────────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // When all 6 digits entered, move to new PIN step
    if (newOtp.every(digit => digit !== '')) {
      setResetStep('newPin');
      setNewPin(['', '', '', '']);
      setResetError(null);
      setTimeout(() => newPinRefs.current[0]?.focus(), 300);
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Forgot PIN: Step 3 — New PIN Input + Submit ──────────────────────────
  const handleNewPinChange = async (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...newPin];
    updated[index] = value;
    setNewPin(updated);
    setResetError(null);

    if (value && index < 3) {
      newPinRefs.current[index + 1]?.focus();
    }

    // When all 4 digits entered, submit reset
    if (updated.every(digit => digit !== '')) {
      setIsLoading(true);
      try {
        const result = await resetPinMutation.mutateAsync({
          phone,
          otp: otpCode.join(''),
          newPin: updated.join(''),
        });
        if (result.success && result.token && result.user) {
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
          // Register push token (non-blocking)
          try {
            await requestNotificationPermissions();
            await registerPushToken(result.user.phone, registerPushTokenMutation.mutateAsync);
          } catch (_) {}

          showInfo(t('common.success'), t('auth.pinResetSuccess'));
          const needsOnboarding = !result.user?.firstName;
          router.replace(needsOnboarding ? '/onboarding' : '/(tabs)/home');
        } else {
          setResetError((result as any).message || t('auth.pinResetFailed'));
          setNewPin(['', '', '', '']);
          newPinRefs.current[0]?.focus();
        }
      } catch (e: any) {
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        setResetError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.pinResetFailed')));
        // If OTP was invalid, go back to OTP step
        if (/otp|code|expired/i.test(e?.message || '')) {
          setResetStep('otp');
          setOtpCode(['', '', '', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 300);
        } else {
          setNewPin(['', '', '', '']);
          newPinRefs.current[0]?.focus();
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewPinKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !newPin[index] && index > 0) {
      newPinRefs.current[index - 1]?.focus();
    }
  };

  // ── Cancel Reset Flow ────────────────────────────────────────────────────
  const handleCancelReset = () => {
    setResetStep('none');
    setOtpCode(['', '', '', '', '', '']);
    setNewPin(['', '', '', '']);
    setResetError(null);
    setPin(['', '', '', '']);
    setTimeout(() => pinRefs.current[0]?.focus(), 300);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    showConfirm(
      'Log Out',
      'You will need to verify your phone number again.',
      async () => {
        await clearAllAuthData();
        await signOut();
        router.replace('/auth');
      }
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

  // Mask phone for display: +994-XX-***-**-67
  const maskedPhone = phone.length >= 9
    ? `+994-${phone.slice(-9, -7)}-***-**-${phone.slice(-2)}`
    : phone;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <View style={styles.container}>
      {/* Hero background image */}
      <ImageBackground
        source={HERO_IMAGES[heroIdx]}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Logo */}
          <View style={[styles.logoRow, { marginTop: insets.top + 16 }]}>
            <View style={styles.logoIcon}>
              <Wrench size={18} color="#FFF" />
            </View>
            <Text style={styles.logoText}>Qaraj</Text>
          </View>

          {/* Glass card */}
          <View style={styles.card}>
            {/* ── Normal PIN Login ──────────────────────────────────────────── */}
            {resetStep === 'none' && (
              <>
                <Text style={styles.title}>{t('auth.welcomeBack') || 'Welcome back'}</Text>
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

                {isLoading && <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />}

                {/* Biometric Button */}
                {showBiometric && !isLoading && (
                  <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                    <Fingerprint size={28} color={c.primary} strokeWidth={1.5} />
                    <Text style={styles.biometricText}>{t('auth.useBiometric') || 'Use Biometric'}</Text>
                  </TouchableOpacity>
                )}

                {/* Forgot PIN */}
                {!isLoading && (
                  <TouchableOpacity style={styles.forgotPinButton} onPress={handleForgotPin}>
                    <Text style={styles.forgotPinText}>{t('auth.forgotPin')}</Text>
                  </TouchableOpacity>
                )}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <LogOut size={16} color={c.textTertiary} />
                  <Text style={styles.logoutText}>{t('auth.useDifferentNumber') || 'Use a different number'}</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Reset Step 1: Enter OTP ──────────────────────────────────── */}
            {resetStep === 'otp' && (
              <>
                <TouchableOpacity style={styles.backButton} onPress={handleCancelReset}>
                  <ArrowLeft size={20} color={c.textSecondary} />
                  <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{t('auth.resetPinTitle')}</Text>
                <Text style={styles.subtitle}>{t('auth.enterCodeSent')} {maskedPhone}</Text>

                {/* OTP Input — 6 boxes */}
                <View style={styles.otpContainer}>
                  {otpCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { otpRefs.current[index] = ref; }}
                      style={[styles.otpInput, digit && styles.otpInputFilled]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {resetError && <Text style={styles.errorText}>{resetError}</Text>}

                {isLoading && <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />}

                {/* Resend OTP */}
                {!isLoading && (
                  <TouchableOpacity
                    style={[styles.resendButton, otpCountdown > 0 && styles.resendButtonDisabled]}
                    onPress={handleResendOtp}
                    disabled={otpCountdown > 0}
                  >
                    <Text style={[styles.resendText, otpCountdown > 0 && styles.resendTextDisabled]}>
                      {otpCountdown > 0
                        ? `${t('auth.resendCode')} (${otpCountdown}s)`
                        : t('auth.resendCode')}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* ── Reset Step 2: Enter New PIN ──────────────────────────────── */}
            {resetStep === 'newPin' && (
              <>
                <TouchableOpacity style={styles.backButton} onPress={() => {
                  setResetStep('otp');
                  setNewPin(['', '', '', '']);
                  setResetError(null);
                  setTimeout(() => otpRefs.current[0]?.focus(), 300);
                }}>
                  <ArrowLeft size={20} color={c.textSecondary} />
                  <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{t('auth.resetPinTitle')}</Text>
                <Text style={styles.subtitle}>{t('auth.enterNewPin')}</Text>

                {/* New PIN Input — 4 boxes */}
                <View style={styles.pinContainer}>
                  {newPin.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { newPinRefs.current[index] = ref; }}
                      style={[styles.pinInput, digit && styles.pinInputFilled]}
                      value={digit}
                      onChangeText={(value) => handleNewPinChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleNewPinKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      secureTextEntry
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {resetError && <Text style={styles.errorText}>{resetError}</Text>}

                {isLoading && <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />}

                <Text style={styles.hintText}>{t('auth.pinHint')}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppVersion />
    </View>
  );
}

const createStyles = (c: any, theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  heroImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '45%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0, left: 24,
    zIndex: 10,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: c.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 22, fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: theme === 'dark' ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: '60%',
    alignItems: 'center',
    // Glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26, fontWeight: '700',
    color: c.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: c.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
  },
  pinInput: {
    width: 56, height: 64,
    backgroundColor: c.surface,
    borderRadius: 16, borderWidth: 2, borderColor: c.border,
    fontSize: 28, fontWeight: '700', color: c.text, textAlign: 'center',
  },
  pinInputFilled: {
    borderColor: c.primary,
    backgroundColor: `${c.primary}15`,
  },
  otpContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
  },
  otpInput: {
    width: 44, height: 56,
    backgroundColor: c.surface,
    borderRadius: 12, borderWidth: 2, borderColor: c.border,
    fontSize: 22, fontWeight: '700', color: c.text, textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: c.primary,
    backgroundColor: `${c.primary}15`,
  },
  errorText: {
    fontSize: 14, color: c.error,
    textAlign: 'center', paddingVertical: 8, fontWeight: '500',
  },
  hintText: {
    fontSize: 13, color: c.textTertiary,
    textAlign: 'center', marginTop: 24,
  },
  biometricButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 32, paddingVertical: 14, paddingHorizontal: 24,
    backgroundColor: `${c.primary}10`,
    borderRadius: 16, borderWidth: 1, borderColor: `${c.primary}30`,
  },
  biometricText: {
    fontSize: 16, color: c.primary, fontWeight: '600',
  },
  forgotPinButton: {
    marginTop: 24, paddingVertical: 12,
  },
  forgotPinText: {
    fontSize: 15, color: c.primary, fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14, color: c.textTertiary,
  },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 24, paddingVertical: 8,
  },
  backText: {
    fontSize: 15, color: c.textSecondary, fontWeight: '500',
  },
  resendButton: {
    marginTop: 24, paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 15, color: c.primary, fontWeight: '500',
  },
  resendTextDisabled: {
    color: c.textTertiary,
  },
});
