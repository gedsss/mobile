import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Species } from '@/api/types';
import { RarityPill } from '@/components/badge';
import { FishArt, RarityFrame } from '@/components/fish-art';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, HeadingFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dexNumber } from '@/utils/species';

function CapturedBadge({ count }: { count?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.got, { backgroundColor: theme.success }]}>
      <Ionicons name="checkmark" size={14} color={theme.successText} />
      {count != null && count > 0 && (
        <ThemedText style={[styles.gotText, { color: theme.successText }]}>{count}</ThemedText>
      )}
    </View>
  );
}

function DexNumber({ index }: { index: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.num, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={styles.numText}>{dexNumber(index)}</ThemedText>
    </View>
  );
}

// Carta colecionável da grade do catálogo.
export function SpeciesGridCard({
  species,
  index,
  captured,
  captureCount,
}: {
  species: Species;
  index: number;
  captured: boolean;
  captureCount?: number;
  showSci?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push(`/species/${species.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${dexNumber(index)} ${species.name}, ${DifficultyLabels[species.difficulty].toLowerCase()}${captured ? ', capturado' : ''}`}
      style={({ pressed }) => [styles.gridWrap, pressed && styles.pressed]}>
      <RarityFrame difficulty={species.difficulty} style={styles.gridFrame}>
        <View style={[styles.inner, { backgroundColor: theme.backgroundElement }]}>
          <FishArt
            difficulty={species.difficulty}
            imageUrl={species.referenceImageUrl}
            iconSize={56}
            style={[styles.gridArt, !captured && styles.notCaught]}>
            <View style={styles.tl}>
              <DexNumber index={index} />
            </View>
            {captured && (
              <View style={styles.tr}>
                <CapturedBadge count={captureCount} />
              </View>
            )}
          </FishArt>
          <View style={styles.gridBody}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {species.name}
            </ThemedText>
            {species.scientificName && (
              <ThemedText type="caption" themeColor="textSecondary" style={styles.sci} numberOfLines={1}>
                {species.scientificName}
              </ThemedText>
            )}
            <View style={styles.footer}>
              <RarityPill difficulty={species.difficulty} size="sm" />
              <ThemedText style={[styles.xp, { color: theme.textSecondary }]}>{species.baseXp} XP</ThemedText>
            </View>
          </View>
        </View>
      </RarityFrame>
    </Pressable>
  );
}

// Linha da visualização em lista.
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

  return (
    <Pressable
      onPress={() => router.push(`/species/${species.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${dexNumber(index)} ${species.name}, ${DifficultyLabels[species.difficulty].toLowerCase()}${captured ? ', capturado' : ''}`}
      style={({ pressed }) => [
        styles.listRow,
        { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` },
        pressed && styles.pressed,
      ]}>
      <RarityFrame difficulty={species.difficulty} radius={16} thickness={3} style={styles.thumbFrame}>
        <FishArt
          difficulty={species.difficulty}
          imageUrl={species.referenceImageUrl}
          iconSize={34}
          radius={13}
          style={styles.thumb}
        />
      </RarityFrame>
      <View style={styles.listInfo}>
        <View style={styles.listTitle}>
          <ThemedText style={[styles.listNum, { color: theme.textSecondary }]}>{dexNumber(index)}</ThemedText>
          <ThemedText style={styles.name} numberOfLines={1}>
            {species.name}
          </ThemedText>
        </View>
        {species.scientificName && (
          <ThemedText type="caption" themeColor="textSecondary" style={styles.sci} numberOfLines={1}>
            {species.scientificName}
          </ThemedText>
        )}
        <View style={styles.footer}>
          <RarityPill difficulty={species.difficulty} size="sm" />
          <ThemedText style={[styles.xp, { color: theme.textSecondary }]}>{species.baseXp} XP</ThemedText>
        </View>
      </View>
      {captured ? <CapturedBadge /> : <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ translateY: 2 }] },
  gridWrap: { flex: 1, marginBottom: 6 },
  gridFrame: { flex: 1 },
  inner: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  gridArt: { height: 106 },
  notCaught: { opacity: 0.7 },
  tl: { position: 'absolute', top: 8, left: 8 },
  tr: { position: 'absolute', top: 8, right: 8 },
  num: { borderRadius: 8, paddingHorizontal: 7, minHeight: 22, justifyContent: 'center' },
  numText: { fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  got: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 24, paddingHorizontal: 6, borderRadius: 12 },
  gotText: { fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  gridBody: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10, gap: 2 },
  name: { fontFamily: HeadingFont, fontSize: 17, lineHeight: 21, flexShrink: 1 },
  sci: { fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 6 },
  xp: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 10 },
  thumbFrame: { width: 70, height: 70 },
  thumb: { flex: 1 },
  listInfo: { flex: 1, minWidth: 0, gap: 1 },
  listTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  listNum: { fontFamily: HeadingFont, fontSize: 13, lineHeight: 18 },
});
