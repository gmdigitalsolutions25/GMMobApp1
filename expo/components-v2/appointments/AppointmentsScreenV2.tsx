/**
 * AppointmentsScreenV2 — "Showroom Floor" Appointments
 *
 * Upcoming/Past tabs, appointment cards with status badges,
 * same booking logic, new premium look.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  MapPin,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import type { Appointment } from '@/constants/types';

type Tab = 'upcoming' | 'past';

export default function AppointmentsScreenV2() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appointments, theme, vehicles } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.date) >= now
  );
  const past = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || new Date(a.date) < now
  );

  const list = activeTab === 'upcoming' ? upcoming : past;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('appointments.title') || 'Randevular'}
        </Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/service-details')}
        >
          <Plus size={16} color="#FFF" />
          <Text style={styles.newBtnText}>{t('appointments.new') || 'Yeni'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'upcoming' ? colors.primary : colors.textTertiary }]}>
            {t('appointments.upcoming') || 'Gələcək'} ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'past' ? colors.primary : colors.textTertiary }]}>
            {t('appointments.past') || 'Keçmiş'} ({past.length})
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
        {list.length === 0 ? (
          <EmptyState tab={activeTab} colors={colors} t={t} />
        ) : (
          list.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              vehicle={vehicles.find((v) => v.id === apt.vehicleId)}
              colors={colors}
              t={t}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ─── APPOINTMENT CARD ─── */

function AppointmentCard({ appointment, vehicle, colors, t }: {
  appointment: Appointment; vehicle: any; colors: any; t: any;
}) {
  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: AlertCircle, color: colors.warning, label: t('appointments.pending') || 'Gözləyir' },
    confirmed: { icon: CheckCircle, color: colors.success, label: t('appointments.confirmed') || 'Təsdiqlənib' },
    completed: { icon: CheckCircle, color: colors.success, label: t('appointments.completed') || 'Tamamlanıb' },
    cancelled: { icon: XCircle, color: colors.error, label: t('appointments.cancelled') || 'Ləğv edilib' },
  };

  const status = statusConfig[appointment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const services = Array.isArray(appointment.serviceTypes) ? appointment.serviceTypes : [appointment.serviceTypes];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
        <StatusIcon size={14} color={status.color} />
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>

      {/* Date & time */}
      <View style={styles.dateRow}>
        <Calendar size={16} color={colors.primary} />
        <Text style={[styles.dateText, { color: colors.text }]}>
          {new Date(appointment.date).toLocaleDateString('az-AZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        {appointment.time && (
          <>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{appointment.time}</Text>
          </>
        )}
      </View>

      {/* Vehicle */}
      {vehicle && (
        <View style={styles.vehicleRow}>
          <Car size={14} color={colors.textSecondary} />
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
            {vehicle.brand} {vehicle.model}
          </Text>
        </View>
      )}

      {/* Service center */}
      {appointment.serviceCenter && (
        <View style={styles.vehicleRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]} numberOfLines={1}>
            {appointment.serviceCenter}
          </Text>
        </View>
      )}

      {/* Services */}
      <View style={styles.servicesRow}>
        {services.map((s: string, i: number) => (
          <View key={i} style={[styles.serviceChip, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.serviceChipText, { color: colors.primary }]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── EMPTY STATE ─── */

function EmptyState({ tab, colors, t }: { tab: Tab; colors: any; t: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Calendar size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {tab === 'upcoming'
          ? t('appointments.noUpcoming') || 'Gələcək randevunuz yoxdur'
          : t('appointments.noPast') || 'Keçmiş randevu yoxdur'}
      </Text>
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 14, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 15, fontWeight: '600' },
  timeText: { fontSize: 13 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleText: { fontSize: 13, flex: 1 },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceChipText: { fontSize: 12, fontWeight: '500' },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
});
