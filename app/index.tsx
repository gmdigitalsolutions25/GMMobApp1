import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

// This screen is shown briefly while AppProvider loads state from AsyncStorage.
// Navigation to the correct screen is handled in _layout.tsx (RootLayoutNav)
// once isLoading becomes false.
export default function IndexScreen() {
  return (
    <View style={styles.container}>
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
