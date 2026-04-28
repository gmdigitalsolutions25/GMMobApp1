/**
 * AppVersion — Displays the app version number.
 *
 * Usage: <AppVersion /> — renders "v1.0.23" at the bottom of the screen.
 * Reads version from app.json via expo-constants.
 */

import { Text, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import Colors from '@/constants/colors';

const version = Constants.expoConfig?.version || '0.0.0';
const buildNumber =
  Constants.expoConfig?.android?.versionCode ||
  Constants.expoConfig?.ios?.buildNumber ||
  '';

export function AppVersion() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        v{version}
        {buildNumber ? ` (${buildNumber})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    opacity: 0.5,
    fontWeight: '400',
  },
});
