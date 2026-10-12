import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as reactionsApi from '@/api/reactions';
import type { ReactionEmoji } from '@/api/types';
import { REACTION_EMOJIS } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ReactionMeta } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Não existe endpoint pra ler a reação previamente registrada nem contagem
// agregada — o estado abaixo é só otimista, válido pra sessão atual.
export function ReactionBar({ catchId }: { catchId: string }) {
  const theme = useTheme();
  const [selected, setSelected] = useState<ReactionEmoji | null>(null);

  const reactMutation = useMutation({ mutationFn: (emoji: ReactionEmoji) => reactionsApi.react(catchId, emoji) });
  const removeMutation = useMutation({ mutationFn: () => reactionsApi.removeReaction(catchId) });

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
