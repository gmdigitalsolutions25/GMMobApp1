import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { trpc, trpcClient } from "@/lib/trpc";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { installGlobalErrorHandlers } from "@/lib/errorHandler";
import '@/constants/i18n';

// Install global error handlers FIRST — before anything else runs
// This ensures all crashes are captured and shown on screen
try {
  installGlobalErrorHandlers();
} catch (e) {
  // Silently ignore if handler installation fails
}

// Prevent the splash screen from auto-hiding before app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

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
    const timer = setTimeout(navigate, 150);
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
      <Stack.Screen name="error-log" options={{ headerShown: false }} />
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
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
