/**
 * Global Error Boundary for Qaraj
 * Catches all unhandled JS errors and renders them on screen.
 * Also logs to the boot log so the DOS-style screen shows the crash.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { bootLog, getBootEntries } from '@/lib/bootLog';
import { BootLog } from '@/components/BootLog';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    try {
      bootLog('CRASH: ' + error?.message, 'fail');
      bootLog('Stack: ' + (error?.stack?.split('\n')[1] ?? 'none'), 'fail');
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const entries = getBootEntries();
      // Add the crash to entries
      const crashEntries = [
        ...entries,
        { text: '━━━ CRASH CAUGHT BY ERROR BOUNDARY ━━━', status: 'fail' as const },
        { text: 'Error: ' + (error?.message ?? 'Unknown'), status: 'fail' as const },
        { text: error?.stack?.split('\n')[1]?.trim() ?? '', status: 'fail' as const },
        { text: error?.stack?.split('\n')[2]?.trim() ?? '', status: 'fail' as const },
        { text: '━━━ COMPONENT STACK ━━━', status: 'warn' as const },
        ...(errorInfo?.componentStack?.split('\n').slice(1, 6).map(l => ({
          text: l.trim(),
          status: 'warn' as const,
        })) ?? []),
      ];

      return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <BootLog entries={crashEntries} done={false} />
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
  },
  retryButton: {
    backgroundColor: '#F5C518',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
  },
});
