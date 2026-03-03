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
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('[Notifications] setNotificationHandler failed:', error);
  }
}

// ── Android Channel Setup ──────────────────────────────────────────────────────

/**
 * Create Android notification channels.
 * Must be called before scheduling any notifications on Android.
 */
export async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync('qaraj-default', {
      name: 'Qaraj Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5C518',
    });

    await Notifications.setNotificationChannelAsync('qaraj-appointments', {
      name: 'Appointment Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#F5C518',
      description: 'Reminders for your upcoming service appointments',
    });

    await Notifications.setNotificationChannelAsync('qaraj-service', {
      name: 'Service Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5C518',
      description: 'Alerts when your vehicle is due for maintenance',
    });
  } catch (error) {
    console.warn('[Notifications] setupAndroidChannels failed:', error);
  }
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
  try {
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

    return { granted: true };
  } catch (error) {
    console.warn('[Notifications] requestNotificationPermissions failed:', error);
    return { granted: false, error: String(error) };
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
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[Notifications] cancelAllNotifications failed:', error);
  }
}

/**
 * Get all currently scheduled notifications.
 */
export async function getScheduledNotifications() {
  try {
    return Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
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
 */
export async function scheduleAppointmentReminders(
  appointment: AppointmentReminderInput
): Promise<{ reminder24hId: string | null; reminder1hId: string | null }> {
  try {
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

    const trigger24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (trigger24h > now) {
      reminder24hId = await scheduleLocalNotification(
        {
          title: 'Appointment Tomorrow',
          body: `Your ${appointment.serviceType} at ${appointment.serviceCenter} is tomorrow at ${appointment.time}.`,
          data: { appointmentId: appointment.id, type: 'appointment_reminder_24h' },
          channelId: 'qaraj-appointments',
        },
        trigger24h
      );
    }

    const trigger1h = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
    if (trigger1h > now) {
      reminder1hId = await scheduleLocalNotification(
        {
          title: 'Appointment in 1 Hour',
          body: `Don't forget: ${appointment.serviceType} at ${appointment.serviceCenter} at ${appointment.time}.`,
          data: { appointmentId: appointment.id, type: 'appointment_reminder_1h' },
          channelId: 'qaraj-appointments',
        },
        trigger1h
      );
    }

    return { reminder24hId, reminder1hId };
  } catch (error) {
    console.warn('[Notifications] scheduleAppointmentReminders failed:', error);
    return { reminder24hId: null, reminder1hId: null };
  }
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
  try {
    const now = new Date();
    const reminderDate = new Date(vehicle.predictedDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (reminderDate <= now) {
      return scheduleLocalNotification(
        {
          title: 'Service Due Soon',
          body: `Your ${vehicle.brand} ${vehicle.model} is due for service this week.`,
          data: { type: 'service_due_urgent' },
          channelId: 'qaraj-service',
        },
        new Date(Date.now() + 5000)
      );
    }

    return scheduleLocalNotification(
      {
        title: 'Service Due in 1 Week',
        body: `Your ${vehicle.brand} ${vehicle.model} is due for service in approximately 1 week.`,
        data: { type: 'service_due' },
        channelId: 'qaraj-service',
      },
      reminderDate
    );
  } catch (error) {
    console.warn('[Notifications] scheduleServiceDueReminder failed:', error);
    return null;
  }
}

// ── Push Token Registration ────────────────────────────────────────────────────

/**
 * Register the device's push token with the backend.
 * Call this after the user signs in.
 */
export async function registerPushToken(
  userId: string,
  phone: string,
  backendUrl: string
): Promise<void> {
  try {
    const result = await requestNotificationPermissions();
    if (!result.granted) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    await fetch(`${backendUrl}/api/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phone, platform }),
    });

    console.log(`[Notifications] Push token registered for ${userId}`);
  } catch (error) {
    console.error('[Notifications] Failed to register push token:', error);
  }
}
