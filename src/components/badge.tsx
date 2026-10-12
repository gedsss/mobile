import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Difficulty } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, DifficultyStars, type Habitat } from '@/constants/theme';
import { useHabitat, useRarity } from '@/hooks/use-theme';

// Pill de raridade: cor sólida + rótulo escrito + estrelas (opcional) — a
// raridade nunca depende só da cor. Lendário usa o gradiente dourado.
export function RarityPill({
  difficulty,
  stars = false,
  size = 'md',
  style,
}: {
  difficulty: Difficulty;
  stars?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}) {
  const r = useRarity()[difficulty];
  const label = DifficultyLabels[difficulty] + (stars ? ` ${'★'.repeat(DifficultyStars[difficulty])}` : '');
  const box = [styles.pill, size === 'sm' && styles.pillSm, style];
  const text = (
    <ThemedText style={[styles.pillText, size === 'sm' && styles.pillTextSm, { color: r.onColor }]}>{label}</ThemedText>
  );

  if (r.frame) {
    return (
      <LinearGradient colors={['#ffd54a', '#ff9a1f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={box}>
        {text}
      </LinearGradient>
    );
  }
  return <View style={[box, { backgroundColor: r.color }]}>{text}</View>;
}

// Compat com telas antigas.
export const DifficultyBadge = RarityPill;
export const RarityTag = RarityPill;

export function HabitatChip({ habitat }: { habitat: Habitat }) {
  const tone = useHabitat()[habitat];
  return (
    <View style={[styles.habitat, { backgroundColor: tone.bg }]}>
      <ThemedText type="monoSmall" style={{ color: tone.ink }}>
        {habitat === 'Doce' ? 'ÁGUA DOCE' : 'ÁGUA SALGADA'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    minHeight: 24,
    borderRadius: 999,
  },
  pillSm: { paddingHorizontal: 7, minHeight: 20 },
  pillText: { fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 0.6 },
  pillTextSm: { fontSize: 11, lineHeight: 14 },
  habitat: { alignSelf: 'flex-start', paddingHorizontal: 8, minHeight: 22, justifyContent: 'center', borderRadius: 8 },
});
