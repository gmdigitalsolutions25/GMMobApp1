/**
 * Global error handler for Qaraj
 *
 * Installs handlers for:
 * 1. Unhandled JS exceptions (ErrorUtils)
 * 2. Unhandled Promise rejections
 * 3. Console.error override to capture all errors
 *
 * All errors are stored in a global log accessible via getErrorLog().
 */

const MAX_LOG_ENTRIES = 50;

interface ErrorEntry {
  timestamp: string;
  type: 'exception' | 'promise' | 'console';
  message: string;
  stack?: string;
}

const errorLog: ErrorEntry[] = [];

function addEntry(entry: ErrorEntry) {
  errorLog.unshift(entry); // newest first
  if (errorLog.length > MAX_LOG_ENTRIES) {
    errorLog.pop();
  }
  // Also log to native console so adb logcat can pick it up
  console.warn(`[QarajError][${entry.type}] ${entry.message}`);
}

export function getErrorLog(): ErrorEntry[] {
  return [...errorLog];
}

export function getErrorLogText(): string {
  if (errorLog.length === 0) return 'No errors recorded.';
  return errorLog
    .map(
      (e) =>
        `[${e.timestamp}] [${e.type.toUpperCase()}]\n${e.message}\n${e.stack ?? ''}`
    )
    .join('\n\n---\n\n');
}

export function installGlobalErrorHandlers() {
  try {
    // 1. Override global ErrorUtils (catches unhandled JS exceptions in RN)
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
    (global as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal: boolean) => {
      addEntry({
        timestamp: new Date().toISOString(),
        type: 'exception',
        message: `[${isFatal ? 'FATAL' : 'NON-FATAL'}] ${error?.message ?? String(error)}`,
        stack: error?.stack,
      });
      // Call the original handler so React Native can also handle it
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // 2. Catch unhandled Promise rejections
    const originalPromiseHandler = (global as any).onunhandledrejection;
    (global as any).onunhandledrejection = (event: any) => {
      const reason = event?.reason;
      addEntry({
        timestamp: new Date().toISOString(),
        type: 'promise',
        message: reason?.message ?? String(reason) ?? 'Unknown promise rejection',
        stack: reason?.stack,
      });
      if (originalPromiseHandler) {
        originalPromiseHandler(event);
      }
    };

    // 3. Override console.error to capture all errors
    const originalConsoleError = console.error.bind(console);
    console.error = (...args: any[]) => {
      const message = args
        .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');
      addEntry({
        timestamp: new Date().toISOString(),
        type: 'console',
        message,
      });
      originalConsoleError(...args);
    };

    console.warn('[QarajErrorHandler] Global error handlers installed successfully.');
  } catch (e) {
    console.warn('[QarajErrorHandler] Failed to install handlers:', e);
  }
}
