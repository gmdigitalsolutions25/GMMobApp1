import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, hasCompletedOnboarding, user, defaultStartScreen } = useApp();

  useEffect(() => {
    if (isLoading) return;

    if (!hasCompletedOnboarding) {
      router.replace('/welcome');
    } else if (!user) {
      router.replace('/auth');
    } else {
      router.replace(`/(tabs)/${defaultStartScreen}`);
    }
  }, [isLoading, hasCompletedOnboarding, user, defaultStartScreen, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={Colors.dark.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
});
