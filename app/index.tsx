/**
 * Loading screen shown while AppProvider initializes state from AsyncStorage.
 * Navigation to the correct screen is handled in _layout.tsx (RootLayoutNav).
 *
 * HIDDEN DEBUG FEATURE: Tap the spinner 5 times quickly to open the Error Log viewer.
 * This allows diagnosing crashes without USB or external tools.
 */
import React, { useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      try {
        router.push('/error-log');
      } catch {}
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1500);
  }, [router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleTap} activeOpacity={1} style={styles.tapArea}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.hint}>Tap 5× for debug log</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  tapArea: {
    alignItems: 'center',
    padding: 40,
  },
  hint: {
    color: '#333',
    fontSize: 10,
    marginTop: 12,
  },
});
