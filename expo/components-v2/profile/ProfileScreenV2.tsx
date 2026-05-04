/**
 * ProfileScreenV2 — "Showroom Floor" Profile / Account
 *
 * User info header, settings sections with toggles,
 * language/theme pickers, biometric option, sign out.
 */
import React from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  Fingerprint,
  LogOut,
  ChevronRight,
  Phone,
  Car,
  Info,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';

export default function ProfileScreenV2() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, theme, setTheme, language, setLanguage, signOut, vehicles } = useApp();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile.title') || 'Hesab'}
          </Text>
        </View>

        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.firstName || user?.phone || 'İstifadəçi'}
            </Text>
            <View style={styles.phoneRow}>
              <Phone size={13} color={colors.textSecondary} />
              <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                {user?.phone || '—'}
              </Text>
            </View>
            <View style={styles.phoneRow}>
              <Car size={13} color={colors.textSecondary} />
              <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                {vehicles.length} {t('profile.vehicles') || 'avtomobil'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Preferences section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
            {t('profile.preferences') || 'Tənzimləmələr'}
          </Text>

          {/* Theme toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {isDark ? <Moon size={18} color={colors.primary} /> : <Sun size={18} color={colors.primary} />}
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.darkMode') || 'Qaranlıq rejim'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Globe size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.language') || 'Dil'}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {language === 'az' ? 'Azərbaycan' : language === 'ru' ? 'Русский' : 'English'}
              </Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.settingLeft}>
              <Bell size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.notifications') || 'Bildirişlər'}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Security section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
            {t('profile.security') || 'Təhlükəsizlik'}
          </Text>

          {/* Biometric */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Fingerprint size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.biometric') || 'Barmaq izi / Üz tanıma'}
              </Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {/* PIN */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Shield size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.changePin') || 'PIN dəyiş'}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* About section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Info size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.about') || 'Haqqında'}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textTertiary }]}>v{Constants.expoConfig?.version || '1.0.0'} ({Constants.expoConfig?.android?.versionCode || '?'})</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {t('profile.signOut') || 'Çıxış'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ─── STYLES ─── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 18, fontWeight: '700' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userPhone: { fontSize: 13 },
  editBtn: { padding: 8 },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  // Setting row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 14 },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: { fontSize: 15, fontWeight: '600' },
});
