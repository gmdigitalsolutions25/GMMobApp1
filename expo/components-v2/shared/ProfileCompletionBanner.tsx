/**
 * ProfileCompletionBanner — Shows when user has no firstName or no vehicles.
 *
 * Works in both v1 and v2 designs. Accepts colors as a prop so it adapts
 * to whichever theme palette is active.
 *
 * Usage:
 *   <ProfileCompletionBanner
 *     user={user}
 *     vehicles={vehicles}
 *     colors={colors}
 *     onComplete={() => router.push('/onboarding')}
 *   />
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { User, Vehicle } from '@/constants/types';

interface Props {
  user: User | null;
  vehicles: Vehicle[];
  colors: any;
  onComplete: () => void;
}

export default function ProfileCompletionBanner({ user, vehicles, colors, onComplete }: Props) {
  const { t } = useTranslation();

  const missingName = !user?.firstName || user.firstName.trim().length === 0;
  const missingCar = !vehicles || vehicles.length === 0;

  // Nothing missing — don't render
  if (!missingName && !missingCar) return null;

  // Build the message
  let message = '';
  if (missingName && missingCar) {
    message = t('profile.completeBoth') || 'Adınızı və avtomobilinizi əlavə edin';
  } else if (missingName) {
    message = t('profile.completeName') || 'Adınızı əlavə edin';
  } else {
    message = t('profile.completeCar') || 'Avtomobilinizi əlavə edin';
  }

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}40` }]}
      onPress={onComplete}
      activeOpacity={0.7}
    >
      <AlertCircle size={18} color={colors.warning} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('profile.completeProfile') || 'Profili tamamlayın'}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      </View>
      <ArrowRight size={16} color={colors.warning} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
  },
});
