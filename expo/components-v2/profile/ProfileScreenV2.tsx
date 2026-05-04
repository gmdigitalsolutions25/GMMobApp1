/**
 * ProfileScreenV2 — "Showroom Floor" Profile / Account
 *
 * User info header, settings sections with toggles,
 * language/theme pickers, biometric option, sign out.
 *
 * Wired handlers:
 *  - Language cycling (EN → AZ → RU → EN)
 *  - Biometric toggle (reads/writes via authStore)
 *  - Change PIN (navigates to pin-login with reset flow)
 *  - Profile name editing (inline TextInput)
 *  - Sign out with confirmation
 */
import React, { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  RefreshControl,
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
  Edit2,
  Check,
  X,
} from 'lucide-react-native';
import { useApp } from '@/providers/AppProvider';
import { useAlert } from '@/components/CustomAlert';
import { useTranslation } from 'react-i18next';
import { ColorsV2 } from '@/hooks/useDesignV2';
import {
  isBiometricEnabled,
  setBiometricEnabled,
} from '@/lib/authStore';
import {
  checkBiometricAvailability,
  authenticateWithBiometric,
} from '@/lib/biometric';
import type { Language } from '@/constants/types';

export default function ProfileScreenV2() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const {
    user,
    theme,
    setTheme,
    language,
    setLanguage,
    signOut,
    vehicles,
    updateUser,
  } = useApp();
  const { showAlert, showConfirm, showError } = useAlert();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? ColorsV2.dark : ColorsV2.light;
  const isDark = theme === 'dark';

  // ── Local state ──────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.username || user?.firstName || '');

  // ── Load biometric state on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const enabled = await isBiometricEnabled();
      setBiometricOn(enabled);
      const status = await checkBiometricAvailability();
      setBiometricAvailable(status.isAvailable && status.isEnrolled);
    })();
  }, []);

  // ── Pull to refresh ──────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ── 1. Language cycling (EN → AZ → RU → EN) ─────────────────────────────
  const handleLanguageChange = async () => {
    const languages: { code: Language; label: string }[] = [
      { code: 'en', label: 'English' },
      { code: 'az', label: 'Azərbaycan' },
      { code: 'ru', label: 'Русский' },
    ];
    const currentIndex = languages.findIndex((l) => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    await setLanguage(nextLang.code);
    await i18n.changeLanguage(nextLang.code);
    showAlert(t('profile.language'), nextLang.label, 'success');
  };

  // ── 2. Biometric toggle ──────────────────────────────────────────────────
  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Turning ON — verify biometric first
      if (!biometricAvailable) {
        showAlert(
          t('profile.biometric'),
          t('profile.biometricNotAvailable') || 'Biometric authentication is not available on this device.',
          'warning'
        );
        return;
      }
      const success = await authenticateWithBiometric('Enable biometric login');
      if (success) {
        await setBiometricEnabled(true);
        setBiometricOn(true);
        showAlert(t('profile.biometric'), t('profile.biometricEnabled') || 'Biometric login enabled', 'success');
      }
    } else {
      // Turning OFF
      await setBiometricEnabled(false);
      setBiometricOn(false);
      showAlert(t('profile.biometric'), t('profile.biometricDisabled') || 'Biometric login disabled', 'success');
    }
  };

  // ── 3. Change PIN — navigate to pin-login which has the forgot-PIN flow ─
  const handleChangePin = () => {
    showConfirm(
      t('profile.changePin') || 'Change PIN',
      t('profile.changePinConfirm') || 'You will be asked to verify your identity via OTP before setting a new PIN.',
      () => {
        // Navigate to pin-login — user can use "Forgot PIN?" to reset
        router.push('/pin-login');
      },
      undefined,
      t('common.continue') || 'Continue',
      t('common.cancel') || 'Cancel'
    );
  };

  // ── 4. Profile name editing ──────────────────────────────────────────────
  const handleSaveName = async () => {
    const trimmed = editedName.trim();
    if (trimmed) {
      await updateUser({ username: trimmed });
      setIsEditingName(false);
      showAlert(t('profile.profile'), t('profile.nameUpdated') || 'Name updated', 'success');
    } else {
      showError(
        t('profile.errorUpdateProfile') || 'Error',
        t('profile.enterValidName') || 'Please enter a valid name'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.username || user?.firstName || '');
    setIsEditingName(false);
  };

  // ── Sign out with confirmation ───────────────────────────────────────────
  const handleSignOut = () => {
    showConfirm(
      t('profile.signOut') || 'Sign Out',
      t('profile.signOutConfirm') || 'Are you sure you want to sign out?',
      async () => {
        await signOut();
        router.replace('/auth');
      },
      undefined,
      t('profile.signOut') || 'Sign Out',
      t('common.cancel') || 'Cancel'
    );
  };

  // ── Language label ───────────────────────────────────────────────────────
  const langLabel =
    language === 'az' ? 'Azərbaycan' : language === 'ru' ? 'Русский' : 'English';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + 12, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile.title') || 'Hesab'}
          </Text>
        </View>

        {/* User card */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: colors.surface }]}
          onPress={() => setIsEditingName(true)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}
          >
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  placeholder={t('profile.enterYourName') || 'Enter your name'}
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity
                  style={[styles.editIconBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveName}
                >
                  <Check size={16} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editIconBtn, { backgroundColor: `${colors.error}20` }]}
                  onPress={handleCancelEdit}
                >
                  <X size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.username || user?.firstName || t('profile.tapToSetName') || 'Tap to set name'}
              </Text>
            )}
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
          {!isEditingName && (
            <View style={styles.editBtn}>
              <Edit2 size={16} color={colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Preferences section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
            {t('profile.preferences') || 'Tənzimləmələr'}
          </Text>

          {/* Theme toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              {isDark ? (
                <Moon size={18} color={colors.primary} />
              ) : (
                <Sun size={18} color={colors.primary} />
              )}
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
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleLanguageChange}
          >
            <View style={styles.settingLeft}>
              <Globe size={18} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('profile.language') || 'Dil'}
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                {langLabel}
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
              value={biometricOn}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {/* Change PIN */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleChangePin}
          >
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
            <Text
              style={[styles.settingValue, { color: colors.textTertiary }]}
            >
              v{Constants.expoConfig?.version || '1.0.0'} (
              {Constants.expoConfig?.android?.versionCode || '?'})
            </Text>
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

  // Name editing
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
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
