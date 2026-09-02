import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useColorSchemeName, useTheme } from '@/hooks/use-theme';

function usePillTones() {
  const theme = useTheme();
  const scheme = useColorSchemeName();
  const active =
    scheme === 'dark'
      ? { bg: '#0f4a58', ink: '#f7fbfa', border: '#1d6675' }
      : { bg: theme.backgroundSelected, ink: theme.text, border: theme.primary };
  const inactive = { bg: theme.backgroundElement, ink: theme.textSecondary, border: theme.border };
  return { active, inactive };
}

export function Pill({
  label,
  active = false,
  onPress,
  shape = 'pill',
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  shape?: 'pill' | 'rounded';
}) {
  const { active: on, inactive: off } = usePillTones();
  const tone = active ? on : off;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.pill,
        { borderRadius: shape === 'pill' ? Radius.pill : 11, backgroundColor: tone.bg, borderColor: tone.border },
      ]}>
      <ThemedText type="caption" style={{ color: tone.ink }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  const scheme = useColorSchemeName();
  const activeBg = scheme === 'dark' ? '#14424f' : theme.backgroundElement;

  return (
    <View style={[styles.segmented, { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.09)' : theme.backgroundSelected }]}>
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && { backgroundColor: activeBg }]}>
            <ThemedText type="caption" style={{ color: selected ? theme.text : theme.textSecondary }}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
  },
  segmented: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 15,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
