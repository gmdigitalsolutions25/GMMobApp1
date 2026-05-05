/**
 * GmBadge — Green shield badge shown on Groupmotors-serviced vehicles
 *
 * Displays a small green pill with shield icon + "GM Servis" text.
 * On tap, shows a tooltip explaining the badge.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

const TOOLTIP_DURATION = 3000; // Auto-hide after 3 seconds
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GmBadgeProps {
  tooltipText?: string;
}

export default function GmBadge({
  tooltipText = 'Bu avtomobil Groupmotors servis şəbəkəsində qeydiyyatdadır. Tam diaqnostika və servis tarixçəsi mövcuddur.',
}: GmBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = () => {
    if (showTooltip) {
      hideTooltip();
      return;
    }
    setShowTooltip(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide after duration
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(hideTooltip, TOOLTIP_DURATION);
  };

  const hideTooltip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowTooltip(false));
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.badge}
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ShieldCheck size={12} color="#FFF" />
        <Text style={styles.badgeText}>GM Servis</Text>
      </TouchableOpacity>

      {showTooltip && (
        <Animated.View style={[styles.tooltip, { opacity: fadeAnim }]}>
          <Text style={styles.tooltipText}>{tooltipText}</Text>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a', // green-600
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tooltip: {
    position: 'absolute',
    top: 28,
    right: 0,
    width: Math.min(SCREEN_WIDTH - 80, 260),
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    color: '#e2e8f0', // slate-200
    fontSize: 12,
    lineHeight: 17,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -6,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1e293b',
  },
});
