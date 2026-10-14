import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import { useSpeciesMap } from '@/api/hooks';
import type { FeedCatch, ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { RarityPill } from '@/components/badge';
import { FishArt } from '@/components/fish-art';
import { ThemedText } from '@/components/themed-text';
import { HeadingFont, ReactionMeta } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { formatRelativeDate, formatWeight } from '@/utils/format';

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

  // Mostra as reações com contagem (mais usadas primeiro) e sempre a minha.
  const shown = REACTION_EMOJIS.filter(code => (counts[code] ?? 0) > 0 || code === mine)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, 3);
  if (shown.length === 0) shown.push('FIRE');

  const syncFeed = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['catch', item.id] });
  };

  const react = (code: ReactionEmoji) => {
    setPickerOpen(false);
    if (mine === code) {
      setMine(null);
      reactionsApi.removeReaction(item.id).then(syncFeed).catch(() => setMine(code));
    } else {
      const previous = mine;
      setMine(code);
      reactionsApi.react(item.id, code).then(syncFeed).catch(() => setMine(previous));
    }
  };

  const ringColor = species ? rarity[species.difficulty].color : theme.border;
  const measures = [item.lengthCm != null && `${item.lengthCm} cm`, item.weightGrams != null && formatWeight(item.weightGrams)].filter(
    Boolean
  ) as string[];
  const meta = [formatRelativeDate(item.capturedAt), item.locationName].filter(Boolean).join(' · ');

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 5px 0 ${theme.border}` }]}>
      <View style={styles.authorRow}>
        <Avatar name={item.authorUsername ?? '?'} size={44} level={item.authorLevel} />
        <View style={styles.flex}>
          <ThemedText type="bodyBold" numberOfLines={1}>
            {item.mine ? 'Você' : (item.authorUsername ?? 'Amigo')}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {meta}
          </ThemedText>
        </View>
      </View>

      <View style={styles.titleRow}>
        <ThemedText type="body">Capturou um </ThemedText>
        <ThemedText type="subtitle">{species?.name ?? 'peixe'}</ThemedText>
        {species && <RarityPill difficulty={species.difficulty} size="sm" />}
      </View>

      <Pressable
        onPress={() => router.push(`/species/${item.speciesId}`)}
        accessibilityRole="button"
        accessibilityLabel={`Ver ficha de ${species?.name ?? 'espécie'}`}>
        <FishArt
          difficulty={species?.difficulty ?? 'EASY'}
          imageUrl={item.photoUrl || null}
          iconSize={120}
          radius={18}
          style={[styles.photo, { boxShadow: `inset 0 0 0 3px ${ringColor}` }]}>
          {item.isNewSpecies && (
            <View style={[styles.newTag, { backgroundColor: theme.primary, boxShadow: `0 3px 0 ${theme.primaryLip}` }]}>
              <ThemedText style={[styles.tagText, { color: theme.primaryText }]}>NOVA ESPÉCIE</ThemedText>
            </View>
          )}
          <View style={[styles.xpTag, { backgroundColor: theme.accent }]}>
            <ThemedText style={[styles.tagText, { color: theme.accentText }]}>+{item.xpAwarded} XP</ThemedText>
          </View>
          {measures.length > 0 && (
            <View style={styles.measures}>
              {measures.map(m => (
                <View key={m} style={[styles.measure, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText style={styles.measureText}>{m}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </FishArt>
      </Pressable>

      <View style={styles.reactRow}>
        {shown.map(code => {
          const on = mine === code;
          const meta = ReactionMeta[code];
          return (
            <Pressable
              key={code}
              onPress={() => react(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${meta.label}, ${counts[code] ?? 0} reações`}
              style={[
                styles.rx,
                on
                  ? { backgroundColor: theme.primary, boxShadow: `0 3px 0 ${theme.primaryLip}` }
                  : { backgroundColor: theme.backgroundSelected },
              ]}>
              <Ionicons name={meta.icon} size={18} color={on ? theme.primaryText : meta.color} />
              <ThemedText style={[styles.rxText, { color: on ? theme.primaryText : theme.text }]}>{counts[code] ?? 0}</ThemedText>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setPickerOpen(o => !o)}
          accessibilityRole="button"
          accessibilityLabel={pickerOpen ? 'Fechar reações' : 'Escolher reação'}
          style={[styles.rx, styles.rxAdd, { backgroundColor: theme.backgroundSelected }]}>
          <Ionicons name={pickerOpen ? 'close' : 'happy-outline'} size={20} color={theme.text} />
        </Pressable>
      </View>

      {pickerOpen && (
        <View style={styles.picker}>
          {REACTION_EMOJIS.map(code => {
            const meta = ReactionMeta[code];
            const on = mine === code;
            return (
              <Pressable
                key={code}
                onPress={() => react(code)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={meta.label}
                style={[
                  styles.option,
                  { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${on ? theme.primary : theme.border}` },
                ]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
                <ThemedText type="label">{meta.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { borderRadius: 24, padding: 12, gap: 10, marginBottom: 5 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  photo: { height: 200 },
  newTag: { position: 'absolute', left: 12, top: 12, borderRadius: 10, paddingHorizontal: 10, minHeight: 28, justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
  xpTag: { position: 'absolute', right: 12, top: 12, borderRadius: 10, paddingHorizontal: 10, minHeight: 28, justifyContent: 'center' },
  tagText: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  measures: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', gap: 6 },
  measure: { borderRadius: 10, paddingHorizontal: 10, minHeight: 28, justifyContent: 'center' },
  measureText: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
  reactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  rx: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 14 },
  rxAdd: { marginLeft: 'auto', width: 44, paddingHorizontal: 0, justifyContent: 'center' },
  rxText: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 14 },
});
