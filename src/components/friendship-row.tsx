import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as friendshipsApi from '@/api/friendships';
import { useUser } from '@/api/hooks';
import type { Friendship } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import type { Tone } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function FriendshipRow({
  friendship,
  myId,
  variant,
}: {
  friendship: Friendship;
  myId: string;
  variant: 'friend' | 'received' | 'sent';
}) {
  const otherId = friendship.userAId === myId ? friendship.userBId : friendship.userAId;
  const { data: other } = useUser(otherId);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['friendships'] });
  const acceptMutation = useMutation({
    mutationFn: () => friendshipsApi.acceptFriendship(friendship.id),
    onSuccess: invalidate,
  });
  const blockMutation = useMutation({
    mutationFn: () => friendshipsApi.blockFriendship(friendship.id),
    onSuccess: invalidate,
  });

  return (
    <Card style={styles.row}>
      <Pressable
        style={styles.info}
        onPress={() => variant === 'friend' && router.push(`/user/${otherId}`)}
        accessibilityRole="button">
        <Avatar name={other?.username ?? '...'} shape="square" tone={other?.avatarTone as Tone} />
        <View style={styles.infoText}>
          <ThemedText type="bodyBold">{other?.username ?? 'Carregando...'}</ThemedText>
          {variant === 'friend' && (
            <ThemedText type="monoSmall" themeColor="textSecondary">
              {other?.handle ?? ''} · Nível {other?.level ?? '-'}
            </ThemedText>
          )}
          {variant === 'sent' && (
            <ThemedText type="caption" themeColor="textSecondary">
              Pedido enviado, aguardando resposta
            </ThemedText>
          )}
        </View>
      </Pressable>

      {variant === 'received' && (
        <View style={styles.actions}>
          <Button label="Aceitar" onPress={() => acceptMutation.mutate()} loading={acceptMutation.isPending} />
          <Button
            label="Bloquear"
            variant="danger"
            onPress={() => blockMutation.mutate()}
            loading={blockMutation.isPending}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  info: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  infoText: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: Spacing.xs },
});
