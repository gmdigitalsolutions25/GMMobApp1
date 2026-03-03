/**
 * Loading screen shown while AppProvider initializes state from AsyncStorage.
 * Shows the DOS-style boot log so we can see exactly what's happening.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BootLog } from '@/components/BootLog';
import { getBootEntries, subscribeBootLog, bootLog } from '@/lib/bootLog';

bootLog('index.tsx loaded', 'ok');

export default function IndexScreen() {
  const [entries, setEntries] = useState(getBootEntries());

  useEffect(() => {
    bootLog('IndexScreen mounted', 'ok');
    const unsub = subscribeBootLog(() => {
      setEntries([...getBootEntries()]);
    });
    return unsub;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <BootLog entries={entries} done={false} />
    </View>
  );
}
