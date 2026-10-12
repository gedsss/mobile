import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingView({ label = 'Carregando…' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityLabel={label} accessibilityState={{ busy: true }}>
      <ActivityIndicator color={theme.primary} size="large" />
      <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.sm }}>
        {label}
      </ThemedText>
    </View>
  );
}

// Ilustração padrão dos estados: ícone grande num bloco inclinado.
function StateArt({ icon, tone = 'neutral' }: { icon: IconName; tone?: 'neutral' | 'accent' }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.art,
        tone === 'accent'
          ? { backgroundColor: theme.accent, boxShadow: `0 5px 0 ${theme.accentLip}` }
          : { backgroundColor: theme.backgroundSelected },
      ]}>
      <Ionicons name={icon} size={56} color={tone === 'accent' ? theme.accentText : theme.textSecondary} />
    </View>
  );
}

export function ErrorView({
  title = 'A linha arrebentou',
  message = 'Não conseguimos carregar os dados. Confira o sinal e tente de novo.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <StateArt icon="cloud-offline-outline" />
      <ThemedText type="title" style={[styles.centerText, styles.title]}>
        {title}
      </ThemedText>
      <ThemedText type="body" themeColor="textSecondary" style={styles.centerText}>
        {message}
      </ThemedText>
      {onRetry && (
        <View style={styles.action}>
          <Button label="Tentar de novo" icon="refresh" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

export function EmptyState({
  title,
  subtitle,
  icon = 'fish-outline',
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={styles.center}>
      <StateArt icon={icon} />
      <ThemedText type="title" style={[styles.centerText, styles.title]}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText type="body" themeColor="textSecondary" style={styles.centerText}>
          {subtitle}
        </ThemedText>
      )}
      {children}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

export function Skeleton({
  width = '100%',
  height = 14,
  radius = 10,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return <View style={[{ width, height, borderRadius: radius, backgroundColor: theme.skeleton }, style]} />;
}

// Esqueleto da grade de cartas (catálogo).
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.grid} accessibilityLabel="Carregando" accessibilityState={{ busy: true }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.cardSk, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
          <Skeleton height={106} radius={14} />
          <Skeleton width="70%" height={16} style={styles.skGap} />
          <Skeleton width="50%" height={12} style={styles.skGapSm} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 8 },
  centerText: { textAlign: 'center' },
  title: { marginTop: 12 },
  action: { alignSelf: 'stretch', marginTop: 16 },
  art: { width: 120, height: 120, borderRadius: 40, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, paddingTop: 16 },
  cardSk: { width: '47.5%', height: 212, borderRadius: 18, padding: 4 },
  skGap: { marginTop: 10, marginLeft: 8 },
  skGapSm: { marginTop: 8, marginLeft: 8 },
});
