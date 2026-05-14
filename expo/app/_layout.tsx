/**
 * Qaraj GM — Root Layout
 *
 * Auth routing logic:
 *   1. App starts
 *   2. Check SecureStore for JWT token + phone
 *   3. No token/phone → /auth (full flow: phone → OTP → PIN)
 *   4. Token exists, activity < 1h → straight to /(tabs)/home
 *   5. Token exists, activity 1h–7d → /pin-login (PIN or biometric)
 *   6. Token exists, activity > 30d → /auth (full re-auth)
 *   7. No onboarding completed → /welcome
 *
 * Notifications:
 *   - Configures notification handler on mount
 *   - Sets up Android channels
 *   - Listens for notification taps → navigates to relevant screen
 *   - Stores received notifications in AsyncStorage for the notifications screen
 */

import React, { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/constants/i18n';
import { AppProvider, useApp } from '@/providers/AppProvider';
import { AlertProvider } from '@/components/CustomAlert';
import { getRequiredAuthLevel, getPhone, getToken } from '@/lib/authStore';
import {
  configureNotifications,
  setupAndroidChannels,
  storeNotification,
  type StoredNotification,
} from '@/lib/notifications';

// ── Background notification task ──────────────────────────────────────────────
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
  if (error) {
    console.log('[Notifications] Background task error:', error);
    return;
  }
  // data contains { notification } when a push arrives in the background
  const notification = (data as any)?.notification;
  if (notification) {
    const { title, body, data: payload } = notification.request?.content || {};
    if (title) {
      const stored: StoredNotification = {
        id: notification.request?.identifier || `bg-${Date.now()}`,
        title: title || '',
        body: body || '',
        data: payload as Record<string, unknown>,
        type: getNotificationType(payload as Record<string, unknown>),
        read: false,
        receivedAt: new Date().toISOString(),
      };
      storeNotification(stored);
    }
  }
});

SplashScreen.preventAutoHideAsync();

// Configure notification display behavior (must be called outside component)
configureNotifications();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 1000 * 60 * 5 },
  },
});

/**
 * Map notification data.type to a StoredNotification type
 */
function getNotificationType(data?: Record<string, unknown>): StoredNotification['type'] {
  const t = data?.type as string | undefined;
  if (t === 'appointment') return 'appointment';
  if (t === 'service') return 'service';
  if (t === 'vehicle') return 'vehicle';
  return 'general';
}

function RootLayoutNav() {
  const router = useRouter();
  const { isLoading, hasCompletedOnboarding, user, defaultStartScreen } = useApp();
  const hasNavigated = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Notification listeners ──────────────────────────────────────────────

  useEffect(() => {
    // Set up Android notification channels
    setupAndroidChannels();

    // Listener: notification received while app is in foreground
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      if (title) {
        const stored: StoredNotification = {
          id: notification.request.identifier,
          title: title || '',
          body: body || '',
          data: data as Record<string, unknown>,
          type: getNotificationType(data as Record<string, unknown>),
          read: false,
          receivedAt: new Date().toISOString(),
        };
        storeNotification(stored);
      }
    });

    // Register background notification task
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((e) => {
      // May fail if already registered or on unsupported platform — non-fatal
      console.log('[Notifications] Background task registration:', (e as Error).message);
    });

    // Listener: user tapped on a notification
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Store the notification when tapped (covers background-received pushes)
      const { title, body, data: respData } = response.notification.request.content;
      if (title) {
        const stored: StoredNotification = {
          id: response.notification.request.identifier,
          title: title || '',
          body: body || '',
          data: respData as Record<string, unknown>,
          type: getNotificationType(respData as Record<string, unknown>),
          read: false,
          receivedAt: new Date().toISOString(),
        };
        storeNotification(stored);
      }

      const data = respData as Record<string, unknown> | undefined;
      if (!data) {
        router.push('/notifications');
        return;
      }

      const type = data.type as string | undefined;

      switch (type) {
        case 'appointment':
          // Navigate to appointments tab
          router.push('/(tabs)/appointments');
          break;
        case 'service':
          // Navigate to service details if we have an ID, otherwise home
          if (data.serviceId) {
            router.push(`/service-details?id=${data.serviceId}`);
          } else {
            router.push('/(tabs)/home');
          }
          break;
        case 'vehicle':
          router.push('/(tabs)/home');
          break;
        default:
          router.push('/notifications');
          break;
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);

  // ── Auth routing ────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;

    const checkAuth = async () => {
      hasNavigated.current = true;
      SplashScreen.hideAsync();

      // Step 1: Check stored session first (SecureStore persists across reinstalls)
      const phone = await getPhone();
      const token = await getToken();

      // Step 2: Onboarding check — only show welcome to truly new users
      if (!hasCompletedOnboarding) {
        if (phone && token) {
          // Returning user after reinstall — skip welcome, auto-complete onboarding flag
          // SecureStore persists across reinstalls, AsyncStorage does not
          const AsyncStorageMod = await import('@react-native-async-storage/async-storage');
          await AsyncStorageMod.default.setItem('@qaraj_onboarding', 'true');
        } else {
          // Truly new user — show welcome
          router.replace('/welcome');
          return;
        }
      }

      if (!phone || !token) {
        // No session — full auth flow
        router.replace('/auth');
        return;
      }

      // Step 3: Check activity level
      const authLevel = await getRequiredAuthLevel();

      switch (authLevel) {
        case 'none':
          // Fresh session — check if onboarding profile is complete
          if (user) {
            if (!user.firstName) {
              // No name = onboarding never finished, regardless of flag
              router.replace('/onboarding');
            } else {
              router.replace(`/(tabs)/${defaultStartScreen}`);
            }
          } else {
            // User data in AppProvider is stale — need PIN to refresh
            router.replace('/pin-login');
          }
          break;

        case 'pin':
          // Need PIN or biometric to unlock
          router.replace('/pin-login');
          break;

        case 'otp':
          // Session too old — full re-auth
          router.replace('/auth');
          break;
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isLoading, hasCompletedOnboarding, user, defaultStartScreen, router]);

  // ── Check if app was opened from a killed state via notification ─────────

  useEffect(() => {
    const checkLastNotification = async () => {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        const data = lastResponse.notification.request.content.data as Record<string, unknown> | undefined;
        // Store it so the notifications screen can display it
        const { title, body } = lastResponse.notification.request.content;
        if (title) {
          const stored: StoredNotification = {
            id: lastResponse.notification.request.identifier,
            title: title || '',
            body: body || '',
            data: data as Record<string, unknown>,
            type: getNotificationType(data as Record<string, unknown>),
            read: false,
            receivedAt: new Date().toISOString(),
          };
          storeNotification(stored);
        }
      }
    };
    checkLastNotification();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="pin-login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-vehicle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="service-details" />
      <Stack.Screen name="vehicle-photo" />
      <Stack.Screen name="health-detail" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <AlertProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </AlertProvider>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
