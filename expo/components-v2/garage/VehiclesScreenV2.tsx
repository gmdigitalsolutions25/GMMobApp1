/**
 * VehiclesScreenV2 — "My Garage" with Car-First Hero + Health Gauges
 *
 * Approved layout:
 * - Full-width hero car image (from carImages or user photo)
 * - Name/year/plate/mileage overlaid on gradient
 * - 5 thin-ring health gauges in a single row (Engine, Tires, Oil, Battery, Brakes)
 * - Next service bar with Book CTA
 * - Recommended services
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Car,
  Edit2,
  Trash2,
  Clock,
  Wrench,
  Search,
  CheckCircle,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useAlert } from '@/components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import { trpc } from '@/lib/trpc';
import { getCarModelImage, FALLBACK_CAR_IMAGE } from '@/constants/carImages';
import { isGmBrand } from '@/constants/gm-brands';
import ThinRingGauge from './ThinRingGauge';
import GmBadge from './GmBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const HERO_HEIGHT = 220;
const RING_SIZE = 52; // Thin ring diameter for Option D layout

export default function VehiclesScreenV2() {
  const { t } = useTranslation();
  const router = useRouter();
  const { vehicles, theme, deleteVehicle, appointments, user, addVehicle } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const { showConfirm } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [hasFetchedVehicles, setHasFetchedVehicles] = useState(false);

  // Fetch vehicles from backend
  const vehiclesByPhoneQuery = trpc.vehicles.getByPhone.useQuery(
    { phone: user?.phone || '' },
    {
      enabled: !!user?.phone && !hasFetchedVehicles && vehicles.length === 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (vehiclesByPhoneQuery.data && !hasFetchedVehicles) {
      if (vehiclesByPhoneQuery.data.vehicles?.length > 0) {
        vehiclesByPhoneQuery.data.vehicles.forEach((vehicle: any) => {
          addVehicle({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            licensePlate: vehicle.licensePlate,
            photos: vehicle.photos || [],
            mileage: vehicle.mileage,
            color: vehicle.color,
          });
        });
      }
      setHasFetchedVehicles(true);
    }
  }, [vehiclesByPhoneQuery.data, hasFetchedVehicles, addVehicle]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDelete = (vehicleId: string, vehicleName: string) => {
    showConfirm(
      t('vehicles.deleteVehicle'),
      t('vehicles.deleteConfirm', { name: vehicleName }),
      () => deleteVehicle(vehicleId),
      undefined,
      t('common.delete'),
      t('common.cancel'),
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('vehicles.myGarage') || 'Mənim Qarajım'}
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/add-vehicle')}
        >
          <Plus size={18} color="#FFF" />
          <Text style={styles.addBtnText}>
            {t('vehicles.addVehicle') || 'Əlavə et'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {vehicles.length === 0 ? (
          <EmptyGarage colors={colors} t={t} onAdd={() => router.push('/add-vehicle')} />
        ) : (
          vehicles.map((vehicle) => (
            <VehicleHeroCard
              key={vehicle.id}
              vehicle={vehicle}
              colors={colors}
              t={t}
              appointments={appointments}
              onEdit={() => router.push(`/edit-vehicle?vehicleId=${vehicle.id}`)}
              onDelete={() => handleDelete(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
              onBook={() => router.push('/(tabs)/appointments')}
              onPhoto={() => router.push(`/vehicle-photo?vehicleId=${vehicle.id}`)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ─── HEALTH GAUGE DATA ─── */

function getHealthGauges(vehicle: any, t: any) {
  // TODO: Replace with real calculations from service records & mileage
  const mileage = vehicle.mileage || 0;

  // Simulated health based on mileage intervals
  const oilInterval = 10000;
  const oilUsed = mileage % oilInterval;
  const oilPercent = Math.max(5, Math.round(100 - (oilUsed / oilInterval) * 100));
  const oilRemaining = oilInterval - oilUsed;

  const brakeInterval = 40000;
  const brakeUsed = mileage % brakeInterval;
  const brakePercent = Math.max(5, Math.round(100 - (brakeUsed / brakeInterval) * 100));
  const brakeRemaining = brakeInterval - brakeUsed;

  const tireInterval = 50000;
  const tireUsed = mileage % tireInterval;
  const tirePercent = Math.max(5, Math.round(100 - (tireUsed / tireInterval) * 100));

  return [
    {
      percent: Math.min(95, 70 + Math.round(Math.random() * 25)),
      label: t('health.engine') || 'Mühərrik',
      detail: t('health.goodCondition') || 'Yaxşı vəziyyət',
    },
    {
      percent: tirePercent,
      label: t('health.tires') || 'Təkərlər',
      detail: tirePercent > 70
        ? (t('health.goodCondition') || 'Yaxşı vəziyyət')
        : (t('health.checkNeeded') || 'Yoxlama lazımdır'),
    },
    {
      percent: oilPercent,
      label: t('health.oil') || 'Yağ',
      detail: `${(oilRemaining / 1000).toFixed(1)}k km ${t('vehicles.remaining') || 'qalıb'}`,
    },
    {
      percent: Math.min(98, 80 + Math.round(Math.random() * 18)),
      label: t('health.battery') || 'Akkumulyator',
      detail: t('health.monthsLeft', { count: 11 }) || '11 ay qalıb',
    },
    {
      percent: brakePercent,
      label: t('health.brakes') || 'Əyləclər',
      detail: `${(brakeRemaining / 1000).toFixed(1)}k km ${t('vehicles.remaining') || 'qalıb'}`,
    },
  ];
}

