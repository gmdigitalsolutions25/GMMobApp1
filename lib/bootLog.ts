/**
 * Global boot log store.
 * Entries are written synchronously so they survive crashes.
 * The BootLog component reads from this store.
 */
import type { BootLogEntry } from '@/components/BootLog';

// Global mutable log — survives component re-renders
const _entries: BootLogEntry[] = [];
let _listeners: (() => void)[] = [];

export function bootLog(text: string, status: BootLogEntry['status'] = 'ok') {
  _entries.push({ text, status });
  _listeners.forEach(fn => fn());
}

export function getBootEntries(): BootLogEntry[] {
  return _entries;
}

export function subscribeBootLog(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter(l => l !== fn);
  };
}
