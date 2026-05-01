/**
 * HealthDetailScreen — Vehicle Health Gauges
 *
 * Opens when user taps the "72%" health stat on Home.
 * Shows a large circular gauge + 6 component gauges (Oil, Brakes, Tires, Battery, AC, Filter).
 * This is a sub-screen, not a tab — navigated via router.push('/health-detail').
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface GaugeData {
  label: string;
  value: number;
  icon: string;
}

const GAUGES: GaugeData[] = [
  { label: 'Yağ', value: 85, icon: '🛢️' },
  { label: 'Əyləc', value: 60, icon: '🔴' },
  { label: 'Təkər', value: 90, icon: '🛞' },
  { label: 'Batareya', value: 78, icon: '🔋' },
  { label: 'Kondisioner', value: 55, icon: '❄️' },
  { label: 'Filtr', value: 45, icon: '🔧' },
];

export default function HealthDetailScreen() {
  const { t } = useTranslation();
  const { theme, vehicles } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const router = useRouter();

  const primaryVehicle = vehicles[0];
  const overallHealth = 72;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('health.title') || 'Avtomobil Sağlamlığı'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vehicle name */}
        {primaryVehicle && (
          <Text style={[styles.vehicleName, { color: colors.textSecondary }]}>
            {primaryVehicle.brand} {primaryVehicle.model} · {primaryVehicle.year}
          </Text>
        )}

        {/* Main gauge */}
        <View style={styles.mainGaugeContainer}>
          <CircularGauge
            value={overallHealth}
            size={180}
            strokeWidth={12}
            colors={colors}
            theme={theme}
          />
          <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>
            {t('health.overall') || 'Ümumi sağlamlıq'}
          </Text>
        </View>

        {/* Component gauges grid */}
        <View style={styles.gaugesGrid}>
          {GAUGES.map((gauge) => (
            <View
              key={gauge.label}
              style={[styles.gaugeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <CircularGauge
                value={gauge.value}
                size={70}
                strokeWidth={6}
                colors={colors}
                theme={theme}
              />
              <Text style={styles.gaugeIcon}>{gauge.icon}</Text>
              <Text style={[styles.gaugeCardLabel, { color: colors.text }]}>{gauge.label}</Text>
              <Text style={[styles.gaugeCardValue, { color: getGaugeColor(gauge.value, colors) }]}>
                {gauge.value}%
              </Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/appointments')}
        >
          <Calendar size={18} color="#FFF" />
          <Text style={styles.ctaText}>
            {t('health.orderInspection') || 'Tam yoxlama sifariş et'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ─── CIRCULAR GAUGE ─── */

function CircularGauge({ value, size, strokeWidth, colors, theme }: {
  value: number; size: number; strokeWidth: number; colors: any; theme: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const gaugeColor = getGaugeColor(value, colors);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center text */}
        <SvgText
          x={size / 2}
          y={size / 2 + (size > 100 ? 8 : 5)}
          textAnchor="middle"
          fontSize={size > 100 ? 32 : 16}
          fontWeight="700"
          fill={colors.text}
        >
          {value}%
        </SvgText>
      </Svg>
    </View>
  );
}

function getGaugeColor(value: number, colors: any): string {
  if (value >= 70) return colors.gaugeGreen || colors.success;
  if (value >= 40) return colors.gaugeAmber || colors.warning;
  return colors.gaugeRed || colors.error;
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: { alignItems: 'center', paddingHorizontal: 16 },

  vehicleName: { fontSize: 14, marginTop: 8 },

  // Main gauge
  mainGaugeContainer: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  gaugeLabel: { fontSize: 14, marginTop: 8 },

  // Grid
  gaugesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  gaugeCard: {
    width: (width - 56) / 3,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  gaugeIcon: { fontSize: 16, marginTop: 4 },
  gaugeCardLabel: { fontSize: 12, fontWeight: '600' },
  gaugeCardValue: { fontSize: 13, fontWeight: '700' },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 28,
  },
  ctaText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
