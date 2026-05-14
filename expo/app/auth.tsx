/**
 * Qaraj GM — Auth Screen (v2 Showroom Floor)
 *
 * Flow:
 *   Phone → OTP → PIN (set or verify) → Biometric prompt (first time) → Home
 *
 * Phone number is the primary identifier.
 * JWT token is issued on successful PIN set/verify and stored in SecureStore.
 * Biometric is offered after first PIN setup.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, Animated, ActivityIndicator, Keyboard, ImageBackground,
} from 'react-native';
import { useAlert } from '@/components/CustomAlert';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, ArrowLeft, Check, Wrench, Fingerprint } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useDesignV2, ColorsV2 } from '@/hooks/useDesignV2';
import { useTranslation } from 'react-i18next';
import { formatPhoneNumber, unformatPhoneNumber, PHONE_PLACEHOLDER } from '@/constants/phoneUtils';
import { trpc } from '@/lib/trpc';
import { AppVersion } from '@/components/AppVersion';
import {
  saveToken, savePhone, saveUserData, updateLastActivity,
  setPinStatus, setBiometricEnabled,
} from '@/lib/authStore';
import { checkBiometricAvailability, getBiometricLabel } from '@/lib/biometric';
import { requestNotificationPermissions, registerPushToken } from '@/lib/notifications';

import type { User as UserType } from '@/constants/types';

type AuthStep = 'phone' | 'otp' | 'pin' | 'biometric-prompt';

const { width } = Dimensions.get('window');

// Hero images — same set as home/pin screens
const HERO_IMAGES = [
  require('@/assets/images/hero-toyota-land-cruiser.jpg'),
  require('@/assets/images/hero-toyota-camry.jpg'),
  require('@/assets/images/hero-toyota-rav4.jpg'),
  require('@/assets/images/hero-toyota-prado.jpg'),
  require('@/assets/images/hero-toyota-corolla-cross.jpg'),
];

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, hydrateFromServer, user: appUser } = useApp();
  const { t } = useTranslation();
  const { showError } = useAlert();
  const { isV2, theme } = useDesignV2();
  const c = isV2 ? ColorsV2[theme] : (Colors[theme] || Colors.dark);
  const styles = createStyles(c, theme);

  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [heroIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const pinRefs = useRef<(TextInput | null)[]>([]);
  const float1 = useRef(new Animated.Value(0)).current;

  // tRPC mutations
  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();
  const setPinMutation = trpc.auth.setPin.useMutation();
  const verifyPinMutation = trpc.auth.verifyPin.useMutation();
  const registerPushTokenMutation = trpc.pushTokens.register.useMutation();

  // ── Resend cooldown timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Phone Submit ──────────────────────────────────────────────────────────
  const handlePhoneSubmit = async () => {
    const raw = unformatPhoneNumber(phone);
    if (!raw || raw.length < 9) {
      showError(t('auth.invalidPhone'), t('auth.enterValidPhone'));
      return;
    }

    setIsLoading(true);
    setOtpError(null);
    setOtpSentMessage(null);

    try {
      const result = await sendOtpMutation.mutateAsync({ phone: raw });
      if (result.success) {
        await savePhone(raw);
        setIsNewUser(result.isNewUser || false);
        setDevOtp(result.devOtp || null);
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setResendCooldown(60);
        setOtpSentMessage(t('auth.codeSent'));
      } else {
        showError(t('common.error'), (result as any).message || t('auth.networkError'));
      }
    } catch (e: any) {
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      showError(t('common.error'), isNetworkError ? t('auth.networkError') : (e?.message || t('auth.networkError')));
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP Input ─────────────────────────────────────────────────────────────
  const handleOtpChange = async (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(null);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // When all 6 digits entered, verify
    if (newOtp.every(digit => digit !== '')) {
      Keyboard.dismiss();
      const otpCode = newOtp.join('');
      const raw = unformatPhoneNumber(phone);
      setIsLoading(true);

      try {
        const result = await verifyOtpMutation.mutateAsync({ phone: raw, code: otpCode });
        if (result.success) {
          // hasPin=false means user doesn't exist or has no PIN → new user flow (setPin)
          setIsNewUser(!(result as any).hasPin);
          setStep('pin');
          setPin(['', '', '', '']);
          setPinError(null);
        } else {
          setOtpError((result as any).message || t('auth.invalidOtp'));
          setOtp(['', '', '', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
      } catch (e: any) {
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        setOtpError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.invalidOtp')));
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    const raw = unformatPhoneNumber(phone);
    setIsLoading(true);
    setOtpError(null);

    try {
      const result = await sendOtpMutation.mutateAsync({ phone: raw });
      if (result.success) {
        setResendCooldown(60);
        setDevOtp(result.devOtp || null);
        setOtpSentMessage(t('auth.codeSent'));
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (e: any) {
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      setOtpError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.networkError')));
    } finally {
      setIsLoading(false);
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

    // When all 4 digits entered, set or verify PIN
    if (updated.every(digit => digit !== '')) {
      Keyboard.dismiss();
      const pinCode = updated.join('');
      const raw = unformatPhoneNumber(phone);
      setIsLoading(true);

      try {
        let result: any;
        if (isNewUser) {
          result = await setPinMutation.mutateAsync({ phone: raw, pin: pinCode });
        } else {
          result = await verifyPinMutation.mutateAsync({ phone: raw, pin: pinCode });
        }

        if (result.success && result.token && result.user) {
          await saveToken(result.token);
          await saveUserData(result.user);
          await setPinStatus(true);
          await updateLastActivity();
          await handlePostAuth(result.user, isNewUser);
        } else {
          setPinError((result as any).message || t('auth.incorrectPin'));
          setPin(['', '', '', '']);
          setTimeout(() => pinRefs.current[0]?.focus(), 100);
        }
      } catch (e: any) {
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        setPinError(isNetworkError ? t('auth.networkError') : (e?.message || t('auth.incorrectPin')));
        setPin(['', '', '', '']);
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
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

  // ── Post-Auth Flow ────────────────────────────────────────────────────────
  const handlePostAuth = async (serverUser: any, isFirstTime: boolean) => {
    // Map server user to app User type
    const mappedUser: UserType = {
      id: serverUser.id,
      username: serverUser.username,
      phone: serverUser.phone,
      email: serverUser.email,
      avatar: serverUser.avatar,
      language: (serverUser.language as 'en' | 'az' | 'ru') || 'en',
      theme: (serverUser.theme as 'light' | 'dark') || 'dark',
      createdAt: serverUser.createdAt,
    };

    // Sign in to AppProvider (updates AsyncStorage + state)
    await signIn(mappedUser);

    // Hydrate full profile from server (vehicles, appointments, service records)
    await hydrateFromServer(serverUser.phone);

    // Request notification permissions and register push token
    try {
      await requestNotificationPermissions();
      await registerPushToken(serverUser.phone, registerPushTokenMutation.mutateAsync);
    } catch (e) {
      console.log('[Auth] Push token registration failed (non-fatal):', (e as Error).message);
    }

    // For first-time users, check if biometric is available and offer it
    if (isFirstTime) {
      const bioStatus = await checkBiometricAvailability();
      if (bioStatus.isAvailable && bioStatus.isEnrolled) {
        setBiometricType(getBiometricLabel(bioStatus.biometricType));
        setStep('biometric-prompt');
        return;
      }
    }

    // Check if onboarding is needed — firstName is the single gate
    if (isFirstTime || !serverUser.firstName) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  // ── Biometric Prompt Handlers ─────────────────────────────────────────────
  const handleEnableBiometric = async () => {
    await setBiometricEnabled(true);
    if (!appUser?.firstName) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleSkipBiometric = async () => {
    await setBiometricEnabled(false);
    if (!appUser?.firstName) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setOtpError(null);
    } else if (step === 'pin') {
      setStep('otp');
      setPin(['', '', '', '']);
      setPinError(null);
    }
  };

  // ── Auto-focus ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else if (step === 'pin') {
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Floating animation ────────────────────────────────────────────────────
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

  // ── Progress indicator ────────────────────────────────────────────────────
  const stepIndex = step === 'phone' ? 0 : step === 'otp' ? 1 : 2;

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
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
            {/* Progress dots */}
            <View style={styles.progressContainer}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.progressRow}>
                  <View style={[styles.progressDot, stepIndex >= i && styles.progressDotActive]} />
                  {i < 2 && <View style={[styles.progressLine, stepIndex > i && styles.progressLineActive]} />}
                </View>
              ))}
            </View>

            {/* Back button */}
            {(step === 'otp' || step === 'pin') && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ArrowLeft size={20} color={c.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Title */}
            <Text style={styles.title}>
              {step === 'phone' ? t('auth.enterPhone')
                : step === 'otp' ? t('auth.verifyOtp')
                : step === 'pin' ? (isNewUser ? t('auth.createPin') : t('auth.enterPin'))
                : step === 'biometric-prompt' ? `Enable ${biometricType}?`
                : ''}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone' ? t('auth.sendVerificationCode')
                : step === 'otp' ? `${t('auth.enterOtpCode')} ${phone}`
                : step === 'pin' ? (isNewUser ? t('auth.createPinDesc') : t('auth.enterPinDesc'))
                : step === 'biometric-prompt' ? `Unlock Qaraj quickly with ${biometricType} next time`
                : ''}
            </Text>

            {/* ── Phone Step ── */}
            {step === 'phone' && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone size={20} color={c.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={PHONE_PLACEHOLDER}
                    placeholderTextColor={c.textTertiary}
                    value={phone}
                    onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                    keyboardType="phone-pad"
                    autoFocus
                    maxLength={19}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handlePhoneSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[c.primary, c.primaryDark]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.submitText}>{t('auth.sendCode')}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ── OTP Step ── */}
            {step === 'otp' && (
              <View style={styles.form}>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
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

                {otpSentMessage && !otpError && (
                  <Text style={styles.successText}>{otpSentMessage}</Text>
                )}

                {otpError && (
                  <Text style={styles.errorText}>{otpError}</Text>
                )}

                <TouchableOpacity
                  style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                >
                  <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
                    {resendCooldown > 0
                      ? `${t('auth.resendCode')} (${resendCooldown}s)`
                      : t('auth.resendCode')}
                  </Text>
                </TouchableOpacity>

                {devOtp && (
                  <View style={styles.mockHint}>
                    <Text style={styles.mockHintText}>Dev: Use OTP {devOtp}</Text>
                  </View>
                )}

                {isLoading && (
                  <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />
                )}
              </View>
            )}

            {/* ── PIN Step ── */}
            {step === 'pin' && (
              <View style={styles.form}>
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

                {pinError && (
                  <Text style={styles.errorText}>{pinError}</Text>
                )}

                {isNewUser && (
                  <View style={styles.pinHint}>
                    <Check size={16} color={c.success} />
                    <Text style={styles.pinHintText}>{t('auth.pinHint')}</Text>
                  </View>
                )}

                {isLoading && (
                  <ActivityIndicator color={c.primary} style={{ marginTop: 16 }} />
                )}
              </View>
            )}

            {/* ── Biometric Prompt Step ── */}
            {step === 'biometric-prompt' && (
              <View style={styles.biometricContainer}>
                <View style={styles.biometricIcon}>
                  <Fingerprint size={56} color={c.primary} strokeWidth={1.5} />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleEnableBiometric}>
                  <LinearGradient
                    colors={[c.primary, c.primaryDark]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitText}>Enable {biometricType}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkipBiometric}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </View>
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
    height: '40%',
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
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: '65%',
    // Glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 60,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: c.border,
  },
  progressDotActive: {
    backgroundColor: c.primary,
    width: 12, height: 12, borderRadius: 6,
  },
  progressLine: {
    flex: 1, height: 2,
    backgroundColor: c.border,
    marginHorizontal: 6,
  },
  progressLineActive: {
    backgroundColor: c.primary,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: c.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1, borderColor: c.border,
  },
  title: {
    fontSize: 26, fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, color: c.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 16, borderWidth: 1, borderColor: c.border,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: c.text },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpInput: {
    width: 46, height: 56,
    backgroundColor: c.surface,
    borderRadius: 12, borderWidth: 2, borderColor: c.border,
    fontSize: 22, fontWeight: '700', color: c.text, textAlign: 'center',
  },
  otpInputFilled: { borderColor: c.primary, backgroundColor: `${c.primary}15` },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  pinInput: {
    width: 56, height: 64,
    backgroundColor: c.surface,
    borderRadius: 16, borderWidth: 2, borderColor: c.border,
    fontSize: 28, fontWeight: '700', color: c.text, textAlign: 'center',
  },
  pinInputFilled: { borderColor: c.primary, backgroundColor: `${c.primary}15` },
  submitButton: { borderRadius: 16, overflow: 'hidden' },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 18, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  resendButton: { alignItems: 'center', paddingVertical: 12 },
  resendButtonDisabled: { opacity: 0.5 },
  resendText: { fontSize: 14, color: c.primary, fontWeight: '600' },
  resendTextDisabled: { color: c.textTertiary },
  successText: {
    fontSize: 14, color: c.success, textAlign: 'center',
    paddingVertical: 4, fontWeight: '500',
  },
  errorText: {
    fontSize: 14, color: c.error, textAlign: 'center',
    paddingVertical: 4, fontWeight: '500',
  },
  mockHint: {
    alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: `${c.warning}15`, borderRadius: 8,
  },
  mockHintText: { fontSize: 12, color: c.warning, fontWeight: '500' },
  pinHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: `${c.success}15`, borderRadius: 12,
  },
  pinHintText: { fontSize: 14, color: c.success, fontWeight: '500' },
  biometricContainer: { alignItems: 'center', gap: 24, paddingTop: 16 },
  biometricIcon: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: `${c.primary}15`,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: { paddingVertical: 12 },
  skipText: { fontSize: 14, color: c.textSecondary, fontWeight: '500' },
});
