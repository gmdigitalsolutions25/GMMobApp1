/**
 * GmBadge — Green shield badge shown on Groupmotors-serviced vehicles
 *
 * Displays a small green pill with shield icon + "GM Servis" text.
 * On tap, shows a tooltip explaining the badge.
 *
 * NOTE: The tooltip uses a Portal-like approach (rendered outside the
 * overflow:hidden hero container) via React Native's Modal to avoid clipping.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

const TOOLTIP_DURATION = 4000; // Auto-hide after 4 seconds
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GmBadgeProps {
  tooltipText?: string;
}

export default function GmBadge({
  tooltipText = 'Bu avtomobil Groupmotors servis şəbəkəsində qeydiyyatdadır. Tam diaqnostika və servis tarixçəsi mövcuddur.',
}: GmBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [badgeLayout, setBadgeLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const badgeRef = useRef<View>(null);

  const measureBadge = useCallback(() => {
    badgeRef.current?.measureInWindow((x, y, width, height) => {
      setBadgeLayout({ x, y, width, height });
    });
  }, []);

  const handlePress = () => {
    if (showTooltip) {
      hideTooltip();
      return;
    }
    measureBadge();
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

  // Position tooltip below the badge, aligned to left edge
  const tooltipTop = badgeLayout.y + badgeLayout.height + 8;
  const tooltipLeft = Math.max(12, badgeLayout.x);
  const tooltipWidth = Math.min(SCREEN_WIDTH - 32, 280);

  return (
    <View ref={badgeRef} style={styles.container}>
      <TouchableOpacity
        style={styles.badge}
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ShieldCheck size={12} color="#FFF" />
        <Text style={styles.badgeText}>GM Servis</Text>
      </TouchableOpacity>

      {/* Tooltip rendered as transparent Modal to escape overflow:hidden */}
      <Modal
        visible={showTooltip}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideTooltip}
      >
        <TouchableWithoutFeedback onPress={hideTooltip}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.tooltip,
                {
                  opacity: fadeAnim,
                  top: tooltipTop,
                  left: tooltipLeft,
                  width: tooltipWidth,
                },
              ]}
            >
              <View style={styles.tooltipArrow} />
              <Text style={styles.tooltipText}>{tooltipText}</Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  tooltipText: {
    color: '#e2e8f0', // slate-200
    fontSize: 13,
    lineHeight: 18,
  },
  tooltipArrow: {
    position: 'absolute',
    top: -6,
    left: 20,
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
