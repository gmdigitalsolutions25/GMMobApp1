import { Tabs } from 'expo-router';
import { Home, Car, Calendar, User as UserIcon } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useApp();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: t('tabs.appointments'),
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'My Garage',
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <UserIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
