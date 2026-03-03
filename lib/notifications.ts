/**
 * Qaraj Push Notification Utility
 *
 * This module provides a scaffolded push notification system using Expo Notifications.
 * To fully enable push notifications in production:
 *  1. Run: bun add expo-notifications
 *  2. Add "expo-notifications" to app.json plugins
 *  3. Configure EAS Push credentials: eas credentials
 *  4. Replace the mock implementations below with real Expo Notifications calls
 *
 * Reference: https://docs.expo.dev/push-notifications/overview/
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Request push notification permissions from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // In production with expo-notifications installed:
    // const { status } = await Notifications.requestPermissionsAsync();
    // return status === 'granted';

    console.log('[Notifications] Permission requested (scaffolded)');
    return true;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
}

/**
 * Schedule a local notification at a specific date/time.
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  triggerDate: Date
): Promise<string | null> {
  try {
    // In production with expo-notifications installed:
    // const id = await Notifications.scheduleNotificationAsync({
    //   content: { title: payload.title, body: payload.body, data: payload.data },
    //   trigger: { date: triggerDate },
    // });
    // return id;

    const id = `notif-${Date.now()}`;
    console.log(`[Notifications] Scheduled "${payload.title}" for ${triggerDate.toISOString()} (id: ${id})`);
    return id;
  } catch (error) {
    console.error('[Notifications] Schedule failed:', error);
    return null;
  }
}

/**
 * Cancel a previously scheduled notification by ID.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    // In production: await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notifications] Cancelled notification: ${notificationId}`);
  } catch (error) {
    console.error('[Notifications] Cancel failed:', error);
  }
}

/**
 * Schedule appointment reminder notifications.
 * Sends reminders 24 hours and 1 hour before the appointment.
 */
export async function scheduleAppointmentReminders(appointment: {
  id: string;
  serviceType: string;
  serviceCenter: string;
  date: string;
  time: string;
}): Promise<void> {
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

  if (isNaN(appointmentDateTime.getTime())) {
    console.warn('[Notifications] Invalid appointment date/time');
    return;
  }

  const now = new Date();

  // 24-hour reminder
  const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
  if (reminder24h > now) {
    await scheduleLocalNotification(
      {
        title: '📅 Appointment Tomorrow',
        body: `Your ${appointment.serviceType} at ${appointment.serviceCenter} is tomorrow at ${appointment.time}.`,
        data: { appointmentId: appointment.id, type: 'appointment_reminder' },
      },
      reminder24h
    );
  }

  // 1-hour reminder
  const reminder1h = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
  if (reminder1h > now) {
    await scheduleLocalNotification(
      {
        title: '⏰ Appointment in 1 Hour',
        body: `Don't forget: ${appointment.serviceType} at ${appointment.serviceCenter} at ${appointment.time}.`,
        data: { appointmentId: appointment.id, type: 'appointment_reminder_1h' },
      },
      reminder1h
    );
  }
}

/**
 * Schedule a service due reminder based on mileage prediction.
 */
export async function scheduleServiceDueReminder(vehicle: {
  brand: string;
  model: string;
  predictedDate: Date;
}): Promise<void> {
  const now = new Date();
  const reminderDate = new Date(vehicle.predictedDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before

  if (reminderDate > now) {
    await scheduleLocalNotification(
      {
        title: '🔧 Service Due Soon',
        body: `Your ${vehicle.brand} ${vehicle.model} is due for service in approximately 1 week.`,
        data: { type: 'service_due' },
      },
      reminderDate
    );
  }
}
