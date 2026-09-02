import { StyleSheet, View } from 'react-native';

import type { Difficulty } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, Radius, Spacing, type Habitat } from '@/constants/theme';
import { useHabitat, useRarity } from '@/hooks/use-theme';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const rarity = useRarity();
  const { color } = rarity[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="monoSmall" style={{ color }}>
        {DifficultyLabels[difficulty]}
      </ThemedText>
    </View>
  );
}

export function RarityTag({ difficulty }: { difficulty: Difficulty }) {
  const rarity = useRarity();
  const { color } = rarity[difficulty];
  return (
    <View style={[styles.tag, { backgroundColor: color }]}>
      <ThemedText type="monoSmall" style={styles.tagInk}>
        {DifficultyLabels[difficulty]}
      </ThemedText>
    </View>
  );
}

export function HabitatChip({ habitat }: { habitat: Habitat }) {
  const habitatPalette = useHabitat();
  const tone = habitatPalette[habitat];
  return (
    <View style={[styles.habitat, { backgroundColor: tone.bg }]}>
      <ThemedText type="caption" style={{ color: tone.ink }}>
        {habitat === 'Doce' ? 'Água doce' : 'Água salgada'}
      </ThemedText>
    </View>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <ThemedText type="caption" style={{ color }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  tagInk: { color: '#05161b' },
  habitat: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
});
