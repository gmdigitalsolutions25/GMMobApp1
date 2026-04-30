/**
 * Qaraj GM — Root Layout
 *
 * Kill switch: Blocks app if build is older than 7 days.
 *
 * Auth routing logic:
 *   1. App starts → kill switch check (build expiry)
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
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { KillSwitchScreen, isAppExpired } from '@/components/KillSwitch';
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

    // Listener: user tapped on a notification
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
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

      // Step 1: Onboarding check
      if (!hasCompletedOnboarding) {
        router.replace('/welcome');
        return;
      }

      // Step 2: Check stored session
      const phone = await getPhone();
      const token = await getToken();

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
            if (!user.onboardingCompleted && !user.firstName) {
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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  // Kill switch — block everything if build is expired
  if (isAppExpired()) {
    return <KillSwitchScreen />;
  }

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
