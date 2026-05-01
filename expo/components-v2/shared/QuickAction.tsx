import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ColorsV2 } from '@/hooks/useDesignV2';
import type { LucideIcon } from 'lucide-react-native';

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  theme: 'dark' | 'light';
  onPress?: () => void;
}

export function QuickAction({ icon: Icon, label, theme, onPress }: QuickActionProps) {
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconCircle, { borderColor: colors.primary }]}>
        <Icon size={22} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
