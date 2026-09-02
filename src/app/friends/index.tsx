import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { useMe } from '@/api/hooks';
import type { Friendship } from '@/api/types';
import { FriendshipRow } from '@/components/friendship-row';
import { Screen } from '@/components/screen';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'friend' | 'received' | 'sent';

export default function FriendsScreen() {
  const theme = useTheme();
  const { data: me } = useMe();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['friendships'],
    queryFn: friendshipsApi.listFriendships,
  });

  const sections: { title: string; variant: Variant; data: Friendship[] }[] = data
    ? (
        [
          { title: `Pedidos recebidos (${data.pendingReceived.length})`, variant: 'received', data: data.pendingReceived },
          { title: `Amigos (${data.friends.length})`, variant: 'friend', data: data.friends },
          { title: `Pedidos enviados (${data.pendingSent.length})`, variant: 'sent', data: data.pendingSent },
        ] as { title: string; variant: Variant; data: Friendship[] }[]
      ).filter(section => section.data.length > 0)
    : [];

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View>
          <ThemedText type="heading">Amigos</ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Compartilhe seu código para conectar
          </ThemedText>
        </View>
        <Pressable
          onPress={() => router.push('/friends/add')}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Adicionar amigo">
          <Ionicons name="person-add" size={20} color={theme.primaryText} />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingView label="Carregando amigos…" />
      ) : isError || !me ? (
        <ErrorView onRetry={refetch} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
          )}
          renderItem={({ item, section }) => (
            <FriendshipRow friendship={item} myId={me.id} variant={section.variant as Variant} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          SectionSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          ListEmptyComponent={
            <ThemedText type="body" themeColor="textSecondary" style={styles.emptyText}>
              Você ainda não tem amigos por aqui. Toque em {'"'}+{'"'} para adicionar.
            </ThemedText>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  sectionTitle: { marginBottom: Spacing.sm },
  emptyText: { textAlign: 'center', marginTop: Spacing.xl },
});
