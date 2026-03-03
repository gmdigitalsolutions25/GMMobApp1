/**
 * DOS-style boot log screen.
 * Shows every initialization step in real time, like an old computer booting.
 * Persists on screen even if the app crashes, so the last visible line
 * tells us exactly where the crash happened.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

export interface BootLogEntry {
  text: string;
  status: 'ok' | 'fail' | 'warn' | 'info' | 'running';
}

interface BootLogProps {
  entries: BootLogEntry[];
  done: boolean;
}

const STATUS_COLORS: Record<BootLogEntry['status'], string> = {
  ok: '#00FF41',
  fail: '#FF3333',
  warn: '#FFD700',
  info: '#00BFFF',
  running: '#AAAAAA',
};

const STATUS_LABELS: Record<BootLogEntry['status'], string> = {
  ok: '[ OK ]',
  fail: '[FAIL]',
  warn: '[WARN]',
  info: '[INFO]',
  running: '[ .. ]',
};

export function BootLog({ entries, done }: BootLogProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom as new entries arrive
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, [entries.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {'QARAJ AUTOMOTIVE v1.0.0 - Android Boot Log\n'}
        {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'}
        {`Platform: ${Platform.OS} ${Platform.Version}`}
      </Text>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {entries.map((entry, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.status, { color: STATUS_COLORS[entry.status] }]}>
              {STATUS_LABELS[entry.status]}
            </Text>
            <Text style={styles.text}> {entry.text}</Text>
          </View>
        ))}
        {!done && (
          <View style={styles.row}>
            <Text style={[styles.status, { color: '#AAAAAA' }]}>{'[ .. ]'}</Text>
            <Text style={styles.text}> Waiting...</Text>
          </View>
        )}
        {done && (
          <Text style={[styles.text, { color: '#00FF41', marginTop: 8 }]}>
            {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'}
            {'Boot sequence complete. Starting app...'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 12,
    paddingTop: 48,
  },
  header: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
    fontSize: 11,
    color: '#00FF41',
    marginBottom: 8,
    lineHeight: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  status: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
    fontSize: 11,
    lineHeight: 18,
    minWidth: 56,
  },
  text: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 18,
    flex: 1,
  },
});
