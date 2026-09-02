import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgrounds: Record<Variant, string> = {
    primary: theme.primary,
    secondary: theme.backgroundSelected,
    danger: theme.danger,
    ghost: 'transparent',
  };
  const textColors: Record<Variant, string> = {
    primary: theme.primaryText,
    secondary: theme.text,
    danger: '#FFFFFF',
    ghost: theme.text,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: backgrounds[variant], opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'primary' && styles.primaryShadow,
        variant === 'ghost' && [styles.ghostBorder, { borderColor: theme.border }],
        style,
      ]}>
      <View style={styles.inner}>
        {loading && <ActivityIndicator color={textColors[variant]} size="small" />}
        <ThemedText
          type={size === 'sm' ? 'bodyBold' : 'subtitle'}
          style={[variant === 'primary' && styles.primaryLabel, { color: textColors[variant] }]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  sm: { minHeight: 40, borderRadius: Radius.md, paddingHorizontal: Spacing.md },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  primaryShadow: {
    shadowColor: '#ff8a3d',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  primaryLabel: { fontFamily: HeadingFont, letterSpacing: 0.2 },
  ghostBorder: { borderWidth: 1 },
});
