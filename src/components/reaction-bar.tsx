import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import type { ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ReactionMeta, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// `initialReaction`/`counts` vêm do backend (captura enriquecida). O estado
// local é otimista; ao concluir a chamada, invalida a captura para recarregar
// os contadores reais.
export function ReactionBar({
  catchId,
  initialReaction = null,
  counts,
}: {
  catchId: string;
  initialReaction?: ReactionEmoji | null;
  counts?: Partial<Record<ReactionEmoji, number>>;
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ReactionEmoji | null>(initialReaction);

  const sync = () => {
    queryClient.invalidateQueries({ queryKey: ['catch', catchId] });
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  };

  const reactMutation = useMutation({
    mutationFn: (emoji: ReactionEmoji) => reactionsApi.react(catchId, emoji),
    onSettled: sync,
  });
  const removeMutation = useMutation({
    mutationFn: () => reactionsApi.removeReaction(catchId),
    onSettled: sync,
  });

  const handlePress = (emoji: ReactionEmoji) => {
    if (selected === emoji) {
      setSelected(null);
      removeMutation.mutate();
    } else {
      setSelected(emoji);
      reactMutation.mutate(emoji);
    }
  };

  return (
    <View style={styles.row}>
      {REACTION_EMOJIS.map(code => {
        const meta = ReactionMeta[code];
        const isActive = selected === code;
        const base = counts?.[code] ?? 0;
        // ajusta o contador do backend pelo palpite otimista local
        const delta =
          (isActive && initialReaction !== code ? 1 : 0) -
          (!isActive && initialReaction === code ? 1 : 0);
        const total = Math.max(0, base + delta);
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityLabel={`Reagir com ${meta.label}`}
            accessibilityState={{ selected: isActive }}
            hitSlop={6}
            onPress={() => handlePress(code)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? meta.color : theme.backgroundSelected,
                borderColor: isActive ? 'transparent' : theme.border,
              },
            ]}>
            <View
              style={[
                styles.glyph,
                { backgroundColor: isActive ? 'rgba(5,22,27,0.55)' : meta.color, borderRadius: meta.glyph === 999 ? 999 : Number(meta.glyph) },
              ]}
            />
            <ThemedText type="caption" style={{ color: isActive ? '#05161b' : theme.text }}>
              {meta.label}
              {total > 0 ? ` ${total}` : ''}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xs + 2, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
  },
  glyph: { width: 12, height: 12 },
});
