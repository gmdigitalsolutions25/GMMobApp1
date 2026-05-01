import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { ColorsV2 } from '@/hooks/useDesignV2';

type Status = 'done' | 'pending' | 'waiting';

interface ServiceTimelineItemProps {
  title: string;
  date: string;
  status: Status;
  isLast?: boolean;
  theme: 'dark' | 'light';
}

export function ServiceTimelineItem({ title, date, status, isLast, theme }: ServiceTimelineItemProps) {
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;

  const dotColor =
    status === 'done' ? colors.success :
    status === 'pending' ? colors.warning :
    colors.textTertiary;

  return (
    <View style={styles.row}>
      <View style={styles.dotColumn}>
        {status === 'done' ? (
          <CheckCircle size={16} color={dotColor} />
        ) : (
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
        )}
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.date, { color: colors.textTertiary }]}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: 44,
  },
  dotColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  line: {
    width: 1.5,
    flex: 1,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
});
