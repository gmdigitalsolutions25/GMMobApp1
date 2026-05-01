import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ColorsV2 } from '@/hooks/useDesignV2';

interface StatCardProps {
  value: string;
  label: string;
  theme: 'dark' | 'light';
  onPress?: () => void;
}

export function StatCard({ value, label, theme, onPress }: StatCardProps) {
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} style={styles.wrapper}>{content}</TouchableOpacity>;
  }
  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
