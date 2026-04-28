import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, Wrench, Car, Info, BellOff, CheckCheck } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import {
  getStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type StoredNotification,
} from '@/lib/notifications';

interface NotificationSetting {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

/**
 * Format a relative time string from an ISO date
 */
function formatRelativeTime(isoDate: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notifications.justNow');
  if (diffMin < 60) return t('notifications.minutesAgo', { count: diffMin });
  if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours });
  return t('notifications.daysAgo', { count: diffDays });
}

/**
 * Get the icon for a notification type
 */
function getNotificationIcon(type: StoredNotification['type'], color: string) {
  switch (type) {
    case 'appointment': return <Calendar size={18} color={color} />;
    case 'service': return <Wrench size={18} color={color} />;
    case 'vehicle': return <Car size={18} color={color} />;
    default: return <Bell size={18} color={color} />;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useApp();
  const { t } = useTranslation();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'appointment_reminders',
      icon: <Calendar size={22} color={colors.primary} />,
      title: t('notifications.appointmentReminders'),
      description: t('notifications.appointmentRemindersDesc'),
      enabled: true,
    },
    {
      id: 'service_due',
      icon: <Wrench size={22} color={colors.primary} />,
      title: t('notifications.serviceDueAlerts'),
      description: t('notifications.serviceDueAlertsDesc'),
      enabled: true,
    },
    {
      id: 'vehicle_updates',
      icon: <Car size={22} color={colors.primary} />,
      title: t('notifications.vehicleStatusUpdates'),
      description: t('notifications.vehicleStatusUpdatesDesc'),
      enabled: true,
    },
    {
      id: 'promotions',
      icon: <Info size={22} color={colors.primary} />,
      title: t('notifications.promotionsOffers'),
      description: t('notifications.promotionsOffersDesc'),
      enabled: true,
    },
    {
      id: 'general',
      icon: <Bell size={22} color={colors.primary} />,
      title: t('notifications.generalNotifications'),
      description: t('notifications.generalNotificationsDesc'),
      enabled: true,
    },
  ]);

  const loadNotifications = useCallback(async () => {
    const stored = await getStoredNotifications();
    setNotifications(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = async (notif: StoredNotification) => {
    // Mark as read
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }

    // Navigate based on type
    const data = notif.data;
    switch (notif.type) {
      case 'appointment':
        router.push('/(tabs)/appointments');
        break;
      case 'service':
        if (data?.serviceId) {
          router.push(`/service-details?id=${data.serviceId}`);
        } else {
          router.push('/(tabs)/home');
        }
        break;
      case 'vehicle':
        router.push('/(tabs)/home');
        break;
      default:
        // Stay on notifications screen — already here
        break;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications.title')}</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
            <CheckCheck size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications.recent')}</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={[styles.markAllText, { color: colors.primary }]}>
                  {t('notifications.markAllRead')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
          ) : notifications.length === 0 ? (
            /* Empty state */
            <View style={styles.emptyState}>
              <BellOff size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('notifications.noNotifications')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {t('notifications.noNotificationsDesc')}
              </Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.7}
                onPress={() => handleNotificationPress(notif)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: notif.read ? colors.surface : `${colors.primary}12`,
                    borderColor: notif.read ? colors.border : `${colors.primary}40`,
                  },
                ]}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                  {getNotificationIcon(notif.type, colors.primary)}
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text
                      style={[
                        styles.notifTitle,
                        { color: colors.text, fontWeight: notif.read ? '500' : '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    {!notif.read && (
                      <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                    {notif.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
                    {formatRelativeTime(notif.receivedAt, t)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications.notificationSettings')}</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {settings.map((setting, index) => (
              <View key={setting.id}>
                <View style={styles.settingRow}>
                  <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
                    {setting.icon}
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{setting.description}</Text>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.id)}
                    trackColor={{ false: colors.border, true: `${colors.primary}60` }}
                    thumbColor={setting.enabled ? colors.primary : colors.textTertiary}
                  />
                </View>
                {index < settings.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  markAllButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  scrollView: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  markAllText: { fontSize: 13, fontWeight: '600' },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  // Notification cards
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifContent: { flex: 1 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: { fontSize: 14, flex: 1 },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12 },
  // Settings
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 12, lineHeight: 16 },
  divider: { height: 1, marginLeft: 72 },
});
