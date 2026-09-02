import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({
  children,
  style,
  padded = true,
  topColor,
}: {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  // Cor da faixa de safe-area no topo — use 'headerBackground' quando a tela
  // começa com um cabeçalho escuro, para não haver emenda com o notch.
  topColor?: ThemeColor;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: theme[topColor ?? 'background'] }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={[styles.flex, { backgroundColor: theme.background }, padded && styles.padded, style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: Spacing.md },
});
