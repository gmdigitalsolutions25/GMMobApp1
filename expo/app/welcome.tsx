/**
 * Qaraj GM — Welcome Screen (v2 Showroom Floor)
 *
 * First screen shown to new users. Allows language selection and
 * introduces the app features before routing to auth.
 */

import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Calendar, History, Shield, Wrench } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useDesignV2, ColorsV2 } from '@/hooks/useDesignV2';
import { AppVersion } from '@/components/AppVersion';
import type { Language } from '@/constants/types';
import { useTranslation } from 'react-i18next';


// Hero images — same set as other screens
const HERO_IMAGES = [
  require('@/assets/images/hero-toyota-land-cruiser.jpg'),
  require('@/assets/images/hero-toyota-camry.jpg'),
  require('@/assets/images/hero-toyota-rav4.jpg'),
  require('@/assets/images/hero-toyota-prado.jpg'),
  require('@/assets/images/hero-toyota-corolla-cross.jpg'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setLanguage } = useApp();
  const { t, i18n } = useTranslation();
  const { isV2, theme } = useDesignV2();
  const c = isV2 ? ColorsV2[theme] : (Colors[theme] || Colors.dark);
  const styles = createStyles(c, theme);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [heroIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));

  const handleLanguageSelect = async (lang: Language) => {
    setSelectedLanguage(lang);
    await setLanguage(lang);
    await i18n.changeLanguage(lang);
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/auth');
  };

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'az', label: 'Azerbaijani', nativeLabel: 'Azərbaycan' },
    { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  ];


  const features = [
    { icon: Car, title: t('welcome.vehicleManagement'), desc: t('welcome.vehicleManagementDesc') },
    { icon: History, title: t('welcome.serviceHistory'), desc: t('welcome.serviceHistoryDesc') },
    { icon: Calendar, title: t('welcome.easyBooking'), desc: t('welcome.easyBookingDesc') },
    { icon: Shield, title: t('welcome.securePrivate'), desc: t('welcome.securePrivateDesc') },
  ];

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
          {/* Title */}
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
          <Text style={styles.description}>{t('welcome.ctaDescription')}</Text>

          {/* Language selection */}
          <View style={styles.languageSection}>
            <Text style={styles.languageLabel}>{t('welcome.chooseLanguage')}</Text>
            <View style={styles.languageButtons}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    selectedLanguage === lang.code && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      selectedLanguage === lang.code && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang.nativeLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <LinearGradient
              colors={[c.primary, c.primaryDark]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>{t('welcome.getStarted')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>{t('welcome.whatYouGet')}</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <feature.icon size={18} color={c.primary} strokeWidth={2} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    height: '38%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)',
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
    paddingTop: 36,
    paddingBottom: 40,
    minHeight: '66%',
    // Glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28, fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18, fontWeight: '600',
    color: c.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 15, color: c.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  languageSection: {
    marginBottom: 24,
  },
  languageLabel: {
    fontSize: 13, fontWeight: '600',
    color: c.textTertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  languageButtonActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  languageButtonText: {
    fontSize: 14, fontWeight: '600',
    color: c.textSecondary,
  },
  languageButtonTextActive: {
    color: '#FFF',
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 17, fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  featuresContainer: {
    marginTop: 4,
  },
  featuresTitle: {
    fontSize: 13, fontWeight: '600',
    color: c.textTertiary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  featureIconContainer: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${c.primary}12`,
    justifyContent: 'center', alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15, fontWeight: '500',
    color: c.text,
  },
});
