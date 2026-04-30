/**
 * Qaraj GM — Auth Screen
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
  Dimensions, Animated, ActivityIndicator, Keyboard,
} from 'react-native';
import { useAlert } from '@/components/CustomAlert';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, ArrowLeft, Check, Car, Wrench, Fingerprint } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
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
// Constants import removed — no longer needed for push token registration

import type { User as UserType } from '@/constants/types';

type AuthStep = 'phone' | 'otp' | 'pin' | 'biometric-prompt';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, hydrateFromServer, state } = useApp();
  const { t } = useTranslation();
  const { showError } = useAlert();

  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const pinRefs = useRef<(TextInput | null)[]>([]);
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Resend Cooldown Timer ─────────────────────────────────────────────────
  const startCooldown = (seconds: number = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();
  const setPinMutation = trpc.auth.setPin.useMutation();
  const verifyPinMutation = trpc.auth.verifyPin.useMutation();
  const registerPushTokenMutation = trpc.pushTokens.register.useMutation();

  // ── Phone Submit ──────────────────────────────────────────────────────────
  const handlePhoneSubmit = async () => {
    const unformatted = unformatPhoneNumber(phone);
    if (unformatted.length < 12) {
      showError(t('common.error'), t('auth.invalidPhone'));
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendOtpMutation.mutateAsync({ phone: unformatted });
      if (result.devCode) {
        setDevOtp(result.devCode);
      }
      setOtpError(null);
      setOtpSentMessage(t('auth.codeSent'));
      setStep('otp');
      startCooldown(60);
    } catch (e: any) {
      // Show translated error to user instead of silently falling back to dev mode
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      const msg = isNetworkError
        ? t('auth.networkError')
        : (e?.message || t('auth.networkError'));
      showError(t('common.error'), msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    const unformatted = unformatPhoneNumber(phone);
    setIsLoading(true);
    try {
      const result = await sendOtpMutation.mutateAsync({ phone: unformatted });
      if (result.devCode) {
        setDevOtp(result.devCode);
      }
      setOtpError(null);
      setOtpSentMessage(t('auth.codeResent'));
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startCooldown(60);
    } catch (e: any) {
      const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
      const msg = isNetworkError
        ? t('auth.networkError')
        : (e?.message || t('auth.networkError'));
      setOtpError(msg);
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

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      const code = newOtp.join('');
      setIsLoading(true);
      try {
        const result = await verifyOtpMutation.mutateAsync({
          phone: unformatPhoneNumber(phone),
          code,
        });
        if (result.success) {
          setOtpError(null);
          // Server tells us if user has a PIN already
          setIsNewUser(!result.hasPin);
          setTimeout(() => setStep('pin'), 300);
        } else {
          setOtpError(result.message || t('auth.invalidOtp'));
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
        }
      } catch (e: any) {
        // Show translated error to user — don't silently accept dev codes
        const isNetworkError = /network|fetch|timeout|ECONNREFUSED/i.test(e?.message || '');
        const msg = isNetworkError
          ? t('auth.networkError')
          : (e?.message || t('auth.networkError'));
        setOtpError(msg);
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
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
      const unformatted = unformatPhoneNumber(phone);
      setIsLoading(true);

      try {
        if (isNewUser) {
          // New user — set PIN
          const result = await setPinMutation.mutateAsync({ phone: unformatted, pin: pinCode });
          if (result.success && result.token && result.user) {
            setPinError(null);
            await handleAuthSuccess(result.token, result.user, true);
          } else {
            setPinError(t('auth.failedSetPin'));
            setPin(['', '', '', '']);
            pinRefs.current[0]?.focus();
          }
        } else {
          // Returning user — verify PIN
          const result = await verifyPinMutation.mutateAsync({ phone: unformatted, pin: pinCode });
          if (result.success && result.token && result.user) {
            setPinError(null);
            await handleAuthSuccess(result.token, result.user, false);
          } else {
            setPinError((result as any).message || t('auth.incorrectPin'));
            setPin(['', '', '', '']);
            pinRefs.current[0]?.focus();
          }
        }
      } catch (e: any) {
        // Show translated error to user — don't silently create fallback user
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
    }
  };

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  // ── Auth Success Handler ──────────────────────────────────────────────────
  const handleAuthSuccess = async (
    token: string,
    serverUser: { id: string; phone: string; username: string; email?: string; avatar?: string; language: string; theme: string; createdAt: string },
    isFirstTime: boolean,
  ) => {
    // Save JWT token and user data to SecureStore
    await saveToken(token);
    await savePhone(serverUser.phone);
    await saveUserData(serverUser);
    await setPinStatus(true);
    await updateLastActivity();

    // Map server user to app User type
    const appUser: UserType = {
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
    await signIn(appUser);

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

    // Check if onboarding is needed
    const hydratedUser = state.user;
    if (isFirstTime || (!hydratedUser?.onboardingCompleted && !hydratedUser?.firstName)) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  // ── Biometric Prompt Handlers ─────────────────────────────────────────────
  const handleEnableBiometric = async () => {
    await setBiometricEnabled(true);
    const hydratedUser = state.user;
    if (!hydratedUser?.onboardingCompleted && !hydratedUser?.firstName) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleSkipBiometric = async () => {
    await setBiometricEnabled(false);
    const hydratedUser = state.user;
    if (!hydratedUser?.onboardingCompleted && !hydratedUser?.firstName) {
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
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    );
    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    );
    floatAnimation1.start();
    floatAnimation2.start();
    return () => { floatAnimation1.stop(); floatAnimation2.stop(); };
  }, [float1, float2]);

  const float1Y = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const float2Y = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.backgroundContainer}>
        <View style={styles.heroBackground}>
          <View style={[styles.diagonalStripe, styles.diagonalStripe1]} />
          <View style={[styles.diagonalStripe, styles.diagonalStripe2]} />
          <View style={[styles.diagonalStripe, styles.diagonalStripe3]} />
          <View style={[styles.carSilhouette, styles.carSilhouette1]}>
            <Car size={140} color={`${Colors.dark.primary}12`} strokeWidth={1} />
          </View>
          <View style={[styles.carSilhouette, styles.carSilhouette2]}>
            <Car size={100} color={`${Colors.dark.primary}08`} strokeWidth={0.8} />
          </View>
          <View style={[styles.carSilhouette, styles.carSilhouette3]}>
            <Wrench size={80} color={`${Colors.dark.primary}10`} strokeWidth={1} />
          </View>
          <Animated.View style={[styles.floatingAccent1, { transform: [{ translateY: float1Y }] }]} />
          <Animated.View style={[styles.floatingAccent2, { transform: [{ translateY: float2Y }] }]} />
        </View>

        <ScrollView 
          contentContainerStyle={[styles.scrollContent, (step === 'pin' || step === 'otp') && { justifyContent: 'flex-start' }]} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={[styles.content, { paddingTop: (step === 'pin' || step === 'otp') ? insets.top + 20 : insets.top + 60 }]}>
            {(step === 'otp' || step === 'pin') && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ArrowLeft size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            )}

            <View style={styles.header}>
              <View style={styles.progressContainer}>
                <View style={[styles.progressDot, step === 'phone' && styles.progressDotActive]} />
                <View style={[styles.progressLine, (step === 'otp' || step === 'pin' || step === 'biometric-prompt') && styles.progressLineActive]} />
                <View style={[styles.progressDot, step === 'otp' && styles.progressDotActive]} />
                <View style={[styles.progressLine, (step === 'pin' || step === 'biometric-prompt') && styles.progressLineActive]} />
                <View style={[styles.progressDot, (step === 'pin' || step === 'biometric-prompt') && styles.progressDotActive]} />
              </View>

              <Text style={styles.title}>
                {step === 'phone' && t('auth.enterPhone')}
                {step === 'otp' && t('auth.verifyOtp')}
                {step === 'pin' && (isNewUser ? t('auth.createPin') : t('auth.enterPin'))}
                {step === 'biometric-prompt' && `Enable ${biometricType}?`}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'phone' && t('auth.sendVerificationCode')}
                {step === 'otp' && `${t('auth.enterOtpCode')} ${phone}`}
                {step === 'pin' && (isNewUser ? t('auth.createPinDesc') : t('auth.enterPinDesc'))}
                {step === 'biometric-prompt' && `Unlock Qaraj quickly with ${biometricType} next time`}
              </Text>
            </View>

            <View style={styles.form}>
              {/* ── Phone Step ── */}
              {step === 'phone' && (
                <>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Phone size={20} color={Colors.dark.textSecondary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={PHONE_PLACEHOLDER}
                      placeholderTextColor={Colors.dark.textTertiary}
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
                      colors={[Colors.dark.primary, Colors.dark.primaryDark]}
                      style={styles.submitGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={Colors.dark.text} />
                      ) : (
                        <Text style={styles.submitText}>{t('auth.sendCode')}</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* ── OTP Step ── */}
              {step === 'otp' && (
                <>
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
                    <ActivityIndicator color={Colors.dark.primary} style={{ marginTop: 16 }} />
                  )}
                </>
              )}

              {/* ── PIN Step ── */}
              {step === 'pin' && (
                <>
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
                      <Check size={16} color={Colors.dark.success} />
                      <Text style={styles.pinHintText}>{t('auth.pinHint')}</Text>
                    </View>
                  )}

                  {isLoading && (
                    <ActivityIndicator color={Colors.dark.primary} style={{ marginTop: 16 }} />
                  )}
                </>
              )}

              {/* ── Biometric Prompt Step ── */}
              {step === 'biometric-prompt' && (
                <View style={styles.biometricContainer}>
                  <View style={styles.biometricIcon}>
                    <Fingerprint size={64} color={Colors.dark.primary} strokeWidth={1.5} />
                  </View>

                  <TouchableOpacity style={styles.submitButton} onPress={handleEnableBiometric}>
                    <LinearGradient
                      colors={[Colors.dark.primary, Colors.dark.primaryDark]}
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
          </View>
        </ScrollView>
      </View>
      <AppVersion />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundContainer: {
    flex: 1,
    position: 'relative',
  },
  heroBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.dark.background,
    overflow: 'hidden',
  },
  diagonalStripe: {
    position: 'absolute',
    width: width * 1.5,
    height: 200,
    backgroundColor: `${Colors.dark.primary}08`,
    transform: [{ rotate: '-15deg' }],
  },
  diagonalStripe1: { top: -50, left: -100, opacity: 0.4 },
  diagonalStripe2: { top: 120, right: -150, backgroundColor: `${Colors.dark.primary}05`, opacity: 0.3 },
  diagonalStripe3: { bottom: 80, left: -80, height: 150, backgroundColor: `${Colors.dark.primary}12`, opacity: 0.5 },
  carSilhouette: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    borderColor: `${Colors.dark.primary}08`,
  },
  carSilhouette1: { top: -20, right: -40, width: 180, height: 180, transform: [{ rotate: '12deg' }] },
  carSilhouette2: { bottom: 30, left: -30, width: 130, height: 130, transform: [{ rotate: '-8deg' }], borderColor: `${Colors.dark.primary}06` },
  carSilhouette3: { top: 160, right: 30, width: 110, height: 110, transform: [{ rotate: '20deg' }], borderColor: `${Colors.dark.primary}10` },
  floatingAccent1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, top: 80, left: 40, backgroundColor: `${Colors.dark.primary}10`, opacity: 0.6 },
  floatingAccent2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, bottom: 100, right: 60, backgroundColor: `${Colors.dark.primary}08`, opacity: 0.5 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 100, paddingBottom: 40 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  header: { marginBottom: 48, alignItems: 'center' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingHorizontal: 40 },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.dark.border },
  progressDotActive: { backgroundColor: Colors.dark.primary, width: 14, height: 14, borderRadius: 7 },
  progressLine: { flex: 1, height: 2, backgroundColor: Colors.dark.border, marginHorizontal: 8 },
  progressLineActive: { backgroundColor: Colors.dark.primary },
  title: { fontSize: 32, fontWeight: '700', color: Colors.dark.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.dark.textSecondary, lineHeight: 24, textAlign: 'center' },
  form: { gap: 24 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: Colors.dark.text },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 },
  otpInput: {
    width: 48, height: 56,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12, borderWidth: 2, borderColor: Colors.dark.border,
    fontSize: 24, fontWeight: '700', color: Colors.dark.text, textAlign: 'center',
  },
  otpInputFilled: { borderColor: Colors.dark.primary, backgroundColor: `${Colors.dark.primary}15` },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  pinInput: {
    width: 56, height: 64,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16, borderWidth: 2, borderColor: Colors.dark.border,
    fontSize: 28, fontWeight: '700', color: Colors.dark.text, textAlign: 'center',
  },
  pinInputFilled: { borderColor: Colors.dark.primary, backgroundColor: `${Colors.dark.primary}15` },
  resendButton: { alignItems: 'center', paddingVertical: 12 },
  resendButtonDisabled: { opacity: 0.5 },
  resendText: { fontSize: 14, color: Colors.dark.primary, fontWeight: '600' },
  resendTextDisabled: { color: Colors.dark.textTertiary },
  pinHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: `${Colors.dark.success}15`, borderRadius: 12,
  },
  pinHintText: { fontSize: 14, color: Colors.dark.success, fontWeight: '500' },
  successText: {
    fontSize: 14, color: Colors.dark.success, textAlign: 'center',
    paddingVertical: 8, fontWeight: '500',
  },
  errorText: {
    fontSize: 14, color: Colors.dark.error, textAlign: 'center',
    paddingVertical: 8, fontWeight: '500',
  },
  mockHint: {
    alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: `${Colors.dark.warning}15`, borderRadius: 8,
  },
  mockHintText: { fontSize: 12, color: Colors.dark.warning, fontWeight: '500' },
  submitButton: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 18, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: Colors.dark.text },
  biometricContainer: { alignItems: 'center', gap: 24, paddingTop: 16 },
  biometricIcon: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${Colors.dark.primary}15`,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: { paddingVertical: 12 },
  skipText: { fontSize: 14, color: Colors.dark.textSecondary, fontWeight: '500' },
});
