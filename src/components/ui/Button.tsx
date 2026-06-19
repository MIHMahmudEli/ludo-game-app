import { Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand active:bg-brand-dark',
  secondary:
    'bg-slate-200 active:bg-slate-300 dark:bg-surface-dark-elevated dark:active:bg-slate-700',
  ghost: 'bg-transparent border border-slate-300 dark:border-slate-600',
  danger: 'bg-player-red active:bg-red-700',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900 dark:text-slate-100',
  ghost: 'text-slate-700 dark:text-slate-200',
  danger: 'text-white',
};

const SIZE: Record<Size, string> = {
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-2xl',
};

/**
 * Themed, accessible button. Pure presentation — callers own behaviour.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center ${SIZE[size]} ${CONTAINER[variant]} ${
        disabled ? 'opacity-40' : ''
      } ${className ?? ''}`}
    >
      <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  );
}
