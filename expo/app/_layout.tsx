/**
 * Qaraj GM — Root Layout
 *
 * Auth routing logic:
 *   1. App starts → check SecureStore for JWT token + phone
 *   2. No token/phone → /auth (full flow: phone → OTP → PIN)
 *   3. Token exists, activity < 24h → straight to /(tabs)/home
 *   4. Token exists, activity 24h–7d → /pin-login (PIN or biometric)
 *   5. Token exists, activity > 30d → /auth (full re-auth)
 *   6. No onboarding completed → /welcome
 */

import React, { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/constants/i18n';
import { AppProvider, useApp } from '@/providers/AppProvider';
import { getRequiredAuthLevel, getPhone, getToken } from '@/lib/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 1000 * 60 * 5 },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const { isLoading, hasCompletedOnboarding, user, defaultStartScreen } = useApp();
  const hasNavigated = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);

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
          // Fresh session — go straight to home
          if (user) {
            router.replace(`/(tabs)/${defaultStartScreen}`);
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="pin-login" />
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
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
