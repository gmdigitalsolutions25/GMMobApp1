/**
 * HalfCircleGauge — Speedometer-style half-circle health gauge
 *
 * Renders a 180° arc (flat bottom, curved top) with colored fill
 * proportional to the percentage value. Shows percentage inside,
 * label below, and detail text underneath.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HalfCircleGaugeProps {
  /** 0–100 percentage value */
  percent: number;
  /** Label below the gauge (e.g. "Engine", "Oil") */
  label: string;
  /** Detail text below the label (e.g. "800 km left") */
  detail: string;
  /** Size of the gauge (width & height will be size × size/2) */
  size?: number;
  /** Stroke width of the arc */
  strokeWidth?: number;
  /** Override color; if not provided, auto-picks green/yellow/red */
  color?: string;
  /** Text color for label */
  labelColor?: string;
  /** Text color for detail */
  detailColor?: string;
}

const GREEN = '#4CAF50';
const YELLOW = '#FFA726';
const RED = '#E53935';
const GRAY_BG = '#E8E8E8';

function getAutoColor(percent: number): string {
  if (percent > 70) return GREEN;
  if (percent > 40) return YELLOW;
  return RED;
}

/**
 * Build an SVG arc path for a half-circle (180°).
 * The arc goes from left (9 o'clock) to right (3 o'clock) across the top.
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const start = {
    x: cx + radius * Math.cos(toRad(endAngle)),
    y: cy + radius * Math.sin(toRad(endAngle)),
  };
  const end = {
    x: cx + radius * Math.cos(toRad(startAngle)),
    y: cy + radius * Math.sin(toRad(startAngle)),
  };
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function HalfCircleGauge({
  percent,
  label,
  detail,
  size = 100,
  strokeWidth = 10,
  color,
  labelColor = '#333',
  detailColor = '#999',
}: HalfCircleGaugeProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const fillColor = color || getAutoColor(clampedPercent);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Background arc: full 180° (from -180° to 0° in our coordinate system)
  // We use 0° to 180° where 0° is left, 180° is right
  const bgPath = describeArc(cx, cy, radius, -90, 90);

  // Fill arc: proportional to percent (0% = no arc, 100% = full 180°)
  const fillAngle = -90 + (clampedPercent / 100) * 180;
  const fillPath = clampedPercent > 0 ? describeArc(cx, cy, radius, -90, fillAngle) : '';

  return (
    <View style={[styles.container, { width: size }]}>
      <View style={{ width: size, height: size / 2 + strokeWidth / 2, overflow: 'hidden' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <Path
            d={bgPath}
            stroke={GRAY_BG}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {clampedPercent > 0 && (
            <Path
              d={fillPath}
              stroke={fillColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </Svg>
      </View>

      {/* Percentage text inside the arc */}
      <Text
        style={[
          styles.percentText,
          {
            color: fillColor,
            fontSize: size * 0.22,
            top: size * 0.15,
          },
        ]}
      >
        {clampedPercent}%
      </Text>

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
  percentText: {
    position: 'absolute',
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  detail: {
    fontSize: 11,
    marginTop: 1,
    textAlign: 'center',
  },
});
