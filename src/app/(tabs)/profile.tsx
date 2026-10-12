import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ComponentProps, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as friendshipsApi from '@/api/friendships';
import { useAchievementCatalog, useMe, useMyCatches, useSpeciesList, useUserAchievements } from '@/api/hooks';
import type { Species } from '@/api/types';
import { useAuth } from '@/auth/auth-context';
import { Avatar } from '@/components/avatar';
import { RarityPill } from '@/components/badge';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { XpBar } from '@/components/xp-bar';
import { BrandGradient, FloatingTabBarSpace, HeadingFont, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMonthYear, formatWeight } from '@/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ACH_ICON: Record<string, IconName> = {
  FIRST_CATCH: 'fish',
  TEN_SPECIES: 'albums',
  FIRST_LEGENDARY: 'trophy',
};

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { data: me, isLoading, isError, refetch } = useMe();
  const { data: unlocked } = useUserAchievements(me?.id);
  const { data: catalog } = useAchievementCatalog();
  const { data: myCatches } = useMyCatches();
  const { data: species } = useSpeciesList();
  const { data: friendships } = useQuery({ queryKey: ['friendships'], queryFn: friendshipsApi.listFriendships });

  const speciesById = useMemo(() => {
    const map: Record<string, Species> = {};
    for (const s of species ?? []) map[s.id] = s;
    return map;
  }, [species]);

  if (isLoading) return <LoadingView label="Carregando perfil…" />;
  if (isError || !me) return <ErrorView onRetry={refetch} />;

  const catches = myCatches ?? [];
  const totalCatches = catches.length;
  const distinctSpecies = me.catchesBySpecies.length;
  const biggest = catches.reduce<number | null>((m, c) => (c.lengthCm != null && (m == null || c.lengthCm > m) ? c.lengthCm : m), null);
  const legendaryCaught = me.catchesBySpecies.filter(e => speciesById[e.speciesId]?.difficulty === 'LEGENDARY').length;
  const friendsCount = friendships?.friends.length ?? 0;

  const unlockedByCode = new Map((unlocked ?? []).map(a => [a.code, a]));
  const progressFor: Record<string, [number, number]> = {
    FIRST_CATCH: [Math.min(totalCatches, 1), 1],
    TEN_SPECIES: [Math.min(distinctSpecies, 10), 10],
    FIRST_LEGENDARY: [Math.min(legendaryCaught, 1), 1],
  };

  const confirmSignOut = () =>
    Alert.alert('Sair da conta?', 'Você precisará entrar de novo para registrar capturas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={BrandGradient} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={[styles.hero, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.heroActions}>
          <Pressable onPress={() => router.push('/friends')} style={styles.glassBtn} accessibilityRole="button" accessibilityLabel={`Amigos, ${friendsCount}`}>
            <Ionicons name="people" size={20} color="#fff" />
            <ThemedText style={styles.glassText}>Amigos {friendsCount}</ThemedText>
          </Pressable>
          <Pressable onPress={confirmSignOut} style={[styles.glassBtn, styles.glassIcon]} accessibilityRole="button" accessibilityLabel="Sair da conta">
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { borderColor: theme.accent }]}>
            <Avatar name={me.username} size={76} level={me.level} />
          </View>
          <View style={styles.flex}>
            <ThemedText type="heading" style={styles.onDark} numberOfLines={1}>
              {me.username}
            </ThemedText>
            <ThemedText type="caption" style={styles.onDarkSoft}>
              {me.handle ?? `@${me.username}`}
              {me.memberSince ? ` · desde ${formatMonthYear(me.memberSince)}` : ''}
            </ThemedText>
          </View>
        </View>
        <View style={styles.xp}>
          <XpBar xp={me.xp} onDark />
        </View>
      </LinearGradient>

      <View style={styles.stats}>
        {[
          { value: String(totalCatches), label: 'CAPTURAS' },
          { value: `${distinctSpecies}`, label: `DE ${species?.length ?? 0} ESPÉCIES` },
          { value: biggest != null ? `${biggest} cm` : '—', label: 'MAIOR PEIXE' },
        ].map(stat => (
          <View key={stat.label} style={[styles.stat, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 4px 0 ${theme.border}` }]}>
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
            <ThemedText type="monoSmall" style={styles.center}>
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="title" accessibilityRole="header">
          Conquistas <ThemedText type="title" themeColor="textSecondary">{unlockedByCode.size}/{catalog?.length ?? 0}</ThemedText>
        </ThemedText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achRow}>
        {(catalog ?? []).map(ach => {
          const done = unlockedByCode.has(ach.code);
          const [cur, goal] = progressFor[ach.code] ?? [done ? 1 : 0, 1];
          return (
            <View
              key={ach.code}
              accessible
              accessibilityLabel={`${ach.name}: ${done ? 'desbloqueada' : `${cur} de ${goal}`}`}
              style={[styles.ach, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 4px 0 ${theme.border}` }]}>
              {done ? (
                <LinearGradient colors={['#ffd54a', '#ff9a1f']} style={styles.medal}>
                  <Ionicons name={ACH_ICON[ach.code] ?? 'ribbon'} size={22} color="#3b2000" />
                </LinearGradient>
              ) : (
                <View style={[styles.medal, { backgroundColor: theme.backgroundSelected }]}>
                  <Ionicons name={ACH_ICON[ach.code] ?? 'ribbon'} size={22} color={theme.textSecondary} />
                </View>
              )}
              <ThemedText type="subtitle" numberOfLines={2}>
                {ach.name}
              </ThemedText>
              {ach.description && (
                <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2} style={styles.achDesc}>
                  {ach.description}
                </ThemedText>
              )}
              <View style={[styles.achTrack, { backgroundColor: theme.backgroundSelected }]}>
                <View style={{ width: `${(cur / goal) * 100}%`, height: '100%', backgroundColor: done ? theme.success : theme.primary }} />
              </View>
              <ThemedText style={styles.achCount}>{done ? 'Desbloqueada' : `${cur}/${goal}`}</ThemedText>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.section, styles.diaryHead]}>
        <ThemedText type="title" accessibilityRole="header">
          Diário de capturas
        </ThemedText>
        <Pressable onPress={() => router.push('/(tabs)/collection')} style={styles.link} accessibilityRole="button">
          <ThemedText type="link">Ver coleção</ThemedText>
        </Pressable>
      </View>
      <View style={styles.diary}>
        {catches.length === 0 ? (
          <ThemedText type="body" themeColor="textSecondary">
            Você ainda não registrou nenhuma captura.
          </ThemedText>
        ) : (
          catches.map(c => {
            const s = speciesById[c.speciesId];
            const d = new Date(c.capturedAt);
            const meta = [c.lengthCm != null && `${c.lengthCm} cm`, c.weightGrams != null && formatWeight(c.weightGrams), c.locationName]
              .filter(Boolean)
              .join(' · ');
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/species/${c.speciesId}`)}
                style={[styles.entry, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}
                accessibilityRole="button">
                <View style={[styles.date, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={styles.day}>{String(d.getDate()).padStart(2, '0')}</ThemedText>
                  <ThemedText type="monoSmall">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}</ThemedText>
                </View>
                <View style={styles.flex}>
                  <View style={styles.entryTitle}>
                    <ThemedText type="subtitle" numberOfLines={1} style={styles.shrink}>
                      {s?.name ?? 'Espécie'}
                    </ThemedText>
                    {s && <RarityPill difficulty={s.difficulty} size="sm" />}
                  </View>
                  {meta.length > 0 && (
                    <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                      {meta}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={[styles.entryXp, { color: theme.textSecondary }]}>+{c.xpAwarded}</ThemedText>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  shrink: { flexShrink: 1 },
  center: { textAlign: 'center' },
  content: { paddingBottom: FloatingTabBarSpace + Spacing.xl },
  hero: { paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 14 },
  heroActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  glassBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)' },
  glassIcon: { width: 44, paddingHorizontal: 0, justifyContent: 'center' },
  glassText: { color: '#fff', fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarRing: { borderWidth: 3, borderRadius: 30, padding: 3 },
  onDark: { color: '#ffffff' },
  onDarkSoft: { color: '#d6d0ff' },
  xp: { marginTop: 2 },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 18 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderRadius: 16, marginBottom: 4 },
  statValue: { fontFamily: HeadingFont, fontSize: 24, lineHeight: 28 },
  section: { paddingHorizontal: 20, marginTop: 22 },
  achRow: { gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  ach: { width: 160, padding: 12, borderRadius: 20, gap: 6 },
  medal: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  achDesc: { minHeight: 36 },
  achTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  achCount: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  diaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { minHeight: 44, justifyContent: 'center' },
  diary: { paddingHorizontal: 20, gap: 10, marginTop: 6 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18 },
  date: { width: 46, height: 52, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  day: { fontFamily: HeadingFont, fontSize: 20, lineHeight: 22 },
  entryTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  entryXp: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
});
