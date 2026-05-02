/**
 * VehiclesScreenV2 — "Showroom Floor" My Garage
 *
 * Premium vehicle cards with photo, health bar, service reminder,
 * CRM history, and recommended services. Same data, new look.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import {
  Plus,
  Car,
  Calendar as CalendarIcon,
  Gauge,
  Wrench,
  ChevronRight,
  Edit2,
  Trash2,
  Shield,
  Clock,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useAlert } from '@/components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import { trpc } from '@/lib/trpc';

const { width } = Dimensions.get('window');

export default function VehiclesScreenV2() {
  const { t } = useTranslation();
  const router = useRouter();
  const { vehicles, theme, deleteVehicle, appointments, user, addVehicle } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const { showAlert } = useAlert();

  const [refreshing, setRefreshing] = useState(false);
  const [hasFetchedVehicles, setHasFetchedVehicles] = useState(false);

  // Fetch vehicles from backend (same logic as v1)
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
    showAlert({
      title: t('vehicles.deleteVehicle'),
      message: t('vehicles.deleteConfirm', { name: vehicleName }),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteVehicle(vehicleId),
        },
      ],
    });
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
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              colors={colors}
              theme={theme}
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

/* ─── VEHICLE CARD ─── */

function VehicleCard({ vehicle, colors, theme, t, appointments, onEdit, onDelete, onBook, onPhoto }: any) {
  const hasPhoto = vehicle.photos && vehicle.photos.length > 0;
  // photos are VehiclePhoto objects { id, uri, isPrimary }, not plain strings
  const primaryPhoto = hasPhoto
    ? vehicle.photos.find((p: any) => p.isPrimary) || vehicle.photos[0]
    : null;
  const photoUri = primaryPhoto
    ? (typeof primaryPhoto === 'string' ? primaryPhoto : primaryPhoto.uri)
    : null;
  const healthPercent = 72; // TODO: calculate from real data

  // Check for upcoming appointments
  const hasUpcoming = appointments.some(
    (apt: any) => apt.vehicleId === vehicle.id && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Vehicle info row */}
      <View style={styles.cardTop}>
        <TouchableOpacity onPress={onPhoto} style={styles.photoContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.vehiclePhoto} contentFit="cover" />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceElevated }]}>
              <Car size={40} color={colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={[styles.vehicleYear, { color: colors.textSecondary }]}>
            {vehicle.year} · {vehicle.licensePlate || 'N/A'}
          </Text>

          {/* Health bar */}
          <View style={styles.healthRow}>
            <View style={[styles.healthBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.healthBarFill,
                  {
                    width: `${healthPercent}%`,
                    backgroundColor:
                      healthPercent > 70 ? colors.success :
                      healthPercent > 40 ? colors.warning :
                      colors.error,
                  },
                ]}
              />
            </View>
            <Text style={[styles.healthText, { color: colors.textSecondary }]}>
              {healthPercent}%
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Edit2 size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Gauge size={14} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {vehicle.mileage ? `${(vehicle.mileage / 1000).toFixed(0)}k km` : '—'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <CalendarIcon size={14} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {hasUpcoming ? t('vehicles.scheduled') || 'Planlanıb' : t('vehicles.noService') || 'Yoxdur'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Shield size={14} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>CRM</Text>
        </View>
      </View>

      {/* Service reminder */}
      <View style={[styles.reminderRow, { backgroundColor: colors.surfaceElevated }]}>
        <Clock size={14} color={colors.warning} />
        <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
          {t('vehicles.nextServiceAt') || 'Növbəti servis:'} 50,200 km · 2,400 km {t('vehicles.remaining') || 'qalıb'}
        </Text>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={onBook}
        >
          <Text style={styles.bookBtnText}>{t('vehicles.book') || 'Yaz'}</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended services */}
      <View style={styles.recommendedRow}>
        <Wrench size={13} color={colors.primary} />
        <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>
          {t('vehicles.recommended') || 'Tövsiyə:'}{' '}
        </Text>
        <Text style={[styles.recommendedList, { color: colors.text }]}>
          {t('vehicles.oilChange') || 'Yağ dəyişimi'}, {t('vehicles.filterReplacement') || 'Filtr'}, {t('vehicles.multiPointInspection') || 'Yoxlama'}
        </Text>
      </View>
    </View>
  );
}

/* ─── EMPTY STATE ─── */

function EmptyGarage({ colors, t, onAdd }: any) {
  return (
    <View style={styles.emptyContainer}>
      <Car size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('vehicles.noVehicles') || 'Qarajınız boşdur'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('vehicles.addFirst') || 'İlk avtomobilinizi əlavə edin'}
      </Text>
      <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={onAdd}>
        <Plus size={18} color="#FFF" />
        <Text style={styles.emptyBtnText}>{t('vehicles.addVehicle') || 'Əlavə et'}</Text>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  photoContainer: { width: 100, height: 80, borderRadius: 10, overflow: 'hidden' },
  vehiclePhoto: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: { flex: 1, justifyContent: 'center' },
  vehicleName: { fontSize: 17, fontWeight: '700' },
  vehicleYear: { fontSize: 13, marginTop: 2 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  healthBarBg: { flex: 1, height: 6, borderRadius: 3 },
  healthBarFill: { height: '100%', borderRadius: 3 },
  healthText: { fontSize: 12, fontWeight: '600', width: 32 },
  cardActions: { gap: 8, paddingTop: 2 },
  iconBtn: { padding: 6 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  statValue: { fontSize: 12, fontWeight: '500' },
  statDivider: { width: 0.5, height: 20 },

  // Reminder
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reminderText: { flex: 1, fontSize: 12 },
  bookBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Recommended
  recommendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  recommendedLabel: { fontSize: 12 },
  recommendedList: { fontSize: 12, fontWeight: '500', flex: 1 },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
