/**
 * Error Log Viewer Screen
 *
 * Shows all captured errors from the global error handler.
 * Navigate here manually or via the hidden tap gesture on the loading screen.
 * Useful for diagnosing crashes without USB or external tools.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getErrorLogText } from '@/lib/errorHandler';

export default function ErrorLogScreen() {
  const router = useRouter();
  const logText = getErrorLogText();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Qaraj Error Log\n\n${logText}`,
        title: 'Qaraj Error Log',
      });
    } catch (e) {
      Alert.alert('Share failed', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Error Log</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.logText} selectable>
          {logText}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backBtn: { padding: 4 },
  backText: { color: '#F5C518', fontSize: 15 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  shareBtn: { padding: 4 },
  shareText: { color: '#F5C518', fontSize: 15 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  logText: {
    color: '#ddd',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
