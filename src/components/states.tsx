import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingView({ label = 'Carregando…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.primary} size="large" />
      <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.sm }}>
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorView({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <ThemedText type="body" themeColor="danger" style={styles.centerText}>
        {message}
      </ThemedText>
      {onRetry && (
        <Button label="Tentar de novo" variant="secondary" onPress={onRetry} style={{ marginTop: Spacing.md }} />
      )}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <ThemedText type="subtitle" style={styles.centerText}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText type="body" themeColor="textSecondary" style={[styles.centerText, { marginTop: Spacing.xs }]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  centerText: { textAlign: 'center' },
});
