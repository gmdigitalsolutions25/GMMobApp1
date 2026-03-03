import React, { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/constants/i18n';
import { AppProvider, useApp } from '@/providers/AppProvider';

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

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    SplashScreen.hideAsync();

    const navigate = () => {
      if (!hasCompletedOnboarding) {
        router.replace('/welcome');
      } else if (!user) {
        router.replace('/auth');
      } else {
        router.replace(`/(tabs)/${defaultStartScreen}`);
      }
    };

    const timer = setTimeout(navigate, 100);
    return () => clearTimeout(timer);
  }, [isLoading, hasCompletedOnboarding, user, defaultStartScreen, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
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
