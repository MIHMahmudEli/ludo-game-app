import './global.css';

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';

import { RootNavigator } from '@/navigation';
import { queryClient } from '@/services';
import { useSettingsStore } from '@/store';

/**
 * Application composition root.
 *
 * Responsibilities are limited to wiring cross-cutting providers together —
 * gesture handling, safe areas, server-state (React Query), navigation and the
 * theme bridge. No feature/business logic lives here (separation of concerns).
 */
export default function App() {
  const themePreference = useSettingsStore((s) => s.theme);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const { setColorScheme } = useNativewindColorScheme();

  // Load persisted settings once on boot.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Bridge the persisted theme preference into NativeWind's color scheme.
  useEffect(() => {
    setColorScheme(themePreference);
  }, [themePreference, setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
