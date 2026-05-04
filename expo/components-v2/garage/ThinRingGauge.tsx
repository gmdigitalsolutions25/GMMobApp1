/**
 * ThinRingGauge — Full-circle thin ring health indicator
 *
 * Renders a complete circle with a colored fill arc proportional
 * to the percentage value. Shows percentage inside, label below.
 * Compact design for horizontal row layout (Option D).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ThinRingGaugeProps {
  /** 0–100 percentage value */
  percent: number;
  /** Label below the ring (e.g. "Engine", "Oil") */
  label: string;
  /** Detail text below the label (e.g. "8k km") */
  detail: string;
  /** Diameter of the ring */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
  /** Text color for label */
  labelColor?: string;
  /** Text color for detail */
  detailColor?: string;
  /** Background track color */
  trackColor?: string;
}

const GREEN = '#10b981';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const GRAY_BG = '#E8E8E8';

function getAutoColor(percent: number): string {
  if (percent > 70) return GREEN;
  if (percent > 40) return AMBER;
  return RED;
}

export default function ThinRingGauge({
  percent,
  label,
  detail,
  size = 52,
  strokeWidth = 5,
  labelColor = '#333',
  detailColor = '#999',
  trackColor = GRAY_BG,
}: ThinRingGaugeProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const fillColor = getAutoColor(clampedPercent);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedPercent / 100);

  return (
    <View style={[styles.container, { width: size + 8 }]}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Filled arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        {/* Percentage text centered */}
        <View style={styles.percentContainer}>
          <Text style={[styles.percentText, { color: fillColor, fontSize: size * 0.24 }]}>
            {clampedPercent}
          </Text>
        </View>
      </View>
      {/* Label */}
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      {/* Detail */}
      <Text style={[styles.detail, { color: detailColor }]} numberOfLines={1}>
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  percentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  detail: {
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
});
