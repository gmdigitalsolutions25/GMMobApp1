/**
 * Onboarding Screen — Collects user profile data after first login
 *
 * Path A: Known customer (found in DB) — shows pre-filled data, asks to confirm/complete
 * Path B: Unknown customer — full flow: name, mileage, last service, preferred center
 *
 * 3 steps max, under 60 seconds total.
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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/providers/AppProvider';
import { trpc } from '@/lib/trpc';

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

const SERVICE_CENTERS = [
  { id: '1', name: 'Toyota Abşeron Mərkəzi', address: 'Bakı-Sumqayıt şossesi 6-cı km' },
  { id: '2', name: 'Mitsubishi Motors', address: 'Bakı-Sumqayıt şossesi 6-cı km' },
  { id: '3', name: 'Mazda Azərbaycan', address: 'Bakı-Sumqayıt şossesi 6-cı km' },
  { id: '4', name: 'Toyota Gəncə Mərkəzi', address: 'Gəncə şəhəri' },
  { id: '5', name: 'BYD Abşeron Mərkəzi', address: 'Bakı-Sumqayıt şossesi' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, updateUser, completeOnboarding } = useApp();
  const user = state.user;

  // Determine if user is known (has data from DB)
  const isKnownUser = !!(user?.firstName || user?.username);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [selectedMileage, setSelectedMileage] = useState<number | null>(user?.monthlyMileage || null);
  const [selectedLastService, setSelectedLastService] = useState<string | null>(user?.lastServiceDate || null);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(user?.preferredServiceCenter || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pre-fill from username if firstName/lastName not set
  useEffect(() => {
    if (!firstName && !lastName && user?.username) {
      const parts = user.username.split(' ');
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else if (parts.length === 1) {
        setFirstName(parts[0]);
      }
    }
  }, []);

  const totalSteps = 3;

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
      const response = await fetch(`http://91.107.161.67:3000/api/trpc/users.updateOnboarding`, {
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
          preferredServiceCenter: selectedCenter || undefined,
        }),
      });

      // Update local state
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: `${firstName.trim()} ${lastName.trim()}`,
        monthlyMileage: selectedMileage || undefined,
        lastServiceDate: selectedLastService || undefined,
        preferredServiceCenter: selectedCenter || undefined,
        onboardingCompleted: true,
      });

      await completeOnboarding();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[Onboarding] Error saving:', error);
      // Still complete onboarding locally even if server fails
      await completeOnboarding();
      router.replace('/(tabs)/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return firstName.trim().length >= 2 && lastName.trim().length >= 2;
      case 1: return selectedMileage !== null;
      case 2: return true; // Last service & center are optional
      default: return false;
    }
  };

  // ─── Step 1: Name ───────────────────────────────────────────────────────────
  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>👋</Text>
        <Text style={styles.stepTitle}>Tanışlıq</Text>
        <Text style={styles.stepSubtitle}>
          {isKnownUser
            ? 'Məlumatlarınızı yoxlayın'
            : 'Adınızı daxil edin'}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Ad</Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Adınız"
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoFocus={!isKnownUser}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Soyad</Text>
        <TextInput
          style={styles.textInput}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Soyadınız"
          placeholderTextColor="#999"
          autoCapitalize="words"
        />
      </View>

      {isKnownUser && user?.phone && (
        <View style={styles.prefilledCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.prefilledText}>Telefon: +{user.phone}</Text>
        </View>
      )}
    </View>
  );

  // ─── Step 2: Monthly Mileage ────────────────────────────────────────────────
  const renderMileageStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>🚗</Text>
        <Text style={styles.stepTitle}>Aylıq yürüşünüz</Text>
        <Text style={styles.stepSubtitle}>Təxmini aylıq neçə km sürürsünüz?</Text>
      </View>

      <View style={styles.optionsGrid}>
        {MILEAGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedMileage === option.value && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedMileage(option.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              styles.optionLabel,
              selectedMileage === option.value && styles.optionLabelSelected,
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.optionSublabel,
              selectedMileage === option.value && styles.optionSublabelSelected,
            ]}>
              {option.sublabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── Step 3: Last Service + Preferred Center ────────────────────────────────
  const renderServiceStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEmoji}>🔧</Text>
        <Text style={styles.stepTitle}>Servis məlumatları</Text>
        <Text style={styles.stepSubtitle}>Son servisiniz nə vaxt olub?</Text>
      </View>

      <View style={styles.lastServiceRow}>
        {LAST_SERVICE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.lastServiceChip,
              selectedLastService === option.value && styles.lastServiceChipSelected,
            ]}
            onPress={() => setSelectedLastService(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.lastServiceChipText,
              selectedLastService === option.value && styles.lastServiceChipTextSelected,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Yaxın servis mərkəzi</Text>
      <ScrollView style={styles.centersList} showsVerticalScrollIndicator={false}>
        {SERVICE_CENTERS.map((center) => (
          <TouchableOpacity
            key={center.id}
            style={[
              styles.centerCard,
              selectedCenter === center.name && styles.centerCardSelected,
            ]}
            onPress={() => setSelectedCenter(center.name)}
            activeOpacity={0.7}
          >
            <View style={styles.centerInfo}>
              <Text style={[
                styles.centerName,
                selectedCenter === center.name && styles.centerNameSelected,
              ]}>
                {center.name}
              </Text>
              <Text style={styles.centerAddress}>{center.address}</Text>
            </View>
            {selectedCenter === center.name && (
              <Ionicons name="checkmark-circle" size={24} color="#F24141" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderNameStep();
      case 1: return renderMileageStep();
      case 2: return renderServiceStep();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {renderStep()}
      </Animated.View>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={goNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1
              ? (isSubmitting ? 'Yüklənir...' : 'Tamamla')
              : 'Davam et'}
          </Text>
          {currentStep < totalSteps - 1 && (
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Skip on step 3 */}
      {currentStep === 2 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSubmit}>
          <Text style={styles.skipButtonText}>Keç →</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#F24141',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 32,
  },
  stepEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  prefilledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  prefilledText: {
    fontSize: 14,
    color: '#333',
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#F24141',
    backgroundColor: '#FFF5F5',
  },
  optionIcon: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#F24141',
  },
  optionSublabel: {
    fontSize: 13,
    color: '#999',
  },
  optionSublabelSelected: {
    color: '#F24141',
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
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  lastServiceChipSelected: {
    borderColor: '#F24141',
    backgroundColor: '#FFF5F5',
  },
  lastServiceChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  lastServiceChipTextSelected: {
    color: '#F24141',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  centersList: {
    flex: 1,
    maxHeight: 220,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  centerCardSelected: {
    borderColor: '#F24141',
    backgroundColor: '#FFF5F5',
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  centerNameSelected: {
    color: '#F24141',
  },
  centerAddress: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F24141',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
});
