/**
 * Onboarding Screen — Collects user profile data after first login
 *
 * Flow:
 * Step 0: Welcome — explains what Qaraj does and why we need info
 * Step 1: Name — first name + last name (no phone shown)
 * Step 2: Car basics — brand/model/year (short info about the car)
 * Step 3: Mileage & service preferences
 *
 * Path A: Known customer (found in DB) — shows pre-filled data
 * Path B: Unknown customer — full flow
 *
 * v2: Theme-aware "Showroom Floor" design. Uses ColorsV2 when v2 flag is on,
 *     falls back to white/light design for v1.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Car,
  Calendar,
  Wrench,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useDesignV2, ColorsV2 } from '@/hooks/useDesignV2';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const MILEAGE_OPTIONS = [
  { id: 1, value: 500, label: '< 500 km/ay', sublabel: 'Nadir istifadə', icon: '🏠' },
  { id: 2, value: 1000, label: '500–1500 km/ay', sublabel: 'Şəhərdaxili', icon: '🏙️' },
  { id: 3, value: 2250, label: '1500–3000 km/ay', sublabel: 'Aktiv', icon: '🛣️' },
  { id: 4, value: 4000, label: '3000+ km/ay', sublabel: 'Uzun məsafə', icon: '✈️' },
];

const LAST_SERVICE_OPTIONS = [
  { id: 1, value: 'this_month', label: 'Bu ay' },
  { id: 2, value: '1_3_months', label: '1–3 ay əvvəl' },
  { id: 3, value: '3_6_months', label: '3–6 ay əvvəl' },
  { id: 4, value: 'unknown', label: 'Xatırlamıram' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, updateUser, completeOnboarding, addVehicle } = useApp();
  const { isV2, theme } = useDesignV2();

  // Theme colors
  const colors = isV2
    ? (theme === 'dark' ? ColorsV2.dark : ColorsV2.light)
    : (theme === 'dark' ? Colors.dark : Colors.light);

  // Determine if user is known (has data from DB)
  const usernameIsReal = user?.username && !/^[\+\d\s\-()]{7,}$/.test(user.username.trim());
  const isKnownUser = !!(user?.firstName || usernameIsReal);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [selectedMileage, setSelectedMileage] = useState<number | null>(user?.monthlyMileage || null);
  const [selectedLastService, setSelectedLastService] = useState<string | null>(user?.lastServiceDate || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pre-fill from username if firstName/lastName not set
  useEffect(() => {
    if (!firstName && !lastName && user?.username) {
      const looksLikePhone = /^[\+\d\s\-()]{7,}$/.test(user.username.trim());
      if (!looksLikePhone) {
        const parts = user.username.trim().split(' ');
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else if (parts.length === 1) {
          setFirstName(parts[0]);
        }
      }
    }
  }, []);

  const totalSteps = 4;

  const animateTransition = (direction: 'forward' | 'back') => {
    const toValue = direction === 'forward' ? -width : width;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: toValue * 0.3, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(direction === 'forward' ? width * 0.3 : -width * 0.3);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      animateTransition('forward');
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      animateTransition('back');
      setTimeout(() => setCurrentStep(prev => prev - 1), 150);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const phone = user?.phone || '';

      // Call backend to save onboarding data
      await fetch(`http://91.107.161.67:3000/api/trpc/users.updateOnboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'qrj_sk_live_2024_gm_xK9mP2vL8nQ4wR7j',
        },
        body: JSON.stringify({
          phone: phone,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          monthlyMileage: selectedMileage || undefined,
          lastServiceDate: selectedLastService || undefined,
        }),
      });

      // Create vehicle if car info was provided
      if (carBrand.trim()) {
        try {
          await fetch(`http://91.107.161.67:3000/api/trpc/vehicles.create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': 'qrj_sk_live_2024_gm_xK9mP2vL8nQ4wR7j',
            },
            body: JSON.stringify({
              phone: phone,
              brand: carBrand.trim(),
              model: carModel.trim() || 'Unknown',
              year: parseInt(carYear) || new Date().getFullYear(),
              mileage: selectedMileage ? selectedMileage * 12 : undefined,
            }),
          });
        } catch (vehicleError) {
          console.error('[Onboarding] Vehicle backend save failed:', vehicleError);
        }
        // Also save to local state
        try {
          await addVehicle({
            brand: carBrand.trim(),
            model: carModel.trim() || 'Unknown',
            year: parseInt(carYear) || new Date().getFullYear(),
            vin: '',
            licensePlate: '',
            mileage: selectedMileage ? selectedMileage * 12 : undefined,
            photos: [],
          });
        } catch (localError) {
          console.error('[Onboarding] Local vehicle save failed:', localError);
        }
      }

      // Update local state
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: `${firstName.trim()} ${lastName.trim()}`,
        monthlyMileage: selectedMileage || undefined,
        lastServiceDate: selectedLastService || undefined,
        onboardingCompleted: true,
      });

      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[Onboarding] Error saving:', error);
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return firstName.trim().length >= 2 && lastName.trim().length >= 2;
      case 2: return true; // Car info is optional
      case 3: return selectedMileage !== null && selectedLastService !== null; // Both required
      default: return false;
    }
  };

  // ─── Step 0: Welcome ───────────────────────────────────────────────────────
  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeHeader}>
        <View style={[styles.welcomeIconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Car size={48} color={colors.primary} />
        </View>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          {t('onboarding.welcomeTitle') || 'Qaraj-a xoş gəlmisiniz!'}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          {t('onboarding.welcomeSubtitle') || 'Avtomobilinizin baxım tarixçəsini izləyin, servis vaxtlarını planlaşdırın və ehtiyat hissələrini asanlıqla tapın.'}
        </Text>
      </View>

      <View style={styles.welcomeFeatures}>
        {[
          { icon: Calendar, title: t('onboarding.feature1Title') || 'Servis planlaşdırma', desc: t('onboarding.feature1Desc') || 'Vaxtında xatırlatmalar alın' },
          { icon: Wrench, title: t('onboarding.feature2Title') || 'Ehtiyat hissələri', desc: t('onboarding.feature2Desc') || 'AI ilə hissə axtarışı' },
          { icon: BarChart3, title: t('onboarding.feature3Title') || 'Xərc izləmə', desc: t('onboarding.feature3Desc') || 'Baxım xərclərini nəzarətdə saxlayın' },
        ].map((feature, i) => (
          <View key={i} style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}12` }]}>
              <feature.icon size={20} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </View>
        ))}
      </View>

      <View style={[styles.welcomeNote, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
        <Text style={[styles.welcomeNoteText, { color: colors.textSecondary }]}>
          {t('onboarding.noteText') || 'Sizə daha yaxşı xidmət göstərmək üçün bir neçə sual soruşacağıq. Bu, 1 dəqiqədən az vaxt alacaq.'}
        </Text>
      </View>
    </View>
  );

  // ─── Step 1: Name ──────────────────────────────────────────────────────────
  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t('onboarding.nameTitle') || 'Tanışlıq'}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {isKnownUser
            ? (t('onboarding.nameSubtitleKnown') || 'Məlumatlarınızı yoxlayın')
            : (t('onboarding.nameSubtitleNew') || 'Adınızı daxil edin')}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('onboarding.firstName') || 'Ad'}
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          }]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={t('onboarding.firstNamePlaceholder') || 'Adınız'}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          autoFocus={!isKnownUser}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('onboarding.lastName') || 'Soyad'}
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          }]}
          value={lastName}
          onChangeText={setLastName}
          placeholder={t('onboarding.lastNamePlaceholder') || 'Soyadınız'}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  // ─── Step 2: Car Info ──────────────────────────────────────────────────────
  const renderCarStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t('onboarding.carTitle') || 'Avtomobiliniz'}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {t('onboarding.carSubtitle') || 'Əsas avtomobiliniz haqqında qısa məlumat (sonra dəyişə bilərsiniz)'}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('onboarding.brand') || 'Marka'}
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          }]}
          value={carBrand}
          onChangeText={setCarBrand}
          placeholder={t('onboarding.brandPlaceholder') || 'məs. Toyota, BMW, Mercedes'}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('onboarding.model') || 'Model'}
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          }]}
          value={carModel}
          onChangeText={setCarModel}
          placeholder={t('onboarding.modelPlaceholder') || 'məs. Camry, X5, E-Class'}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('onboarding.year') || 'İl'}
        </Text>
        <TextInput
          style={[styles.textInput, {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          }]}
          value={carYear}
          onChangeText={setCarYear}
          placeholder={t('onboarding.yearPlaceholder') || 'məs. 2020'}
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      <Text style={[styles.optionalHint, { color: colors.textTertiary }]}>
        {t('onboarding.carOptional') || '* Bu addımı keçə bilərsiniz, sonra əlavə edə bilərsiniz'}
      </Text>
    </View>
  );

  // ─── Step 3: Mileage & Service ─────────────────────────────────────────────
  const renderMileageServiceStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {t('onboarding.mileageTitle') || 'Sürüş və servis'}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {t('onboarding.mileageSubtitle') || 'Təxmini aylıq neçə km sürürsünüz?'}
        </Text>
      </View>

      <View style={styles.optionsGrid}>
        {MILEAGE_OPTIONS.map((option) => {
          const isSelected = selectedMileage === option.value;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? `${colors.primary}12` : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedMileage(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionSublabel, { color: isSelected ? colors.primary : colors.textTertiary }]}>
                  {option.sublabel}
                </Text>
              </View>
              {isSelected && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        {t('onboarding.lastServiceQuestion') || 'Son servisiniz nə vaxt olub?'}
      </Text>
      <View style={styles.lastServiceRow}>
        {LAST_SERVICE_OPTIONS.map((option) => {
          const isSelected = selectedLastService === option.value;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.lastServiceChip,
                {
                  backgroundColor: isSelected ? `${colors.primary}12` : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedLastService(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.lastServiceChipText, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderNameStep();
      case 2: return renderCarStep();
      case 3: return renderMileageServiceStep();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= currentStep ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      {/* Skip button (visible from step 2+) */}
      {currentStep >= 2 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSubmit}>
          <Text style={[styles.skipButtonText, { color: colors.textTertiary }]}>
            {t('onboarding.skip') || 'Keç'}
          </Text>
          <ArrowRight size={14} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {currentStep > 0 ? (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={goBack}
          >
            <ArrowLeft size={18} color={colors.textSecondary} />
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
              {t('common.back') || 'Geri'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: canProceed() ? colors.primary : colors.border },
          ]}
          onPress={goNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: '#FFF' }]}>
            {currentStep === 0
              ? (t('onboarding.start') || 'Başlayaq')
              : currentStep === totalSteps - 1
                ? (isSubmitting ? (t('common.loading') || 'Yüklənir...') : (t('onboarding.finish') || 'Tamamla'))
                : (t('common.next') || 'Davam et')}
          </Text>
          {currentStep > 0 && currentStep < totalSteps - 1 && (
            <ArrowRight size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },

  // Welcome step
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  welcomeIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  welcomeFeatures: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
  },
  welcomeNote: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
  },
  welcomeNoteText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Step header
  stepHeader: {
    marginBottom: 28,
    marginTop: 8,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Inputs
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  optionalHint: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Mileage options
  optionsGrid: {
    gap: 10,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  optionIcon: {
    fontSize: 26,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionSublabel: {
    fontSize: 13,
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  lastServiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  lastServiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  lastServiceChipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 90,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
