import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User as UserIcon, Languages, Moon, Sun, LogOut, Info, ChevronRight, Camera, Edit2, Home, Car } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { useTranslation } from 'react-i18next';
import { PHONE_PLACEHOLDER } from '@/constants/phoneUtils';
import type { Language, Theme } from '@/constants/types';
import { useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, setLanguage, setTheme, theme, language, updateUser, defaultStartScreen, setDefaultStartScreen } = useApp();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.username || '');

  const handleLanguageChange = async () => {
    const languages: { code: Language; label: string }[] = [
      { code: 'en', label: 'English' },
      { code: 'az', label: 'Azərbaycan' },
      { code: 'ru', label: 'Русский' },
    ];

    Alert.alert(
      t('profile.language'),
      'Choose language',
      languages.map(lang => ({
        text: lang.label,
        onPress: async () => {
          await setLanguage(lang.code);
          await i18n.changeLanguage(lang.code);
        },
      }))
    );
  };

  const handleThemeToggle = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  const handleDefaultStartScreenChange = async () => {
    Alert.alert(
      t('profile.defaultStartScreen'),
      'Choose default start screen',
      [
        {
          text: t('profile.home'),
          onPress: async () => {
            await setDefaultStartScreen('home');
          },
        },
        {
          text: t('profile.myGarage'),
          onPress: async () => {
            await setDefaultStartScreen('vehicles');
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant camera roll permissions to change your profile picture.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateUser({ avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateUser({ username: editedName.trim() });
      setIsEditingName(false);
    } else {
      Alert.alert('Error', 'Please enter a valid name.');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.username || '');
    setIsEditingName(false);
  };

  const getCurrentLanguageLabel = () => {
    switch (language) {
      case 'az':
        return 'Azərbaycan';
      case 'ru':
        return 'Русский';
      default:
        return 'English';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('profile.profile')}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <TouchableOpacity 
            style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <UserIcon size={40} color={colors.text} />
            )}
            <View style={[styles.cameraIconContainer, { backgroundColor: colors.primary }]}>
              <Camera size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={[styles.nameInput, { 
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textTertiary}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.error + '20' }]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={[styles.editButtonText, { color: colors.error }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveName}
                  >
                    <Text style={[styles.editButtonText, { color: '#fff' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.username, { color: colors.text }]}>
                  {user?.username || 'User'}
                </Text>
                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                  <Edit2 size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={[styles.phone, { color: colors.textSecondary }]}>
              {user?.phone || PHONE_PLACEHOLDER}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('profile.settings')}
          </Text>

          <View style={[styles.settingsCard, { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <TouchableOpacity style={styles.settingRow} onPress={handleLanguageChange}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Languages size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('profile.language')}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {getCurrentLanguageLabel()}
                </Text>
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingRow} onPress={handleThemeToggle}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
                  {theme === 'dark' ? (
                    <Moon size={20} color={colors.primary} />
                  ) : (
                    <Sun size={20} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('profile.theme')}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {theme === 'dark' ? t('profile.darkMode') : t('profile.lightMode')}
                </Text>
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingRow} onPress={handleDefaultStartScreenChange}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
                  {defaultStartScreen === 'home' ? (
                    <Home size={20} color={colors.primary} />
                  ) : (
                    <Car size={20} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t('profile.defaultStartScreen')}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {defaultStartScreen === 'home' ? t('profile.home') : t('profile.myGarage')}
                </Text>
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.settingsCard, { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}
            onPress={handleSignOut}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.error}20` }]}>
                  <LogOut size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  {t('profile.logout')}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Info size={16} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            {t('profile.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  cameraIconContainer: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  editNameContainer: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600' as const,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  phone: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  settingDivider: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
