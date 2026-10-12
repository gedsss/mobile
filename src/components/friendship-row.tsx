import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { useUser } from '@/api/hooks';
import type { Friendship } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function FriendshipRow({
  friendship,
  myId,
  variant,
}: {
  friendship: Friendship;
  myId: string;
  variant: 'friend' | 'received' | 'sent';
}) {
  const theme = useTheme();
  const otherId = friendship.userAId === myId ? friendship.userBId : friendship.userAId;
  const { data: other } = useUser(otherId);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['friendships'] });
  const accept = useMutation({ mutationFn: () => friendshipsApi.acceptFriendship(friendship.id), onSuccess: invalidate });
  const block = useMutation({ mutationFn: () => friendshipsApi.blockFriendship(friendship.id), onSuccess: invalidate });

  const name = other?.username ?? 'Carregando…';
  const speciesCount = other?.catchesBySpecies.length;
  const subtitle =
    variant === 'sent'
      ? 'Pedido enviado, aguardando resposta'
      : [other && `Nível ${other.level}`, speciesCount != null && `${speciesCount} espécies`].filter(Boolean).join(' · ');

  return (
    <Pressable
      disabled={variant !== 'friend'}
      onPress={() => router.push(`/user/${otherId}`)}
      accessibilityRole={variant === 'friend' ? 'button' : undefined}
      style={[styles.row, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
      <Avatar name={name} size={46} level={other?.level} />
      <View style={styles.info}>
        <ThemedText type="bodyBold" numberOfLines={1}>
          {name}
        </ThemedText>
        {subtitle.length > 0 && (
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>

      {variant === 'received' && (
        <View style={styles.actions}>
          <Pressable
            onPress={() => block.mutate()}
            disabled={block.isPending}
            style={[styles.action, { backgroundColor: theme.backgroundSelected }]}
            accessibilityRole="button"
            accessibilityLabel={`Bloquear ${name}`}>
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => accept.mutate()}
            disabled={accept.isPending}
            style={[styles.action, { backgroundColor: theme.success, boxShadow: '0 3px 0 rgba(0,0,0,0.2)' }]}
            accessibilityRole="button"
            accessibilityLabel={`Aceitar ${name}`}>
            <Ionicons name="checkmark" size={24} color={theme.successText} />
          </Pressable>
        </View>
      )}
      {variant === 'friend' && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingLeft: 12, borderRadius: 18 },
  info: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
