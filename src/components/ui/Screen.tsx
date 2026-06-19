import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  /** Apply safe-area top padding (default true). */
  edges?: { top?: boolean; bottom?: boolean };
  className?: string;
}

/**
 * Themed, safe-area-aware screen container. Centralises the page background so
 * light/dark mode is consistent and screens stay declarative.
 */
export function Screen({ children, edges, className }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = edges?.top ?? true;
  const bottom = edges?.bottom ?? true;
  return (
    <View
      className={`flex-1 bg-surface-light dark:bg-surface-dark ${className ?? ''}`}
      style={{
        paddingTop: top ? insets.top : 0,
        paddingBottom: bottom ? insets.bottom : 0,
      }}
    >
      {children}
    </View>
  );
}
