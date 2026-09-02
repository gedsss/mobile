import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, xpProgress } from '@/constants/theme';
import { useColorSchemeName, useTheme } from '@/hooks/use-theme';

export function XpBar({ xp, showLabel = true }: { xp: number; showLabel?: boolean }) {
  const theme = useTheme();
  const scheme = useColorSchemeName();
  const { level, xpIntoLevel, xpForNextLevel, ratio } = xpProgress(xp);
  const track = scheme === 'dark' ? 'rgba(255,255,255,0.13)' : theme.backgroundSelected;

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.header}>
          <ThemedText type="caption" themeColor="textSecondary">
            XP para o nível {level + 1}
          </ThemedText>
          <ThemedText type="mono" style={{ color: theme.accent }}>
            {xpIntoLevel} / {xpForNextLevel} XP
          </ThemedText>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: track }]}>
        <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: theme.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.sm },
  track: { height: 9, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
