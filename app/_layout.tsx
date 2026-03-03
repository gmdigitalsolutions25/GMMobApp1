import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { trpc, trpcClient } from "@/lib/trpc";
import { configureNotifications, setupAndroidChannels } from "@/lib/notifications";
import '@/constants/i18n';

// Prevent the splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

// Configure notification display behavior at module load
try {
  configureNotifications();
} catch (e) {
  console.warn('[Layout] configureNotifications failed:', e);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const { isLoading, hasCompletedOnboarding, user, defaultStartScreen } = useApp();
  const notificationListenerRef = useRef<any>(null);
  const responseListenerRef = useRef<any>(null);
  const hasNavigated = useRef(false);

  // Hide splash screen and navigate once app state is loaded
  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Hide splash screen first
    SplashScreen.hideAsync().catch(() => {});

    // Then navigate to the correct screen
    const navigate = () => {
      if (!hasCompletedOnboarding) {
        router.replace('/welcome');
      } else if (!user) {
        router.replace('/auth');
      } else {
        router.replace(`/(tabs)/${defaultStartScreen}`);
      }
    };

    // Small delay to ensure router is ready
    const timer = setTimeout(navigate, 100);
    return () => clearTimeout(timer);
  }, [isLoading, hasCompletedOnboarding, user, defaultStartScreen, router]);

  // Set up notification listeners
  useEffect(() => {
    setupAndroidChannels().catch((e) =>
      console.warn('[Layout] setupAndroidChannels failed:', e)
    );

    let Notifications: any;
    try {
      Notifications = require('expo-notifications');
    } catch {
      return;
    }

    try {
      notificationListenerRef.current = Notifications.addNotificationReceivedListener(
        (notification: any) => {
          console.log('[Notifications] Received:', notification?.request?.content?.title);
        }
      );

      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          try {
            const data = response?.notification?.request?.content?.data as Record<string, unknown>;
            const type = data?.type as string | undefined;

            if (type === 'appointment_reminder_24h' || type === 'appointment_reminder_1h') {
              router.push('/(tabs)/appointments');
            } else if (type === 'service_due' || type === 'service_due_urgent') {
              router.push('/(tabs)/vehicles');
            } else {
              router.push('/notifications');
            }
          } catch (e) {
            console.warn('[Notifications] Response handler error:', e);
          }
        }
      );
    } catch (e) {
      console.warn('[Layout] Notification listener setup failed:', e);
    }

    return () => {
      try {
        notificationListenerRef.current?.remove();
        responseListenerRef.current?.remove();
      } catch {}
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-vehicle" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
