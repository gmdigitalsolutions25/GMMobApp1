import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Clock, CheckCircle2, Calendar } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { getTranslatedServices } from '@/constants/mockData';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useApp();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const serviceTypes = getTranslatedServices(t);

  const service = serviceTypes.find((s) => s.id === id);

  if (!service) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {t('serviceDetails.serviceNotFound')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.imageUri }}
            style={styles.serviceImage}
            contentFit="cover"
          />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.serviceName, { color: colors.text }]}>
              {service.name}
            </Text>
            <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
              {service.description}
            </Text>
          </View>

          <View style={styles.infoCards}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('serviceDetails.duration')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {service.duration}
              </Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <CheckCircle2 size={24} color={colors.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('serviceDetails.serviceType')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {t('serviceDetails.professional')}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('serviceDetails.aboutThisService')}
            </Text>
            <Text style={[styles.fullDescription, { color: colors.textSecondary }]}>
              {service.fullDescription}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('serviceDetails.whatsIncluded')}
            </Text>
            <View style={styles.includesList}>
              {service.includes.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.includeItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.checkIcon,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <CheckCircle2 size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.includeText, { color: colors.text }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.expertiseCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.expertiseTitle, { color: colors.text }]}>
              {t('serviceDetails.expertTechnicians')}
            </Text>
            <Text style={[styles.expertiseDescription, { color: colors.textSecondary }]}>
              {t('serviceDetails.expertDescription')}
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.footerContent}>
          <View style={styles.priceInfo}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {t('serviceDetails.servicePrice')}
            </Text>
            <Text style={[styles.footerPrice, { color: colors.primary }]}>
              ₼{service.price}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/appointments')}
          >
            <Calendar size={20} color="#000000" />
            <Text style={[styles.bookButtonText, { color: '#000000' }]}>
              {t('serviceDetails.bookService')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 320,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  content: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  serviceName: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 8,
    lineHeight: 40,
  },
  serviceDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  fullDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  includesList: {
    gap: 12,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  includeText: {
    fontSize: 15,
    flex: 1,
    fontWeight: '500' as const,
  },
  expertiseCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  expertiseTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  expertiseDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 8,
    minWidth: 160,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
