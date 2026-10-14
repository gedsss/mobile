import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Chip de filtro: 40pt de altura + hitSlop para fechar o alvo de 44pt.
export function Pill({
  label,
  count,
  active = false,
  onPress,
  trailingIcon,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onPress: () => void;
  trailingIcon?: ComponentProps<typeof Ionicons>['name'];
}) {
  const theme = useTheme();
  const ink = active ? theme.background : theme.text;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.pill,
        active
          ? { backgroundColor: theme.text }
          : { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` },
      ]}>
      <ThemedText type="label" style={{ color: ink }}>
        {label}
      </ThemedText>
      {count != null && (
        <ThemedText type="label" style={{ color: ink, opacity: 0.7 }}>
          {count}
        </ThemedText>
      )}
      {trailingIcon && <Ionicons name={trailingIcon} size={15} color={ink} />}
    </Pressable>
  );
}

// Controle segmentado "chunky": trilho em surface2, opção ativa elevada com degrau.
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

  return (
    <View style={[styles.segmented, { backgroundColor: theme.backgroundSelected }]} accessibilityRole="tablist">
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.backgroundElement, boxShadow: `0 3px 0 ${theme.border}` },
            ]}>
            <ThemedText style={[styles.segmentText, { color: selected ? theme.text : theme.textSecondary }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  segmented: { flexDirection: 'row', gap: 4, padding: 5, borderRadius: 18 },
  segment: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontFamily: HeadingFont, fontSize: 17, lineHeight: 22 },
});
