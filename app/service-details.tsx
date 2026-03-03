import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Clock, CheckCircle2, Calendar, Star, Shield, Wrench, DollarSign } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import { getTranslatedServices } from '@/constants/mockData';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, vehicles } = useApp();
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

  const highlights = [
    { icon: <Clock size={18} color={colors.primary} />, label: 'Duration', value: service.duration },
    { icon: <DollarSign size={18} color={colors.primary} />, label: 'Starting from', value: `₼${service.price}` },
    { icon: <Shield size={18} color={colors.primary} />, label: 'Warranty', value: '6 months' },
    { icon: <Star size={18} color={colors.primary} />, label: 'Rating', value: '4.8 / 5.0' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.imageUri }}
            style={styles.serviceImage}
            contentFit="cover"
          />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.imageContent}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Wrench size={14} color="#000" />
              <Text style={styles.categoryBadgeText}>Service</Text>
            </View>
            <Text style={styles.imageTitle}>{service.name}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Highlights */}
          <View style={[styles.highlightsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {highlights.map((h, i) => (
              <View key={i} style={[styles.highlightItem, i < highlights.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
                {h.icon}
                <Text style={[styles.highlightValue, { color: colors.text }]}>{h.value}</Text>
                <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>{h.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Service</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {service.fullDescription}
            </Text>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What's Included</Text>
            <View style={[styles.includesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {service.includes.map((item, index) => (
                <View key={index} style={styles.includeItem}>
                  <CheckCircle2 size={18} color={colors.primary} />
                  <Text style={[styles.includeText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Why Choose Qaraj */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose Qaraj?</Text>
            <View style={[styles.whyCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
              {[
                'Certified technicians with 10+ years experience',
                'Genuine OEM and premium aftermarket parts',
                'Transparent pricing — no hidden fees',
                '6-month service warranty on all work',
                'Real-time status updates via the app',
              ].map((reason, idx) => (
                <View key={idx} style={styles.whyItem}>
                  <View style={[styles.whyDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.whyText, { color: colors.text }]}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={[styles.bookingBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.bookingPrice, { color: colors.primary }]}>from ₼{service.price}</Text>
          <Text style={[styles.bookingDuration, { color: colors.textSecondary }]}>{service.duration}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/appointments',
              params: { serviceTypes: JSON.stringify([service.name]) },
            })
          }
        >
          <Calendar size={18} color="#000" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
  scrollView: { flex: 1 },
  imageContainer: { height: 280, position: 'relative' },
  serviceImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: { color: '#000', fontSize: 12, fontWeight: '700' },
  imageTitle: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  content: { padding: 20 },
  highlightsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  highlightValue: { fontSize: 14, fontWeight: '700' },
  highlightLabel: { fontSize: 11 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22 },
  includesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  includeItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  includeText: { fontSize: 14, flex: 1 },
  whyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  whyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  whyDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  whyText: { fontSize: 14, flex: 1, lineHeight: 20 },
  bookingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  bookingPrice: { fontSize: 20, fontWeight: '800' },
  bookingDuration: { fontSize: 12, marginTop: 2 },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
