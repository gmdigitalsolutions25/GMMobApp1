import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, Wrench, Car, Info } from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useTranslation } from 'react-i18next';

interface NotificationSetting {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useApp();
  const { t } = useTranslation();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

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
      enabled: false,
    },
    {
      id: 'general',
      icon: <Bell size={22} color={colors.primary} />,
      title: t('notifications.generalNotifications'),
      description: t('notifications.generalNotificationsDesc'),
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Sample recent notifications
  const recentNotifications = [
    {
      id: '1',
      title: t('notifications.appointmentConfirmed'),
      message: t('notifications.appointmentConfirmedMsg'),
      time: t('notifications.twoHoursAgo'),
      read: false,
      type: 'appointment',
    },
    {
      id: '2',
      title: t('notifications.serviceDueSoon'),
      message: t('notifications.serviceDueSoonMsg'),
      time: t('notifications.oneDayAgo'),
      read: true,
      type: 'service',
    },
    {
      id: '3',
      title: t('notifications.welcomeToQaraj'),
      message: t('notifications.welcomeToQarajMsg'),
      time: t('notifications.threeDaysAgo'),
      read: true,
      type: 'general',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('notifications.recent')}</Text>
          {recentNotifications.map((notif) => (
            <View
              key={notif.id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: notif.read ? colors.surface : `${colors.primary}12`,
                  borderColor: notif.read ? colors.border : `${colors.primary}40`,
                },
              ]}
            >
              <View style={[styles.notifDot, { backgroundColor: notif.read ? 'transparent' : colors.primary }]} />
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>
                <Text style={[styles.notifTime, { color: colors.textTertiary }]}>{notif.time}</Text>
              </View>
            </View>
          ))}
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
  scrollView: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12 },
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
