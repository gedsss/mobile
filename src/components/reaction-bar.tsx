import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import type { ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ReactionMeta } from '@/constants/theme';
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
        const on = selected === code;
        const base = counts?.[code] ?? 0;
        // ajusta o contador do backend pelo palpite otimista local
        const delta =
          (on && initialReaction !== code ? 1 : 0) -
          (!on && initialReaction === code ? 1 : 0);
        const total = Math.max(0, base + delta);
        return (
          <Pressable
            key={code}
            accessibilityRole="button"
            accessibilityLabel={`Reagir com ${meta.label}`}
            accessibilityState={{ selected: on }}
            onPress={() => handlePress(code)}
            style={[
              styles.chip,
              on
                ? { backgroundColor: theme.primary, boxShadow: `0 3px 0 ${theme.primaryLip}` }
                : { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` },
            ]}>
            <Ionicons name={meta.icon} size={18} color={on ? theme.primaryText : meta.color} />
            <ThemedText type="label" style={{ color: on ? theme.primaryText : theme.text }}>
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
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, borderRadius: 14, paddingHorizontal: 12 },
});
