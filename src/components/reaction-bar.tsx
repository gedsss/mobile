import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import type { ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ReactionMeta, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Não existe endpoint pra ler a reação previamente registrada nem contagem
// agregada — o estado abaixo é só otimista, válido pra sessão atual.
export function ReactionBar({ catchId }: { catchId: string }) {
  const theme = useTheme();
  const [selected, setSelected] = useState<ReactionEmoji | null>(null);

  const reactMutation = useMutation({
    mutationFn: (emoji: ReactionEmoji) => reactionsApi.react(catchId, emoji),
  });
  const removeMutation = useMutation({
    mutationFn: () => reactionsApi.removeReaction(catchId),
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
