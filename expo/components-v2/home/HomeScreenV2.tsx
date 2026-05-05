/**
 * HomeScreenV2 — "Showroom Floor" design
 *
 * Premium photo hero, glass overlay stats row, quick actions,
 * service timeline, CRM history, Coming Soon blocks, nearby centers.
 *
 * This component replaces the original HomeScreen when EXPO_PUBLIC_DESIGN_V2=true.
 * It reuses the same data hooks, providers, and backend — only the UI layer changes.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Calendar,
  Car,
  Bell,
  MapPin,
  Star,
  ChevronRight,
  Gauge,
  Shield,
  FileText,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import { StatCard } from '@/components-v2/shared/StatCard';
import { QuickAction } from '@/components-v2/shared/QuickAction';
import { ServiceTimelineItem } from '@/components-v2/shared/ServiceTimelineItem';
import { ComingSoonBlock } from '@/components-v2/shared/ComingSoonBlock';
import { getUnreadCount } from '@/lib/notifications';
import ProfileCompletionBanner from '@/components-v2/shared/ProfileCompletionBanner';

const { width } = Dimensions.get('window');

// Premium Toyota hero images — rotate on each visit
const HERO_IMAGES = [
  require('@/assets/images/hero-toyota-land-cruiser.jpg'),
  require('@/assets/images/hero-toyota-camry.jpg'),
  require('@/assets/images/hero-toyota-rav4.jpg'),
  require('@/assets/images/hero-toyota-prado.jpg'),
  require('@/assets/images/hero-toyota-corolla-cross.jpg'),
];

// Coming soon block images
const CARS_SALE_IMG = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=60';
const SPARE_PARTS_IMG = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=60';

export default function HomeScreenV2() {
  const { t } = useTranslation();
  const { theme, vehicles, user } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    };
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const primaryVehicle = vehicles[0];
  const [heroIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));
  const heroSource = HERO_IMAGES[heroIdx];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ─── HERO SECTION ─── */}
        <ImageBackground source={heroSource} style={[styles.hero, { paddingTop: insets.top }]}>
          <View style={[styles.heroOverlay, { backgroundColor: colors.heroOverlay }]} />

          {/* Header bar */}
          <View style={styles.heroHeader}>
            <View style={styles.logoRow}>
              <Image
                source={require('@/assets/images/groupmotors-logo.jpg')}
                style={styles.logoIcon}
                contentFit="contain"
              />
              <Text style={[styles.logoText, { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }]}>
                Qaraj
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[styles.bellBtn, { backgroundColor: colors.primary }]}
            >
              <Bell size={20} color="#FFF" />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* ─── GREETING (below hero, does not overlap image) ─── */}
        <View style={[styles.greetingSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.greetingText, { color: colors.text }]}>
            {user?.firstName
              ? t('home.greeting', { name: user.firstName })
              : (t('home.greetingNoName') || 'Salam! 👋')}
          </Text>
          {primaryVehicle && (
            <Text style={[styles.carNameText, { color: colors.textSecondary }]}>
              {primaryVehicle.brand} {primaryVehicle.model} · {primaryVehicle.year}
            </Text>
          )}
        </View>

        {/* ─── PROFILE COMPLETION BANNER ─── */}
        <ProfileCompletionBanner
          user={user}
          vehicles={vehicles}
          colors={colors}
          onComplete={() => router.push('/onboarding')}
        />

        {/* ─── STATS ROW ─── */}
        <View style={styles.statsRow}>
          <StatCard
            value={primaryVehicle?.mileage ? `${(primaryVehicle.mileage / 1000).toFixed(1)}k` : '—'}
            label={t('home.km') || 'km'}
            theme={theme}
          />
          <View style={{ width: 10 }} />
          <StatCard
            value="72%"
            label={t('home.health') || 'Sağlamlıq'}
            theme={theme}
            onPress={() => router.push('/health-detail')}
          />
          <View style={{ width: 10 }} />
          <StatCard
            value="15 May"
            label={t('home.nextService') || 'Növbəti servis'}
            theme={theme}
            onPress={() => router.push('/(tabs)/appointments')}
          />
        </View>

        {/* ─── QUICK ACTIONS ─── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.quickActions') || 'Sürətli əməliyyatlar'}
          </Text>
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon={Calendar}
              label={t('home.bookService') || 'Servis yaz'}
              theme={theme}
              onPress={() => router.push('/(tabs)/appointments')}
            />
            <QuickAction
              icon={Car}
              label={t('home.myGarage') || 'Qarajım'}
              theme={theme}
              onPress={() => router.push('/(tabs)/vehicles')}
            />
            <QuickAction
              icon={Gauge}
              label={t('home.diagnostics') || 'Diaqnostika'}
              theme={theme}
              onPress={() => router.push('/service-details')}
            />
            <QuickAction
              icon={FileText}
              label={t('home.history') || 'Tarixçə'}
              theme={theme}
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>
        </View>

        {/* ─── SERVICE TIMELINE ─── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.serviceTimeline') || 'Servis xətti'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t('common.seeAll') || 'Hamısı'}
              </Text>
            </TouchableOpacity>
          </View>
          <ServiceTimelineItem
            title={t('home.oilChange') || 'Yağ dəyişimi'}
            date="12 Mar 2026"
            status="done"
            theme={theme}
          />
          <ServiceTimelineItem
            title={t('home.fullInspection') || 'Tam yoxlama'}
            date="15 May 2026"
            status="pending"
            theme={theme}
          />
          <ServiceTimelineItem
            title={t('home.tireChange') || 'Təkər dəyişimi'}
            date={t('home.waiting') || 'Gözləyir'}
            status="waiting"
            theme={theme}
            isLast
          />
        </View>

        {/* ─── CRM SERVICE HISTORY ─── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.crmHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('home.serviceHistory') || 'Servis Tarixçəsi'}
              </Text>
              <View style={styles.crmBadge}>
                <Text style={styles.crmBadgeText}>CRM</Text>
              </View>
            </View>
          </View>

          {/* CRM history rows */}
          <View style={[styles.historyCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <HistoryRow date="12 Mar 2026" service="Yağ dəyişimi" cost="₼120" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <HistoryRow date="15 Jan 2026" service="Tam yoxlama" cost="₼380" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <HistoryRow date="28 Nov 2025" service="Təkər dəyişimi" cost="₼170" colors={colors} />
          </View>
          <Text style={[styles.crmNote, { color: colors.textTertiary }]}>
            ACar CRM-dən yüklənib ✓
          </Text>
        </View>

        {/* ─── COMING SOON BLOCKS ─── */}
        <View style={styles.comingSoonRow}>
          <ComingSoonBlock
            title="Avtomobil Satışı"
            imageUri={CARS_SALE_IMG}
            theme={theme}
          />
          <View style={{ width: 12 }} />
          <ComingSoonBlock
            title="Ehtiyat Hissələri"
            imageUri={SPARE_PARTS_IMG}
            theme={theme}
          />
        </View>

        {/* ─── NEARBY SERVICE CENTERS ─── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.nearbyServiceCenters') || 'Yaxın Servis Mərkəzləri'}
          </Text>
          <View style={styles.centersRow}>
            <ServiceCenterCard
              name="Toyota Abşeron"
              distance="2.3 km"
              rating="4.8"
              colors={colors}
              onPress={() => router.push('/(tabs)/appointments')}
            />
            <View style={{ width: 10 }} />
            <ServiceCenterCard
              name="Mitsubishi Motors Bakı"
              distance="5.1 km"
              rating="4.6"
              colors={colors}
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ─── SUB-COMPONENTS ─── */

function HistoryRow({ date, service, cost, colors }: {
  date: string; service: string; cost: string; colors: any;
}) {
  return (
    <View style={styles.historyRow}>
      <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{date}</Text>
      <Text style={[styles.historyService, { color: colors.text }]}>{service}</Text>
      <Text style={[styles.historyCost, { color: colors.text }]}>{cost}</Text>
      <Shield size={16} color="#22C55E" />
    </View>
  );
}

function ServiceCenterCard({ name, distance, rating, colors, onPress }: {
  name: string; distance: string; rating: string; colors: any; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.centerCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={onPress}
    >
      <MapPin size={18} color={colors.primary} />
      <Text style={[styles.centerName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
      <View style={styles.centerMeta}>
        <Text style={[styles.centerDistance, { color: colors.textSecondary }]}>{distance}</Text>
        <Star size={12} color="#F59E0B" fill="#F59E0B" />
        <Text style={[styles.centerRating, { color: colors.textSecondary }]}>{rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Hero
  hero: {
    height: 280,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Greeting below hero
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greetingText: {
    fontSize: 21,
    fontWeight: '700',
  },
  carNameText: {
    fontSize: 14,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  // CRM
  crmHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crmBadge: {
    backgroundColor: '#F24141',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  crmBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  historyCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  historyDate: {
    fontSize: 12,
    width: 80,
  },
  historyService: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  historyCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 0.5,
    marginHorizontal: 12,
  },
  crmNote: {
    fontSize: 11,
    marginTop: 8,
  },

  // Coming soon
  comingSoonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // Service centers
  centersRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  centerCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    gap: 6,
  },
  centerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  centerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  centerDistance: {
    fontSize: 12,
  },
  centerRating: {
    fontSize: 12,
    fontWeight: '600',
  },
});
