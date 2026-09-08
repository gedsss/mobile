import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import { useSpeciesMap } from '@/api/hooks';
import type { FeedCatch, ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { Stripes, type Tone } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, ReactionMeta } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { formatCatchMeta, formatRelativeDate } from '@/utils/format';
import { photoUri } from '@/utils/photo';

function Glyph({ color, glyph, size = 8 }: { color: string; glyph: number | string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: glyph === 999 ? size / 2 : Number(glyph),
        backgroundColor: color,
      }}
    />
  );
}

export function FeedPostCard({ item }: { item: FeedCatch }) {
  const theme = useTheme();
  const rarity = useRarity();
  const queryClient = useQueryClient();
  const speciesMap = useSpeciesMap();
  const species = speciesMap[item.speciesId];

  const [mine, setMine] = useState<ReactionEmoji | null>(item.myReaction ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const counts = useMemo(() => {
    const base: Partial<Record<ReactionEmoji, number>> = { ...(item.reactionCounts ?? {}) };
    if (mine !== (item.myReaction ?? null)) {
      if (item.myReaction) base[item.myReaction] = Math.max(0, (base[item.myReaction] ?? 0) - 1);
      if (mine) base[mine] = (base[mine] ?? 0) + 1;
    }
    return base;
  }, [item.reactionCounts, item.myReaction, mine]);

  const ordered = REACTION_EMOJIS.filter(code => (counts[code] ?? 0) > 0).sort(
    (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)
  );
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const activeMeta = mine ? ReactionMeta[mine] : null;

  const syncFeed = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['catch', item.id] });
  };

  const react = (code: ReactionEmoji) => {
    setPickerOpen(false);
    if (mine === code) {
      setMine(null);
      reactionsApi.removeReaction(item.id).then(syncFeed).catch(() => {});
    } else {
      setMine(code);
      reactionsApi.react(item.id, code).then(syncFeed).catch(() => {});
    }
  };

  const r = species ? rarity[species.difficulty] : rarity.EASY;
  const tone = (species?.tone as Tone) ?? ['#123', '#0b2831'];
  const relative = formatRelativeDate(item.capturedAt);
  const metaChips = [item.locationName, relative, formatCatchMeta(item)].filter(Boolean) as string[];

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: r.border }]}>
      <View style={styles.authorRow}>
        <Avatar
          name={item.authorUsername ?? '?'}
          size={38}
          shape="square"
          tone={(item.authorAvatarTone as Tone) ?? undefined}
          ring={item.mine ? theme.accent : 'rgba(255,255,255,0.5)'}
        />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <ThemedText type="bodyBold" numberOfLines={1}>
              {item.authorUsername ?? 'Amigo'}
            </ThemedText>
            <View style={[styles.nvBadge, { backgroundColor: theme.background }]}>
              <ThemedText type="monoSmall" themeColor="textSecondary">
                NV {item.authorLevel ?? 1}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="monoSmall" themeColor="textFaint">
            {relative}
          </ThemedText>
        </View>
        {item.mine && (
          <View style={styles.youTag}>
            <ThemedText type="monoSmall" style={{ color: '#63d6ab' }}>
              VOCÊ
            </ThemedText>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => router.push(`/species/${item.speciesId}`)}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${species?.name ?? 'espécie'}`}>
        <Stripes tone={tone} imageUrl={photoUri(item.photoUrl)} style={styles.image}>
          <View style={styles.imageScrim} pointerEvents="none" />
          {item.isNewSpecies && (
            <View style={styles.newBadge}>
              <ThemedText type="monoSmall" style={{ color: '#05161b' }}>
                NOVA ESPÉCIE
              </ThemedText>
            </View>
          )}
          <View style={styles.imageFooter}>
            <View style={styles.flex}>
              <View style={styles.rarityRow}>
                <View style={[styles.rarityDot, { backgroundColor: r.color }]} />
                <ThemedText type="monoSmall" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {species ? DifficultyLabels[species.difficulty] : ''}
                </ThemedText>
              </View>
              <ThemedText type="title" style={styles.species}>
                {species?.name ?? 'Espécie'}
              </ThemedText>
              {species?.scientificName && (
                <ThemedText type="caption" style={styles.sci}>
                  {species.scientificName}
                </ThemedText>
              )}
            </View>
            <View style={styles.xpBadge}>
              <ThemedText type="monoSmall" style={{ color: '#04202a' }}>
                +{item.xpAwarded}xp
              </ThemedText>
            </View>
          </View>
        </Stripes>
      </Pressable>

      <View style={styles.metaRow}>
        {metaChips.map((chip, i) => (
          <View key={i} style={[styles.metaChip, { backgroundColor: theme.background }]}>
            <ThemedText type="caption" themeColor="textSecondary">
              {chip}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.reactRow}>
        <View style={styles.reactDots}>
          {ordered.slice(0, 3).map((code, i) => (
            <View
              key={code}
              style={[styles.reactDotWrap, { backgroundColor: ReactionMeta[code].color }, i > 0 && { marginLeft: -7 }]}>
              <Glyph color="rgba(5,22,27,0.55)" glyph={ReactionMeta[code].glyph} />
            </View>
          ))}
        </View>
        <ThemedText type="caption" themeColor="textSecondary" style={styles.flex} numberOfLines={1}>
          {total} {total === 1 ? 'reação' : 'reações'}
          {activeMeta ? ` · você reagiu ${activeMeta.label.toLowerCase()}` : ''}
        </ThemedText>
        <Pressable
          onPress={() => setPickerOpen(o => !o)}
          style={[
            styles.reactBtn,
            {
              backgroundColor: activeMeta ? activeMeta.color : theme.backgroundSelected,
              borderColor: activeMeta ? 'transparent' : theme.border,
            },
          ]}
          accessibilityRole="button">
          <ThemedText type="bodyBold" style={{ color: activeMeta ? '#05161b' : theme.text }}>
            {activeMeta ? activeMeta.label : 'Reagir'}
          </ThemedText>
        </Pressable>
      </View>

      {pickerOpen && (
        <View style={styles.picker}>
          {REACTION_EMOJIS.map(code => (
            <Pressable
              key={code}
              onPress={() => react(code)}
              style={[
                styles.pickerOption,
                {
                  backgroundColor: mine === code ? 'rgba(255,196,77,0.16)' : theme.background,
                  borderColor: mine === code ? theme.accent : theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={ReactionMeta[code].label}>
              <View style={[styles.pickerGlyph, { backgroundColor: ReactionMeta[code].color }]}>
                <Glyph color="rgba(5,22,27,0.55)" glyph={ReactionMeta[code].glyph} size={6} />
              </View>
              <ThemedText type="caption" themeColor="text">
                {ReactionMeta[code].label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { borderWidth: 1.5, borderRadius: 22, overflow: 'hidden' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nvBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  youTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#0c352c' },
  image: { width: '100%', aspectRatio: 1.32 },
  imageScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5,22,27,0.32)' },
  newBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ffc44d', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  imageFooter: { position: 'absolute', left: 14, right: 14, bottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rarityDot: { width: 7, height: 7, borderRadius: 4 },
  species: { color: '#fff', fontSize: 20, lineHeight: 23 },
  sci: { color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' },
  xpBadge: { backgroundColor: 'rgba(255,138,61,0.92)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 14, paddingTop: 11 },
  metaChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9 },
  reactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  reactDots: { flexDirection: 'row' },
  reactDotWrap: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 11, borderWidth: 1 },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 14, paddingBottom: 14 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11, borderWidth: 1 },
  pickerGlyph: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
