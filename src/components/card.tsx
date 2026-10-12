import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Superfície padrão: borda de 2px em `border` + degrau sólido de 4px.
export function Card({
  children,
  style,
  borderColor,
  flat = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  // Sem degrau (para listas densas).
  flat?: boolean;
}) {
  const theme = useTheme();
  const ring = borderColor ?? theme.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          boxShadow: flat ? `inset 0 0 0 2px ${ring}` : `inset 0 0 0 2px ${ring}, 0 4px 0 ${ring}`,
          marginBottom: flat ? 0 : 4,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.md },
});
