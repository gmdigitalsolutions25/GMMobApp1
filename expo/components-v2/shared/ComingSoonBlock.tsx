import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ColorsV2 } from '@/hooks/useDesignV2';

interface ComingSoonBlockProps {
  title: string;
  imageUri: string;
  theme: 'dark' | 'light';
  onPress?: () => void;
}

export function ComingSoonBlock({ title, imageUri, theme, onPress }: ComingSoonBlockProps) {
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.8}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.image}
        imageStyle={styles.imageInner}
      >
        {/* Muted overlay */}
        <View style={[styles.overlay, {
          backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)',
        }]} />

        {/* Tezliklə ribbon */}
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>Tezliklə</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
          <View style={styles.badgeRow}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.badge, { color: colors.textSecondary }]}>Tezliklə</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  image: {
    height: 140,
    justifyContent: 'flex-end',
  },
  imageInner: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  ribbon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F24141',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  badge: {
    fontSize: 11,
  },
});
