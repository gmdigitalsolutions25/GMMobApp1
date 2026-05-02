/**
 * Qaraj GM — Kill Switch (Dev/Testing Phase)
 *
 * Each APK has a hardcoded build timestamp. If the current date exceeds
 * BUILD_DATE + 7 days, the app shows an "Update Required" screen and
 * blocks all functionality.
 *
 * This is a client-side safety measure for the testing phase to ensure
 * testers always use the latest build. Remove or replace with a
 * server-side version check for production.
 *
 * BUILD_DATE is injected at build time via EXPO_PUBLIC_BUILD_DATE env var.
 * If not set, falls back to a hardcoded date that should be updated
 * with each release.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Build date injected at build time, or fallback to current hardcoded date
const BUILD_DATE = process.env.EXPO_PUBLIC_BUILD_DATE || '2026-05-02';
const KILL_AFTER_DAYS = 7;

function getDaysRemaining(): number {
  const buildTime = new Date(BUILD_DATE).getTime();
  const now = Date.now();
  const elapsed = now - buildTime;
  const remaining = KILL_AFTER_DAYS - Math.floor(elapsed / (1000 * 60 * 60 * 24));
  return remaining;
}

export function isAppExpired(): boolean {
  return getDaysRemaining() <= 0;
}

export function daysUntilExpiry(): number {
  return Math.max(0, getDaysRemaining());
}

interface KillSwitchScreenProps {
  buildDate?: string;
}

export function KillSwitchScreen({ buildDate }: KillSwitchScreenProps) {
  const displayDate = buildDate || BUILD_DATE;

  // Hide the native splash so the kill switch screen is visible
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Update Required</Text>
      <Text style={styles.message}>
        This build has expired.{'\n'}
        Built on: {displayDate}{'\n'}
        Valid for: {KILL_AFTER_DAYS} days
      </Text>
      <Text style={styles.submessage}>
        Please install the latest version to continue using Qaraj GM.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // In the future, link to Play Store or direct APK download
          Linking.openURL('https://github.com/Elnur004GH/Qaraj-GM/actions');
        }}
      >
        <Text style={styles.buttonText}>Get Latest Version</Text>
      </TouchableOpacity>
      <Text style={styles.version}>
        Build: {displayDate} | Kill switch: {KILL_AFTER_DAYS}d
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  submessage: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
});