/* ─── VEHICLE HERO CARD ─── */

function VehicleHeroCard({ vehicle, colors, t, appointments, onEdit, onDelete, onBook, onPhoto }: any) {
  // Determine if this is a GM-brand vehicle (full features) or "Other" (simplified)
  const vehicleIsGm = vehicle.isGmBrand !== false && isGmBrand(vehicle.brand);

  // Resolve car image: user photo > carImages catalog > fallback
  const hasUserPhoto = vehicle.photos && vehicle.photos.length > 0;
  const primaryPhoto = hasUserPhoto
    ? vehicle.photos.find((p: any) => p.isPrimary) || vehicle.photos[0]
    : null;
  const userPhotoUri = primaryPhoto
    ? (typeof primaryPhoto === 'string' ? primaryPhoto : primaryPhoto.uri)
    : null;

  const catalogImage = getCarModelImage(vehicle.brand, vehicle.model);
  const heroImageUri = userPhotoUri || catalogImage?.uri || FALLBACK_CAR_IMAGE;

  const gauges = vehicleIsGm ? getHealthGauges(vehicle, t) : [];

  // Check for upcoming appointments
  const hasUpcoming = appointments.some(
    (apt: any) => apt.vehicleId === vehicle.id && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  // Next service estimate
  const nextServiceKm = vehicle.mileage ? Math.ceil((vehicle.mileage + 10000) / 10000) * 10000 : 50000;
  const remainingKm = nextServiceKm - (vehicle.mileage || 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* ── Hero Image ── */}
      <TouchableOpacity onPress={onPhoto} activeOpacity={0.9}>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: heroImageUri }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />

          {/* Gradient overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.heroGradient}
          />

          {/* GM Badge + Edit / Delete buttons */}
          <View style={styles.heroActions}>
            {vehicleIsGm && <GmBadge />}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onEdit} style={styles.heroIconBtn}>
              <Edit2 size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.heroIconBtn}>
              <Trash2 size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Vehicle name & details overlaid */}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.heroDetail}>
              {vehicle.year} · {vehicle.licensePlate || 'N/A'} · {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Health Gauges (Option D: Thin Rings Row) — GM brands only ── */}
      {vehicleIsGm && (
        <View style={styles.gaugesSection}>
          <Text style={[styles.gaugesSectionTitle, { color: colors.textSecondary }]}>
            {t('health.title') || 'HEALTH GAUGES'}
          </Text>

          <View style={styles.gaugesRow}>
            {gauges.map((g, i) => (
              <ThinRingGauge
                key={i}
                percent={g.percent}
                label={g.label}
                detail={g.detail}
                size={RING_SIZE}
                strokeWidth={5}
                labelColor={colors.text}
                detailColor={colors.textSecondary}
                trackColor={colors.border}
              />
            ))}
          </View>
        </View>
      )}

      {/* Simplified info for non-GM vehicles */}
      {!vehicleIsGm && (
        <View style={styles.otherBrandInfo}>
          <Text style={[styles.otherBrandMileage, { color: colors.textSecondary }]}>
            {vehicle.mileage ? `Yürüş: ${vehicle.mileage.toLocaleString()} km` : ''}
          </Text>
        </View>
      )}

      {/* ── Service sections — GM brands only ── */}
      {vehicleIsGm && (
        <>
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Next Service + Book */}
          <View style={styles.nextServiceRow}>
            <View style={styles.nextServiceInfo}>
              <View style={styles.nextServiceLine}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={[styles.nextServiceLabel, { color: colors.text }]}>
                  {t('vehicles.nextServiceAt') || 'Növbəti servis:'}{' '}
                  <Text style={styles.nextServiceBold}>
                    {nextServiceKm.toLocaleString()} km
                  </Text>
                </Text>
              </View>
              <Text style={[styles.nextServiceRemaining, { color: colors.textSecondary }]}>
                {remainingKm.toLocaleString()} km {t('vehicles.remaining') || 'qalıb'}
              </Text>
              {/* Progress bar */}
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(5, ((10000 - remainingKm) / 10000) * 100))}%`,
                      backgroundColor: remainingKm > 3000 ? colors.success : remainingKm > 1000 ? colors.warning : colors.error,
                    },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.primary }]}
              onPress={onBook}
            >
              <Text style={styles.bookBtnText}>{t('vehicles.book') || 'Yaz'}</Text>
            </TouchableOpacity>
          </View>

          {/* Recommended Services */}
          <View style={[styles.recommendedRow, { borderTopColor: colors.border }]}>
            <Wrench size={13} color={colors.primary} />
            <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>
              {t('vehicles.recommended') || 'Tövsiyə:'}{' '}
            </Text>
            <Text style={[styles.recommendedList, { color: colors.text }]} numberOfLines={1}>
              {t('vehicles.oilChange') || 'Yağ dəyişimi'}, {t('vehicles.filterReplacement') || 'Filtr'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

/* ─── EMPTY STATE ─── */

function EmptyGarage({ colors, t, onAdd }: any) {
  const { user } = useApp();
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

  const createRequestMutation = trpc.vehicleRequests.create.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setRequestSent(true);
      }
    },
  });

  const handleFindMyVehicle = () => {
    if (!user?.phone) return;
    setSending(true);
    createRequestMutation.mutate(
      {
        phone: user.phone,
        customerName: user.firstName
          ? `${user.lastName || ''} ${user.firstName}`.trim()
          : undefined,
      },
      { onSettled: () => setSending(false) }
    );
  };

  return (
    <View style={styles.emptyContainer}>
      <Car size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('vehicles.noVehicles') || 'Qarajınız boşdur'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('vehicles.noVehiclesHint') || 'Sizin adınıza qeydiyyatdan keçmiş nəqliyyat vasitəsi tapılmadı.'}
      </Text>

      {/* Find my vehicle request button */}
      {requestSent || createRequestMutation.data?.alreadyRequested ? (
        <View style={styles.requestSentContainer}>
          <CheckCircle size={20} color={colors.success || '#22c55e'} />
          <Text style={[styles.requestSentText, { color: colors.success || '#22c55e' }]}>
            {t('vehicles.requestSent') || 'Sorğunuz qəbul edildi. Tezliklə sizinlə əlaqə saxlanılacaq.'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.findVehicleBtn, { backgroundColor: colors.warning || '#f59e0b' }]}
          onPress={handleFindMyVehicle}
          disabled={sending}
        >
          <Search size={18} color="#FFF" />
          <Text style={styles.emptyBtnText}>
            {sending
              ? (t('common.loading') || 'Gözləyin...')
              : (t('vehicles.findMyVehicle') || 'Avtomobilimi tap')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Manual add option */}
      <Text style={[styles.orText, { color: colors.textSecondary }]}>
        {t('common.or') || 'və ya'}
      </Text>
      <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={onAdd}>
        <Plus size={18} color="#FFF" />
        <Text style={styles.emptyBtnText}>{t('vehicles.addManually') || 'Əl ilə əlavə et'}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingHorizontal: CARD_MARGIN, paddingTop: 12 },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 16,
    overflow: 'hidden',
  },

  // Hero image
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.55,
  },
  heroActions: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  heroName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroDetail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },

  // Gauges
  gaugesSection: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
  },
  gaugesSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },

  // Divider
  divider: {
    height: 0.5,
    marginHorizontal: 16,
    marginTop: 4,
  },

  // Next service
  nextServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  nextServiceInfo: {
    flex: 1,
  },
  nextServiceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextServiceLabel: {
    fontSize: 13,
  },
  nextServiceBold: {
    fontWeight: '700',
  },
  nextServiceRemaining: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 20,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Recommended
  recommendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  recommendedLabel: { fontSize: 12 },
  recommendedList: { fontSize: 12, fontWeight: '500', flex: 1 },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 4,
  },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  findVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 12,
  },
  requestSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
  },
  requestSentText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  orText: {
    fontSize: 13,
    marginTop: 8,
  },

  // Other brand simplified card
  otherBrandInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  otherBrandMileage: {
    fontSize: 13,
    fontWeight: '500',
  },
});
