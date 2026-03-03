/**
 * Root layout with DOS-style boot log.
 * Every initialization step is logged to screen in real time.
 * If the app freezes, the last visible line shows exactly where it crashed.
 */

// ── STEP 1: Boot log infrastructure (no dependencies, always works) ──────────
import { bootLog, getBootEntries, subscribeBootLog } from '@/lib/bootLog';
bootLog('Boot log initialized', 'ok');

// ── STEP 2: React (core, must work) ──────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
bootLog('React loaded', 'ok');

// ── STEP 3: React Native core ─────────────────────────────────────────────────
import { View } from 'react-native';
bootLog('React Native core loaded', 'ok');

// ── STEP 4: BootLog UI component ─────────────────────────────────────────────
import { BootLog } from '@/components/BootLog';
bootLog('BootLog UI component loaded', 'ok');

// ── STEP 5: expo-splash-screen ────────────────────────────────────────────────
import * as SplashScreen from 'expo-splash-screen';
bootLog('expo-splash-screen loaded', 'ok');

try {
  SplashScreen.preventAutoHideAsync();
  bootLog('SplashScreen.preventAutoHideAsync() called', 'ok');
} catch (e: any) {
  bootLog('SplashScreen.preventAutoHideAsync() failed: ' + e?.message, 'warn');
}

// ── STEP 6: expo-router ───────────────────────────────────────────────────────
import { Stack, useRouter } from 'expo-router';
bootLog('expo-router loaded', 'ok');

// ── STEP 7: react-native-gesture-handler ─────────────────────────────────────
import { GestureHandlerRootView } from 'react-native-gesture-handler';
bootLog('react-native-gesture-handler loaded', 'ok');

// ── STEP 8: TanStack Query ────────────────────────────────────────────────────
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
bootLog('@tanstack/react-query loaded', 'ok');

// ── STEP 9: tRPC client ───────────────────────────────────────────────────────
import { trpc, trpcClient } from '@/lib/trpc';
bootLog('tRPC client loaded', 'ok');

// ── STEP 10: Error boundary ───────────────────────────────────────────────────
import { ErrorBoundary } from '@/components/ErrorBoundary';
bootLog('ErrorBoundary loaded', 'ok');

// ── STEP 11: i18n ─────────────────────────────────────────────────────────────
try {
  require('@/constants/i18n');
  bootLog('i18n loaded', 'ok');
} catch (e: any) {
  bootLog('i18n FAILED: ' + e?.message, 'fail');
}

// ── STEP 12: AppProvider ──────────────────────────────────────────────────────
import { AppProvider, useApp } from '@/providers/AppProvider';
bootLog('AppProvider loaded', 'ok');

// ── STEP 13: QueryClient instance ─────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 1000 * 60 * 5 },
  },
});
bootLog('QueryClient created', 'ok');

// ── Boot log display component ────────────────────────────────────────────────
function BootLogScreen() {
  const [entries, setEntries] = useState(getBootEntries());

  useEffect(() => {
    const unsub = subscribeBootLog(() => {
      setEntries([...getBootEntries()]);
    });
    // Show boot log by hiding splash screen
    SplashScreen.hideAsync().catch(() => {});
    return unsub;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <BootLog entries={entries} done={false} />
    </View>
  );
}

// ── Navigation component (runs after all providers are ready) ─────────────────
function RootLayoutNav() {
  const router = useRouter();
  const { isLoading, hasCompletedOnboarding, user, defaultStartScreen } = useApp();
  const hasNavigated = useRef(false);

  bootLog('RootLayoutNav rendered, isLoading=' + isLoading, 'info');

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    bootLog('App state loaded, navigating...', 'ok');
    SplashScreen.hideAsync().catch(() => {});

    const navigate = () => {
      try {
        if (!hasCompletedOnboarding) {
          bootLog('Navigating to /welcome', 'info');
          router.replace('/welcome');
        } else if (!user) {
          bootLog('Navigating to /auth', 'info');
          router.replace('/auth');
        } else {
          bootLog('Navigating to /(tabs)/' + defaultStartScreen, 'info');
          router.replace(`/(tabs)/${defaultStartScreen}`);
        }
      } catch (e: any) {
        bootLog('Navigation failed: ' + e?.message, 'fail');
      }
    };

    const timer = setTimeout(navigate, 300);
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

// ── Root layout ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  bootLog('RootLayout rendering...', 'info');

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
