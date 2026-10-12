import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { useMe } from '@/api/hooks';
import type { Friendship } from '@/api/types';
import { AddFriendForm, FriendCodeCard } from '@/components/friend-code';
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
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['friendships'], queryFn: friendshipsApi.listFriendships });

  const sections: { title: string; count: number; variant: Variant; data: Friendship[] }[] = data
    ? (
        [
          { title: 'Pedidos', count: data.pendingReceived.length, variant: 'received', data: data.pendingReceived },
          { title: 'Seus amigos', count: data.friends.length, variant: 'friend', data: data.friends },
          { title: 'Enviados', count: data.pendingSent.length, variant: 'sent', data: data.pendingSent },
        ] as { title: string; count: number; variant: Variant; data: Friendship[] }[]
      ).filter(section => section.data.length > 0)
    : [];

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.back, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 3px 0 ${theme.border}` }]}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <ThemedText type="heading" accessibilityRole="header">
          Amigos
        </ThemedText>
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
          keyboardShouldPersistTaps="handled"
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.top}>
              <FriendCodeCard />
              <AddFriendForm />
            </View>
          }
          renderSectionHeader={({ section }) => (
            <ThemedText type="title" style={styles.sectionTitle}>
              {section.title} <ThemedText type="title" themeColor="textSecondary">{section.count}</ThemedText>
            </ThemedText>
          )}
          renderItem={({ item, section }) => <FriendshipRow friendship={item} myId={me.id} variant={section.variant} />}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          SectionSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <ThemedText type="body" themeColor="textSecondary" style={styles.emptyText}>
              Você ainda não tem amigos por aqui. Compartilhe seu código para começar!
            </ThemedText>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  back: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: Spacing.xxl },
  top: { gap: 16, paddingTop: 8, paddingBottom: 8 },
  sectionTitle: { marginTop: 14, marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: Spacing.lg },
});
