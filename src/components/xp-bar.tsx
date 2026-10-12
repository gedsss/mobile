import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont, XpGradient, xpProgress } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Trilho de XP com preenchimento em gradiente amarelo→laranja.
export function XpTrack({ ratio, height = 12, onDark = false }: { ratio: number; height?: number; onDark?: boolean }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: onDark ? 'rgba(255,255,255,0.16)' : theme.backgroundSelected,
          boxShadow: onDark ? undefined : `inset 0 0 0 1px ${theme.border}`,
        },
      ]}>
      {pct > 0 && (
        <LinearGradient
          colors={XpGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${Math.max(pct * 100, 4)}%`, height: '100%', borderRadius: height / 2 }}
        />
      )}
    </View>
  );
}

export function XpBar({ xp, showLabel = true, onDark = false }: { xp: number; showLabel?: boolean; onDark?: boolean }) {
  const { level, xpIntoLevel, xpForNextLevel, ratio } = xpProgress(xp);
  const remaining = xpForNextLevel - xpIntoLevel;

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Nível ${level}, ${xpIntoLevel} de ${xpForNextLevel} XP`}
      accessibilityValue={{ min: 0, max: xpForNextLevel, now: xpIntoLevel }}>
      {showLabel && (
        <View style={styles.header}>
          <ThemedText type="label" themeColor={onDark ? 'onDark' : 'text'}>
            Nível {level} → {level + 1}
          </ThemedText>
          <ThemedText type="caption" themeColor={onDark ? 'onDarkSecondary' : 'textSecondary'} style={styles.bold}>
            {xpIntoLevel}/{xpForNextLevel} XP · faltam {remaining}
          </ThemedText>
        </View>
      )}
      <XpTrack ratio={ratio} height={14} onDark={onDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  track: { overflow: 'hidden' },
  bold: { fontWeight: '700' },
  num: { fontFamily: HeadingFont },
});
