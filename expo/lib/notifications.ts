/**
 * Qaraj GM — Notifications Library
 *
 * Full expo-notifications integration:
 *   - Android notification channels (appointment, service, general)
 *   - Permission request + push token registration
 *   - Local notification scheduling (appointment reminders, service due)
 *   - Notification storage in AsyncStorage for the notifications screen
 *   - Push token registration with backend
 *
 * Push notifications (FCM) will activate once google-services.json is added.
 * Until then, local notifications and Expo Push Tokens work on physical devices.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type: 'appointment' | 'service' | 'vehicle' | 'general';
  read: boolean;
  receivedAt: string; // ISO string
}

export interface AppointmentReminderInput {
  id: string;
  serviceType: string;
  serviceCenter: string;
  date: string;
  time: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATIONS_STORAGE_KEY = '@qaraj_notifications';
const MAX_STORED_NOTIFICATIONS = 50;

// ── Configure notification behavior ──────────────────────────────────────────

export function configureNotifications() {
  // How to handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ── Android Channels ─────────────────────────────────────────────────────────

export async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('appointments', {
    name: 'Appointment Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00D4AA',
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
  });

  await Notifications.setNotificationChannelAsync('service', {
    name: 'Service Alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#00D4AA',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('general', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

// ── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<PermissionResult> {
  // Notifications only work on physical devices
  if (!Device.isDevice) {
    return { granted: false, error: 'Notifications require a physical device' };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return { granted: true };
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    return { granted: true };
  }

  return { granted: false, error: 'Notification permission denied' };
}

// ── Push Token ───────────────────────────────────────────────────────────────

/**
 * Get the Expo Push Token for this device.
 * Returns null if not available (emulator, no permissions, no projectId).
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  try {
    // Request permission if not already granted (handles race conditions)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted, cannot get push token');
      return null;
    }

    // Explicitly pass projectId from app.json extra config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.log('[Notifications] No projectId found in app config');
    }
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || '76b96668-e97c-4609-a448-d655ae30ec2d',
    });
    console.log('[Notifications] Got push token:', tokenData.data);
    return tokenData.data;
  } catch (e) {
    console.log('[Notifications] Could not get push token:', (e as Error).message);
    return null;
  }
}

/**
 * Register push token with the backend.
 * Call after successful login + permission grant.
 */
export async function registerPushToken(
  userId: string,
  phone: string,
  backendUrl: string
): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) {
    console.log('[Notifications] No push token available — skipping registration');
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/api/trpc/pushTokens.register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_API_KEY || 'qaraj-dev-key-2026',
      },
      body: JSON.stringify({
        json: {
          phone,
          token,
          platform: Platform.OS as 'ios' | 'android',
        },
      }),
    });

    const result = await response.json();
    console.log('[Notifications] Push token registered:', result);
  } catch (e) {
    console.error('[Notifications] Failed to register push token:', (e as Error).message);
  }
}

// ── Local Notification Scheduling ────────────────────────────────────────────

export async function scheduleLocalNotification(
  payload: NotificationPayload,
  triggerDate: Date
): Promise<string | null> {
  const now = new Date();
  const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

  if (secondsUntilTrigger <= 0) {
    console.log('[Notifications] Trigger date is in the past — skipping');
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
        ...(Platform.OS === 'android' && payload.channelId
          ? { channelId: payload.channelId }
          : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
        repeats: false,
      },
    });

    console.log(`[Notifications] Scheduled: ${payload.title} in ${secondsUntilTrigger}s (id: ${id})`);
    return id;
  } catch (e) {
    console.error('[Notifications] Failed to schedule:', (e as Error).message);
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('[Notifications] Failed to cancel:', (e as Error).message);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ── Appointment Reminders ────────────────────────────────────────────────────

export async function scheduleAppointmentReminders(
  appointment: AppointmentReminderInput
): Promise<{ reminder24hId: string | null; reminder1hId: string | null }> {
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);

  // 24-hour reminder
  const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  const reminder24hId = await scheduleLocalNotification(
    {
      title: 'Appointment Tomorrow',
      body: `${appointment.serviceType} at ${appointment.serviceCenter} — ${appointment.date} ${appointment.time}`,
      data: { type: 'appointment', appointmentId: appointment.id },
      channelId: 'appointments',
    },
    reminder24h
  );

  // 1-hour reminder
  const reminder1h = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
  const reminder1hId = await scheduleLocalNotification(
    {
      title: 'Appointment in 1 Hour',
      body: `${appointment.serviceType} at ${appointment.serviceCenter}`,
      data: { type: 'appointment', appointmentId: appointment.id },
      channelId: 'appointments',
    },
    reminder1h
  );

  return { reminder24hId, reminder1hId };
}

// ── Service Due Reminder ─────────────────────────────────────────────────────

export async function scheduleServiceDueReminder(vehicle: {
  brand: string;
  model: string;
  predictedDate: Date;
}): Promise<string | null> {
  // Remind 3 days before predicted service date
  const reminderDate = new Date(vehicle.predictedDate.getTime() - 3 * 24 * 60 * 60 * 1000);

  return scheduleLocalNotification(
    {
      title: 'Service Due Soon',
      body: `Your ${vehicle.brand} ${vehicle.model} is due for service in 3 days.`,
      data: { type: 'service', brand: vehicle.brand, model: vehicle.model },
      channelId: 'service',
    },
    reminderDate
  );
}

// ── Notification Storage (for notifications screen) ──────────────────────────

export async function storeNotification(notification: StoredNotification): Promise<void> {
  try {
    const existing = await getStoredNotifications();
    const updated = [notification, ...existing].slice(0, MAX_STORED_NOTIFICATIONS);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[Notifications] Failed to store notification:', (e as Error).message);
  }
}

export async function getStoredNotifications(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredNotification[];
  } catch (e) {
    console.error('[Notifications] Failed to read stored notifications:', (e as Error).message);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const notifications = await getStoredNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[Notifications] Failed to mark as read:', (e as Error).message);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const notifications = await getStoredNotifications();
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[Notifications] Failed to mark all as read:', (e as Error).message);
  }
}

export async function getUnreadCount(): Promise<number> {
  const notifications = await getStoredNotifications();
  return notifications.filter((n) => !n.read).length;
}

export async function clearAllStoredNotifications(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
}
