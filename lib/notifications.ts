/**
 * Qaraj Push Notification Module
 *
 * Full implementation using expo-notifications.
 * Handles:
 *  - Permission requests
 *  - Expo Push Token registration
 *  - Local notification scheduling (appointment reminders, service due)
 *  - Notification channel setup (Android)
 *  - Push token persistence to backend
 *
 * Setup requirements (already added to app.json and package.json):
 *  - expo-notifications installed
 *  - expo-notifications plugin added to app.json
 *  - EAS push credentials configured: `eas credentials`
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ── Notification Handler ───────────────────────────────────────────────────────

/**
 * Configure how notifications are displayed when the app is in the foreground.
 * Call this once at app startup (e.g., in _layout.tsx).
 */
export function configureNotifications() {
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

// ── Android Channel Setup ──────────────────────────────────────────────────────

/**
 * Create Android notification channels.
 * Must be called before scheduling any notifications on Android.
 */
export async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('qaraj-default', {
    name: 'Qaraj Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F5C518',
    sound: 'notification.wav',
  });

  await Notifications.setNotificationChannelAsync('qaraj-appointments', {
    name: 'Appointment Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: '#F5C518',
    sound: 'notification.wav',
    description: 'Reminders for your upcoming service appointments',
  });

  await Notifications.setNotificationChannelAsync('qaraj-service', {
    name: 'Service Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F5C518',
    description: 'Alerts when your vehicle is due for maintenance',
  });
}

// ── Permission Request ─────────────────────────────────────────────────────────

export interface PermissionResult {
  granted: boolean;
  expoPushToken?: string;
  error?: string;
}

/**
 * Request push notification permissions and return the Expo Push Token.
 * Must be called on a physical device (not simulator) for push tokens.
 */
export async function requestNotificationPermissions(): Promise<PermissionResult> {
  if (!Device.isDevice) {
    console.warn('[Notifications] Push tokens only work on physical devices.');
    return { granted: false, error: 'Must use physical device for push notifications' };
  }

  // Set up Android channels first
  await setupAndroidChannels();

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, error: 'Notification permission denied by user' };
  }

  // Get Expo Push Token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'qaraj-app-project-id', // Replace with your EAS project ID
    });
    return { granted: true, expoPushToken: tokenData.data };
  } catch (error) {
    console.error('[Notifications] Failed to get push token:', error);
    return { granted: true, error: 'Failed to retrieve push token' };
  }
}

// ── Local Notification Scheduling ─────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

/**
 * Schedule a local notification at a specific date/time.
 * Returns the notification identifier, or null on failure.
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  triggerDate: Date
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: 'notification.wav',
        ...(Platform.OS === 'android' && {
          channelId: payload.channelId ?? 'qaraj-default',
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    console.log(`[Notifications] Scheduled "${payload.title}" for ${triggerDate.toISOString()} (id: ${id})`);
    return id;
  } catch (error) {
    console.error('[Notifications] Schedule failed:', error);
    return null;
  }
}

/**
 * Cancel a previously scheduled notification by its identifier.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notifications] Cancelled: ${notificationId}`);
  } catch (error) {
    console.error('[Notifications] Cancel failed:', error);
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all currently scheduled notifications.
 */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ── Appointment Reminders ──────────────────────────────────────────────────────

export interface AppointmentReminderInput {
  id: string;
  serviceType: string;
  serviceCenter: string;
  date: string;   // ISO date string or YYYY-MM-DD
  time: string;   // HH:MM
}

/**
 * Schedule two reminders for an appointment:
 *  - 24 hours before
 *  - 1 hour before
 *
 * Returns the notification IDs so they can be cancelled if the appointment is cancelled.
 */
export async function scheduleAppointmentReminders(
  appointment: AppointmentReminderInput
): Promise<{ reminder24hId: string | null; reminder1hId: string | null }> {
  // Parse appointment date+time
  const dateStr = appointment.date.includes('T')
    ? appointment.date.split('T')[0]
    : appointment.date;
  const appointmentDateTime = new Date(`${dateStr}T${appointment.time}:00`);

  if (isNaN(appointmentDateTime.getTime())) {
    console.warn('[Notifications] Invalid appointment date/time:', appointment.date, appointment.time);
    return { reminder24hId: null, reminder1hId: null };
  }

  const now = new Date();
  let reminder24hId: string | null = null;
  let reminder1hId: string | null = null;

  // 24-hour reminder
  const trigger24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
  if (trigger24h > now) {
    reminder24hId = await scheduleLocalNotification(
      {
        title: '📅 Appointment Tomorrow',
        body: `Your ${appointment.serviceType} at ${appointment.serviceCenter} is tomorrow at ${appointment.time}.`,
        data: { appointmentId: appointment.id, type: 'appointment_reminder_24h' },
        channelId: 'qaraj-appointments',
      },
      trigger24h
    );
  }

  // 1-hour reminder
  const trigger1h = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
  if (trigger1h > now) {
    reminder1hId = await scheduleLocalNotification(
      {
        title: '⏰ Appointment in 1 Hour',
        body: `Don't forget: ${appointment.serviceType} at ${appointment.serviceCenter} at ${appointment.time}.`,
        data: { appointmentId: appointment.id, type: 'appointment_reminder_1h' },
        channelId: 'qaraj-appointments',
      },
      trigger1h
    );
  }

  return { reminder24hId, reminder1hId };
}

// ── Service Due Reminders ──────────────────────────────────────────────────────

/**
 * Schedule a service due reminder 1 week before the predicted service date.
 */
export async function scheduleServiceDueReminder(vehicle: {
  brand: string;
  model: string;
  predictedDate: Date;
}): Promise<string | null> {
  const now = new Date();
  const reminderDate = new Date(vehicle.predictedDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (reminderDate <= now) {
    // Already past — send immediately as a local notification
    return scheduleLocalNotification(
      {
        title: '🔧 Service Due Soon',
        body: `Your ${vehicle.brand} ${vehicle.model} is due for service this week.`,
        data: { type: 'service_due_urgent' },
        channelId: 'qaraj-service',
      },
      new Date(Date.now() + 5000) // 5 seconds from now
    );
  }

  return scheduleLocalNotification(
    {
      title: '🔧 Service Due in 1 Week',
      body: `Your ${vehicle.brand} ${vehicle.model} is due for service in approximately 1 week.`,
      data: { type: 'service_due' },
      channelId: 'qaraj-service',
    },
    reminderDate
  );
}

// ── Push Token Registration ────────────────────────────────────────────────────

/**
 * Register the device's Expo Push Token with the backend.
 * Call this after the user signs in.
 */
export async function registerPushToken(
  userId: string,
  phone: string,
  backendUrl: string
): Promise<void> {
  try {
    const result = await requestNotificationPermissions();
    if (!result.granted || !result.expoPushToken) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    await fetch(`${backendUrl}/api/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        phone,
        token: result.expoPushToken,
        platform,
      }),
    });

    console.log(`[Notifications] Push token registered: ${result.expoPushToken}`);
  } catch (error) {
    console.error('[Notifications] Failed to register push token:', error);
  }
}
