/**
 * Qaraj Notification Stub
 * Push notifications are disabled in this build.
 * All functions are no-ops that return safely.
 */

export function configureNotifications() {
  // no-op stub
}

export async function setupAndroidChannels() {
  // no-op stub
}

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export async function requestNotificationPermissions(): Promise<PermissionResult> {
  return { granted: false, error: 'Notifications not enabled in this build' };
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

export async function scheduleLocalNotification(
  _payload: NotificationPayload,
  _triggerDate: Date
): Promise<string | null> {
  return null;
}

export async function cancelNotification(_notificationId: string): Promise<void> {
  // no-op stub
}

export async function cancelAllNotifications(): Promise<void> {
  // no-op stub
}

export async function getScheduledNotifications() {
  return [];
}

export interface AppointmentReminderInput {
  id: string;
  serviceType: string;
  serviceCenter: string;
  date: string;
  time: string;
}

export async function scheduleAppointmentReminders(
  _appointment: AppointmentReminderInput
): Promise<{ reminder24hId: string | null; reminder1hId: string | null }> {
  return { reminder24hId: null, reminder1hId: null };
}

export async function scheduleServiceDueReminder(_vehicle: {
  brand: string;
  model: string;
  predictedDate: Date;
}): Promise<string | null> {
  return null;
}

export async function registerPushToken(
  _userId: string,
  _phone: string,
  _backendUrl: string
): Promise<void> {
  // no-op stub
}
