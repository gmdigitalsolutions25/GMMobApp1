import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Calendar, History, Shield } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import type { Language } from '@/constants/types';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setLanguage } = useApp();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation1.start();
    floatAnimation2.start();

    return () => {
      floatAnimation1.stop();
      floatAnimation2.stop();
    };
  }, [float1, float2]);

  const float1Y = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const float2Y = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const features = [
    { icon: Car, title: t('welcome.vehicleManagement'), desc: t('welcome.vehicleManagementDesc') },
    { icon: History, title: t('welcome.serviceHistory'), desc: t('welcome.serviceHistoryDesc') },
    { icon: Calendar, title: t('welcome.easyBooking'), desc: t('welcome.easyBookingDesc') },
    { icon: Shield, title: t('welcome.securePrivate'), desc: t('welcome.securePrivateDesc') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.heroBackground}>
          <View style={[styles.diagonalStripe, styles.diagonalStripe1]} />
          <View style={[styles.diagonalStripe, styles.diagonalStripe2]} />
          
          <Animated.View
            style={[
              styles.floatingAccent1,
              {
                transform: [{ translateY: float1Y }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.floatingAccent2,
              {
                transform: [{ translateY: float2Y }],
              },
            ]}
          />
        </View>
        
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <View style={styles.compactLogoContainer}>
              <Car size={32} color={Colors.dark.primary} strokeWidth={2} />
            </View>
            <Text style={styles.title}>{t('welcome.title')}</Text>
          </View>

          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>{t('welcome.subtitle')}</Text>
            <Text style={styles.ctaSubtitle}>{t('welcome.ctaDescription')}</Text>
          </View>

          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.primaryDark]}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.getStartedText}>{t('welcome.getStarted')}</Text>
            </LinearGradient>
          </TouchableOpacity>

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

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>{t('welcome.whatYouGet')}</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <feature.icon size={20} color={Colors.dark.primary} strokeWidth={2} />
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  diagonalStripe1: {
    top: -50,
    left: -100,
    opacity: 0.4,
  },
  diagonalStripe2: {
    top: 120,
    right: -150,
    backgroundColor: `${Colors.dark.primary}05`,
    opacity: 0.3,
  },
  diagonalStripe3: {
    bottom: 80,
    left: -80,
    height: 150,
    backgroundColor: `${Colors.dark.primary}12`,
    opacity: 0.5,
  },

  floatingAccent1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: 60,
    right: -30,
    backgroundColor: `${Colors.dark.primary}10`,
    opacity: 0.4,
  },
  floatingAccent2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: 120,
    left: -20,
    backgroundColor: `${Colors.dark.primary}08`,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  compactLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.dark.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: `${Colors.dark.primary}40`,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    flex: 1,
  },
  ctaSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.dark.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  featuresContainer: {
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.dark.text,
  },
  languageSection: {
    marginBottom: 32,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
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
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  languageButtonActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  languageButtonTextActive: {
    color: Colors.dark.text,
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
});
