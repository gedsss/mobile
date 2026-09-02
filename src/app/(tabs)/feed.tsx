import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { useFeed, type FeedScope } from '@/api/hooks';
import { FeedPostCard } from '@/components/feed-post-card';
import { Segmented } from '@/components/pill';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function FeedScreen() {
  const theme = useTheme();
  const [scope, setScope] = useState<FeedScope>('friends');
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(scope);
  const { data: friendships } = useQuery({
    queryKey: ['friendships'],
    queryFn: friendshipsApi.listFriendships,
  });

  const posts = data?.pages.flat() ?? [];
  const pendingCount = friendships?.pendingReceived.length ?? 0;

  const header = (
    <View>
      <View style={[styles.band, { backgroundColor: theme.headerBackground }]}>
        <View style={styles.bandTop}>
          <View>
            <ThemedText type="heading" style={styles.h1}>
              Feed
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Capturas dos seus amigos
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/new-catch')}
            style={[styles.postBtn, { backgroundColor: theme.primary }]}
            accessibilityRole="button">
            <Ionicons name="add" size={16} color={theme.primaryText} />
            <ThemedText type="bodyBold" style={{ color: theme.primaryText }}>
              Postar
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.segment}>
          <Segmented
            value={scope}
            onChange={setScope}
            options={[
              { value: 'friends', label: 'Amigos' },
              { value: 'mine', label: 'Minhas postagens' },
            ]}
          />
        </View>
      </View>

      {scope === 'friends' && pendingCount > 0 && (
        <Pressable
          onPress={() => router.push('/friends')}
          style={[styles.requests, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
          accessibilityRole="button">
          <View style={[styles.requestsIcon, { backgroundColor: theme.background }]}>
            <Ionicons name="people" size={16} color={theme.accent} />
          </View>
          <View style={styles.flex}>
            <ThemedText type="bodyBold">
              {pendingCount} {pendingCount === 1 ? 'pedido de amizade' : 'pedidos de amizade'}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Aceite para ver as capturas deles aqui
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textFaint} />
        </Pressable>
      )}
    </View>
  );

  return (
    <Screen padded={false} topColor="headerBackground">
      {isLoading ? (
        <LoadingView label="Carregando feed…" />
      ) : isError ? (
        <ErrorView onRetry={refetch} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FeedPostCard item={item} />}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accent} />}
          ListEmptyComponent={
            <EmptyState
              title={scope === 'mine' ? 'Nenhuma postagem sua' : 'Feed vazio'}
              subtitle={
                scope === 'mine'
                  ? 'Registre uma captura para ela aparecer aqui.'
                  : 'Adicione amigos e aguarde as capturas deles.'
              }
            />
          }
          ListFooterComponent={
            posts.length > 0 ? (
              <Pressable
                onPress={() => hasNextPage && fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                style={[styles.loadMore, { backgroundColor: theme.backgroundSelected }]}
                accessibilityRole="button">
                <ThemedText type="bodyBold" themeColor={hasNextPage ? 'text' : 'textFaint'}>
                  {isFetchingNextPage
                    ? 'Carregando…'
                    : hasNextPage
                      ? 'Carregar mais capturas'
                      : scope === 'mine'
                        ? 'Fim do seu diário'
                        : 'Você viu tudo por hoje'}
                </ThemedText>
              </Pressable>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: FloatingTabBarSpace + Spacing.xl },
  band: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  bandTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  h1: { fontSize: 23, lineHeight: 27 },
  postBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14 },
  segment: { marginTop: 14 },
  requests: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  requestsIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  loadMore: { height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
});
