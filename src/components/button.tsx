import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'xp' | 'danger' | 'ghost';
type IconName = ComponentProps<typeof Ionicons>['name'];

// Botão "chunky" da Variação A: um degrau sólido embaixo (boxShadow sem blur)
// que afunda quando pressionado. O degrau é decorativo — o estado vem do texto.
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  icon,
  badge,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  icon?: IconName;
  // Selo à direita do rótulo, ex.: "+35 XP".
  badge?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const tones: Record<Variant, { bg: string; ink: string; lip: string; ring?: string }> = {
    primary: { bg: theme.primary, ink: theme.primaryText, lip: theme.primaryLip },
    secondary: { bg: theme.backgroundElement, ink: theme.text, lip: theme.border, ring: theme.border },
    xp: { bg: theme.accent, ink: theme.accentText, lip: theme.accentLip },
    danger: { bg: theme.danger, ink: '#ffffff', lip: '#8e1c1c' },
    ghost: { bg: 'transparent', ink: theme.text, lip: 'transparent' },
  };
  const tone = isDisabled && variant !== 'ghost'
    ? { bg: theme.backgroundSelected, ink: theme.textSecondary, lip: 'transparent' }
    : tones[variant];
  const lipHeight = size === 'sm' ? 3 : 5;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => {
        const sink = pressed && !isDisabled ? lipHeight - 1 : 0;
        const shadows = [`0 ${lipHeight - sink}px 0 ${tone.lip}`];
        if (tone.ring) shadows.unshift(`inset 0 0 0 2px ${tone.ring}`);
        return [
          styles.base,
          size === 'sm' && styles.sm,
          {
            backgroundColor: tone.bg,
            boxShadow: variant === 'ghost' ? undefined : shadows.join(', '),
            transform: [{ translateY: sink }],
            marginBottom: variant === 'ghost' ? 0 : lipHeight,
          },
          style,
        ];
      }}>
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={tone.ink} size="small" />
        ) : (
          icon && <Ionicons name={icon} size={size === 'sm' ? 18 : 22} color={tone.ink} />
        )}
        <ThemedText style={[size === 'sm' ? styles.labelSm : styles.label, { color: tone.ink }]}>{label}</ThemedText>
        {badge && !loading && (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <ThemedText style={[styles.badgeText, { color: theme.accentText }]}>{badge}</ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  sm: { minHeight: 44, borderRadius: 14, paddingHorizontal: Spacing.md },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontFamily: HeadingFont, fontSize: 19, lineHeight: 24 },
  labelSm: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
  badge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 2 },
  badgeText: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 22 },
});
