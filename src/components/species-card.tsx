import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Species } from '@/api/types';
import { HabitatChip } from '@/components/badge';
import { Stripes, type Tone } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, Radius, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { dexNumber } from '@/utils/species';

const FALLBACK_TONE: Tone = ['#123', '#0b2831'];

function CapturedCheck({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.check, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="checkmark" size={size * 0.62} color="#05161b" />
    </View>
  );
}

export function SpeciesGridCard({
  species,
  index,
  captured,
  showSci = true,
}: {
  species: Species;
  index: number;
  captured: boolean;
  showSci?: boolean;
}) {
  const theme = useTheme();
  const rarity = useRarity();
  const tone = (species.tone as Tone) ?? FALLBACK_TONE;
  const r = rarity[species.difficulty];

  return (
    <Pressable
      onPress={() => router.push(`/species/${species.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${species.name}`}
      style={[styles.gridCard, { backgroundColor: theme.backgroundElement, borderColor: r.border }]}>
      <Stripes tone={tone} radius={14} style={styles.gridImage}>
        <View style={[styles.rarityTag, { backgroundColor: r.color }]}>
          <ThemedText type="monoSmall" style={styles.rarityInk}>
            {DifficultyLabels[species.difficulty]}
          </ThemedText>
        </View>
        {captured && <View style={styles.checkTR}><CapturedCheck /></View>}
      </Stripes>
      <View style={styles.gridBody}>
        <View style={styles.nameRow}>
          <ThemedText type="monoSmall" themeColor="textFaint">
            {dexNumber(index)}
          </ThemedText>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.name}>
            {species.name}
          </ThemedText>
        </View>
        {showSci && species.scientificName && (
          <ThemedText type="caption" themeColor="textFaint" style={styles.sci}>
            {species.scientificName}
          </ThemedText>
        )}
        <View style={styles.metaRow}>
          {species.habitat && <HabitatChip habitat={species.habitat} />}
          <ThemedText type="monoSmall" style={{ color: theme.primary }}>
            +{species.baseXp}xp
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

export function SpeciesListRow({
  species,
  index,
  captured,
}: {
  species: Species;
  index: number;
  captured: boolean;
}) {
  const theme = useTheme();
  const rarity = useRarity();
  const tone = (species.tone as Tone) ?? FALLBACK_TONE;
  const r = rarity[species.difficulty];

  return (
    <Pressable
      onPress={() => router.push(`/species/${species.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${species.name}`}
      style={[styles.listRow, { backgroundColor: theme.backgroundElement, borderColor: r.border }]}>
      <Stripes tone={tone} radius={14} style={styles.listThumb}>
        {captured && <View style={styles.checkTR}><CapturedCheck size={16} /></View>}
      </Stripes>
      <View style={styles.listInfo}>
        <View style={styles.nameRow}>
          <ThemedText type="monoSmall" themeColor="textFaint">
            {dexNumber(index)}
          </ThemedText>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.name}>
            {species.name}
          </ThemedText>
        </View>
        {species.scientificName && (
          <ThemedText type="caption" themeColor="textFaint" style={styles.sci}>
            {species.scientificName}
          </ThemedText>
        )}
        <View style={styles.metaRow}>
          {species.habitat && <HabitatChip habitat={species.habitat} />}
          {species.averageSizeCm != null && (
            <View style={[styles.sizeChip, { backgroundColor: theme.background }]}>
              <ThemedText type="caption" themeColor="text">
                ~{species.averageSizeCm} cm
              </ThemedText>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridCard: { flex: 1, borderRadius: Radius.card, borderWidth: 1.5, padding: 8 },
  gridImage: { width: '100%', aspectRatio: 1.42 },
  gridBody: { padding: 4, paddingTop: 8, gap: 3 },
  rarityTag: { position: 'absolute', top: 7, left: 7, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 },
  rarityInk: { color: '#05161b' },
  checkTR: { position: 'absolute', top: 6, right: 6 },
  check: {
    backgroundColor: '#3fbf8f',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { flexShrink: 1 },
  sci: { fontStyle: 'italic' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 10,
  },
  listThumb: { width: 66, height: 66 },
  listInfo: { flex: 1, gap: 2 },
  sizeChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
});
