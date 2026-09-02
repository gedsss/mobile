import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useAchievementCatalog, useMe, useMyCatches, useSpeciesList, useUserAchievements } from '@/api/hooks';
import type { Species } from '@/api/types';
import { useAuth } from '@/auth/auth-context';
import { Avatar } from '@/components/avatar';
import { Screen } from '@/components/screen';
import { Stripes, type Tone } from '@/components/stripes';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { XpBar } from '@/components/xp-bar';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCatchMeta, formatMonthYear, formatShortDate } from '@/utils/format';

export default function ProfileScreen() {
  const theme = useTheme();
  const { signOut } = useAuth();
  const { data: me, isLoading, isError, refetch } = useMe();
  const { data: unlocked } = useUserAchievements(me?.id);
  const { data: catalog } = useAchievementCatalog();
  const { data: myCatches } = useMyCatches();
  const { data: species } = useSpeciesList();

  const speciesById = useMemo(() => {
    const map: Record<string, Species> = {};
    for (const s of species ?? []) map[s.id] = s;
    return map;
  }, [species]);

  if (isLoading) {
    return <LoadingView label="Carregando perfil…" />;
  }
  if (isError || !me) return <ErrorView onRetry={refetch} />;

  const totalCatches = myCatches?.length ?? 0;
  const distinctSpecies = me.catchesBySpecies.length;
  const rareCaught = me.catchesBySpecies.filter(e => {
    const d = speciesById[e.speciesId]?.difficulty;
    return d === 'EPIC' || d === 'LEGENDARY';
  }).length;
  const legendaryCaught = me.catchesBySpecies.filter(
    e => speciesById[e.speciesId]?.difficulty === 'LEGENDARY'
  ).length;

  const unlockedByCode = new Map((unlocked ?? []).map(a => [a.code, a]));
  const progressFor: Record<string, string> = {
    FIRST_CATCH: `${Math.min(totalCatches, 1)}/1`,
    TEN_SPECIES: `${Math.min(distinctSpecies, 10)}/10`,
    FIRST_LEGENDARY: `${Math.min(legendaryCaught, 1)}/1`,
  };

  const diary = (myCatches ?? []).map(c => ({
    ...c,
    name: speciesById[c.speciesId]?.name ?? 'Espécie',
    tone: (speciesById[c.speciesId]?.tone as Tone) ?? (['#0a3d4a', '#073040'] as Tone),
  }));

  return (
    <ScreenScroll>
      <View style={[styles.band, { backgroundColor: theme.headerBackground }]}>
        <View style={styles.bandTop}>
          <View style={styles.avatarWrap}>
            <Avatar name={me.username} size={66} shape="square" tone={me.avatarTone as Tone} ring={theme.accent} />
            <View style={[styles.nvBadge, { backgroundColor: theme.accent }]}>
              <ThemedText type="monoSmall" style={{ color: '#05161b' }}>
                Nv {me.level}
              </ThemedText>
            </View>
          </View>
          <View style={styles.flex}>
            <ThemedText type="title">{me.username}</ThemedText>
            <ThemedText type="monoSmall" themeColor="textSecondary">
              {me.handle ?? '@' + me.username} · desde {me.memberSince ? formatMonthYear(me.memberSince) : '—'}
            </ThemedText>
          </View>
          <Pressable
            onPress={signOut}
            style={[styles.logout, { backgroundColor: 'rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.12)' }]}
            accessibilityRole="button">
            <ThemedText type="caption" themeColor="onDark">
              Sair
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.xp}>
          <XpBar xp={me.xp} />
        </View>

        <View style={styles.stats}>
          {[
            { value: String(totalCatches), label: 'capturas' },
            { value: `${distinctSpecies}/${species?.length ?? 0}`, label: 'espécies' },
            { value: String(rareCaught), label: 'raros' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.08)' }]}>
              <ThemedText type="title" style={styles.statValue}>
                {stat.value}
              </ThemedText>
              <ThemedText type="caption" themeColor="onDarkSecondary">
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <ThemedText type="subtitle">Conquistas</ThemedText>
        <View style={styles.achList}>
          {(catalog ?? []).map(ach => {
            const done = unlockedByCode.get(ach.code);
            return (
              <View
                key={ach.code}
                style={[styles.achRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: done ? 1 : 0.55 }]}>
                <View style={[styles.achBadge, { backgroundColor: done ? theme.accent : theme.backgroundSelected }]}>
                  <Ionicons name={done ? 'trophy' : 'lock-closed'} size={16} color={done ? '#05161b' : theme.textFaint} />
                </View>
                <View style={styles.flex}>
                  <ThemedText type="bodyBold">{ach.name}</ThemedText>
                  {ach.description && (
                    <ThemedText type="caption" themeColor="textSecondary">
                      {ach.description}
                    </ThemedText>
                  )}
                </View>
                <ThemedText type="monoSmall" style={{ color: done ? theme.success : theme.textFaint }}>
                  {done ? `DESBLOQUEADA · ${formatShortDate(done.unlockedAt)}` : progressFor[ach.code] ?? ''}
                </ThemedText>
              </View>
            );
          })}
        </View>

        <View style={styles.diaryHeader}>
          <ThemedText type="subtitle">Diário de pesca</ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/collection')} hitSlop={8}>
            <ThemedText type="caption" style={{ color: theme.primary }}>
              Ver coleção
            </ThemedText>
          </Pressable>
        </View>
        <View style={styles.diaryList}>
          {diary.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              Você ainda não registrou nenhuma captura.
            </ThemedText>
          ) : (
            diary.map(entry => (
              <Pressable
                key={entry.id}
                onPress={() => router.push(`/species/${entry.speciesId}`)}
                style={[styles.diaryRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
                accessibilityRole="button">
                <Stripes tone={entry.tone} radius={13} style={styles.diaryThumb} />
                <View style={styles.flex}>
                  <ThemedText type="subtitle" style={styles.diaryName}>
                    {entry.name}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {entry.locationName ?? 'Local não informado'}
                  </ThemedText>
                  <ThemedText type="monoSmall" themeColor="textFaint">
                    {formatCatchMeta(entry)}
                  </ThemedText>
                </View>
                <ThemedText type="monoSmall" style={{ color: theme.primary }}>
                  +{entry.xpAwarded}xp
                </ThemedText>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </ScreenScroll>
  );
}

function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <Screen padded={false} topColor="headerBackground">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { paddingBottom: FloatingTabBarSpace + Spacing.xl },
  band: {
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  bandTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { alignItems: 'center' },
  nvBadge: { marginTop: -8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  logout: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  xp: { marginTop: 20 },
  stats: { flexDirection: 'row', gap: 9, marginTop: 16 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 15, padding: 11 },
  statValue: { fontSize: 19, lineHeight: 22 },
  body: { paddingHorizontal: Spacing.md + 2, paddingTop: 18 },
  achList: { marginTop: 10, gap: 9 },
  achRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 12 },
  achBadge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  diaryHeader: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diaryList: { marginTop: 10, gap: 9 },
  diaryRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 18, padding: 10 },
  diaryThumb: { width: 54, height: 54 },
  diaryName: { fontSize: 15.5, lineHeight: 19 },
});
