/**
 * CustomAlert — Styled modal replacement for native Alert.alert()
 *
 * Usage:
 *   import { useAlert, AlertProvider } from '@/components/CustomAlert';
 *
 *   const { showAlert, showConfirm } = useAlert();
 *
 *   showAlert('Title', 'Message');
 *   showConfirm('Title', 'Message', () => onConfirm(), () => onCancel());
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type AlertType = 'info' | 'success' | 'error' | 'warning' | 'confirm';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
  buttons: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message: string, type?: AlertType) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  showConfirm: () => {},
  showError: () => {},
  showSuccess: () => {},
});

export const useAlert = () => useContext(AlertContext);

const ICONS: Record<AlertType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  info: { name: 'information-circle', color: '#2196F3' },
  success: { name: 'checkmark-circle', color: '#4CAF50' },
  error: { name: 'close-circle', color: '#F44336' },
  warning: { name: 'warning', color: '#FF9800' },
  confirm: { name: 'help-circle', color: '#F24141' },
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const show = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
    setVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const hide = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setConfig(null);
      callback?.();
    });
  }, [scaleAnim, opacityAnim]);

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
    show({
      title,
      message,
      type,
      buttons: [{ text: 'OK', style: 'default' }],
    });
  }, [show]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Bəli',
    cancelText: string = 'Xeyr',
  ) => {
    show({
      title,
      message,
      type: 'confirm',
      buttons: [
        { text: cancelText, style: 'cancel', onPress: onCancel },
        { text: confirmText, style: 'default', onPress: onConfirm },
      ],
    });
  }, [show]);

  const showError = useCallback((title: string, message: string) => {
    show({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  }, [show]);

  const showSuccess = useCallback((title: string, message: string) => {
    show({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', style: 'default' }],
    });
  }, [show]);

  const handleButtonPress = (button: AlertButton) => {
    hide(button.onPress);
  };

  const iconConfig = config ? ICONS[config.type] : ICONS.info;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showError, showSuccess }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hide()}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.alertContainer,
              isDark && styles.alertContainerDark,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: `${iconConfig.color}15` }]}>
              <Ionicons name={iconConfig.name} size={32} color={iconConfig.color} />
            </View>

            {/* Title */}
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {config?.title}
            </Text>

            {/* Message */}
            <Text style={[styles.message, isDark && styles.messageDark]}>
              {config?.message}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {config?.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.buttonCancel,
                    button.style === 'cancel' && isDark && styles.buttonCancelDark,
                    button.style === 'destructive' && styles.buttonDestructive,
                    button.style === 'default' && styles.buttonPrimary,
                    config.buttons.length === 1 && styles.buttonFull,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.buttonTextCancel,
                      button.style === 'cancel' && isDark && styles.buttonTextCancelDark,
                      button.style === 'destructive' && styles.buttonTextDestructive,
                      button.style === 'default' && styles.buttonTextPrimary,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  alertContainer: {
    width: width - 64,
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  alertContainerDark: {
    backgroundColor: '#1E1E2E',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  messageDark: {
    color: '#AAA',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#F24141',
  },
  buttonCancel: {
    backgroundColor: '#F0F0F0',
  },
  buttonCancelDark: {
    backgroundColor: '#2A2A3A',
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#666',
  },
  buttonTextCancelDark: {
    color: '#CCC',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});
