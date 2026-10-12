import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { useFeed, useMe, useUser, type FeedScope } from '@/api/hooks';
import { Avatar } from '@/components/avatar';
import { FeedPostCard } from '@/components/feed-post-card';
import { Segmented } from '@/components/pill';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorView, Skeleton } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { FloatingTabBarSpace, HeadingFont, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function FeedScreen() {
  const theme = useTheme();
  const [scope, setScope] = useState<FeedScope>('friends');
  const { data, isLoading, isError, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(scope);
  const { data: friendships } = useQuery({ queryKey: ['friendships'], queryFn: friendshipsApi.listFriendships });
  const { data: me } = useMe();

  const posts = data?.pages.flat() ?? [];
  const pending = friendships?.pendingReceived ?? [];
  const requesterIds = pending.slice(0, 2).map(f => (f.userAId === me?.id ? f.userBId : f.userAId));

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <ThemedText type="heading" accessibilityRole="header">
          Feed
        </ThemedText>
        <Pressable
          onPress={() => router.push('/friends')}
          style={[styles.friendsBtn, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 3px 0 ${theme.border}` }]}
          accessibilityRole="button"
          accessibilityLabel={pending.length ? `Amigos, ${pending.length} pedidos` : 'Amigos'}>
          <Ionicons name="person-add-outline" size={22} color={theme.text} />
          {pending.length > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary, boxShadow: `0 0 0 2px ${theme.background}` }]}>
              <ThemedText style={[styles.badgeText, { color: theme.primaryText }]}>{pending.length}</ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      <Segmented
        value={scope}
        onChange={setScope}
        options={[
          { value: 'friends', label: 'Amigos' },
          { value: 'mine', label: 'Minhas' },
        ]}
      />

      {scope === 'friends' && pending.length > 0 && (
        <Pressable
          onPress={() => router.push('/friends')}
          style={[styles.requests, { backgroundColor: theme.accent, boxShadow: `0 4px 0 ${theme.accentLip}` }]}
          accessibilityRole="button">
          <View style={styles.stack}>
            {requesterIds.map((id, i) => (
              <RequesterAvatar key={id} id={id} offset={i > 0} />
            ))}
          </View>
          <View style={styles.flex}>
            <ThemedText style={[styles.reqTitle, { color: theme.accentText }]}>
              {pending.length} {pending.length === 1 ? 'pedido de amizade' : 'pedidos de amizade'}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.accentText }}>
              Aceite para ver as capturas aqui
            </ThemedText>
          </View>
          <View style={[styles.reqBtn, { backgroundColor: theme.accentText }]}>
            <ThemedText style={[styles.reqBtnText, { color: theme.accent }]}>Ver</ThemedText>
          </View>
        </Pressable>
      )}
    </View>
  );

  if (isError) {
    return (
      <Screen padded={false}>
        <View style={styles.pad}>{header}</View>
        <ErrorView onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={isLoading ? [] : posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <FeedPostCard item={item} />}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <FeedSkeleton />
          ) : (
            <EmptyState
              icon={scope === 'mine' ? 'camera-outline' : 'people-outline'}
              title={scope === 'mine' ? 'Nenhuma postagem sua' : 'Feed vazio'}
              subtitle={scope === 'mine' ? 'Registre uma captura para ela aparecer aqui.' : 'Adicione amigos e acompanhe as capturas deles.'}
              actionLabel={scope === 'mine' ? 'Registrar captura' : 'Adicionar amigos'}
              onAction={() => router.push(scope === 'mine' ? '/(tabs)/new-catch' : '/friends')}
            />
          )
        }
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          posts.length > 0 ? (
            <ThemedText type="caption" themeColor="textSecondary" style={styles.footer}>
              {isFetchingNextPage ? 'Carregando mais…' : hasNextPage ? ' ' : 'Você viu tudo por hoje'}
            </ThemedText>
          ) : null
        }
      />
    </Screen>
  );
}

function RequesterAvatar({ id, offset }: { id: string; offset: boolean }) {
  const theme = useTheme();
  const { data } = useUser(id);
  return (
    <View style={[styles.stackItem, offset && styles.stackOffset, { boxShadow: `0 0 0 2px ${theme.accent}` }]}>
      <Avatar name={data?.username ?? '?'} size={36} />
    </View>
  );
}

function FeedSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skWrap} accessibilityLabel="Carregando feed" accessibilityState={{ busy: true }}>
      {[0, 1].map(i => (
        <View key={i} style={[styles.skCard, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
          <View style={styles.skRow}>
            <Skeleton width={44} height={44} radius={14} />
            <View style={styles.flex}>
              <Skeleton width="50%" height={14} />
              <Skeleton width="70%" height={11} style={{ marginTop: 8 }} />
            </View>
          </View>
          <Skeleton height={200} radius={18} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pad: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: FloatingTabBarSpace + Spacing.xl, flexGrow: 1 },
  header: { paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  friendsBtn: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -6, top: -6, minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  requests: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingLeft: 12, borderRadius: 20, marginBottom: 4 },
  stack: { flexDirection: 'row' },
  stackItem: { borderRadius: 12 },
  stackOffset: { marginLeft: -10 },
  reqTitle: { fontFamily: HeadingFont, fontSize: 17, lineHeight: 20 },
  reqBtn: { minHeight: 44, paddingHorizontal: 16, borderRadius: 14, justifyContent: 'center' },
  reqBtnText: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
  footer: { textAlign: 'center', paddingVertical: 16 },
  skWrap: { gap: 14 },
  skCard: { borderRadius: 24, padding: 12, gap: 12 },
  skRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
