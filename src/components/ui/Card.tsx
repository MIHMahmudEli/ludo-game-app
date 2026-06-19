import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Elevated surface used to group content. */
export function Card({ children, className }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-surface dark:bg-surface-dark-elevated p-4 shadow-sm ${
        className ?? ''
      }`}
    >
      {children}
    </View>
  );
}
