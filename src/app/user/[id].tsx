import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import {
  useSpeciesList,
  useUser,
  useUserAchievements,
  useUserCatches,
} from '@/api/hooks';
import type { Species } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { Screen } from '@/components/screen';
import { Stripes, type Tone } from '@/components/stripes';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { XpBar } from '@/components/xp-bar';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMonthYear } from '@/utils/format';
import { photoUri } from '@/utils/photo';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const { data: achievements } = useUserAchievements(id);
  const { data: species } = useSpeciesList();
  const { data: userCatches } = useUserCatches(id);

  const speciesById = useMemo(() => {
    const map: Record<string, Species> = {};
    for (const s of species ?? []) map[s.id] = s;
    return map;
  }, [species]);

  if (isLoading) return <LoadingView label="Carregando perfil…" />;
  if (isError || !user) return <ErrorView onRetry={refetch} />;

  const totalCatches = user.catchesBySpecies.reduce((a, e) => a + e._count, 0);

  return (
    <Screen padded={false} topColor="headerBackground">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.band, { backgroundColor: theme.headerBackground }]}>
          <View style={styles.bandTop}>
            <View style={styles.avatarWrap}>
              <Avatar name={user.username} size={66} shape="square" tone={user.avatarTone as Tone} ring={theme.accent} />
              <View style={[styles.nvBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="monoSmall" style={{ color: '#05161b' }}>
                  Nv {user.level}
                </ThemedText>
              </View>
            </View>
            <View style={styles.flex}>
              <ThemedText type="title">{user.username}</ThemedText>
              <ThemedText type="monoSmall" themeColor="textSecondary">
                {user.handle ?? '@' + user.username}
                {user.memberSince ? ` · desde ${formatMonthYear(user.memberSince)}` : ''}
              </ThemedText>
            </View>
          </View>
          <View style={styles.xp}>
            <XpBar xp={user.xp} />
          </View>
          <View style={styles.stats}>
            {[
              { value: String(totalCatches), label: 'capturas' },
              { value: `${user.catchesBySpecies.length}/${species?.length ?? 0}`, label: 'espécies' },
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
          {achievements && achievements.length > 0 ? (
            <View style={styles.list}>
              {achievements.map(a => (
                <View key={a.code} style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                    <Ionicons name="trophy" size={16} color="#05161b" />
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type="bodyBold">{a.name}</ThemedText>
                    {a.description && (
                      <ThemedText type="caption" themeColor="textSecondary">
                        {a.description}
                      </ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText type="body" themeColor="textSecondary" style={styles.empty}>
              Nenhuma conquista desbloqueada ainda.
            </ThemedText>
          )}

          {userCatches && userCatches.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.section}>
                Capturas
              </ThemedText>
              <View style={styles.photoGrid}>
                {userCatches.map(item => {
                  const s = speciesById[item.speciesId];
                  return (
                    <Pressable
                      key={item.id}
                      style={styles.photoCell}
                      onPress={() => router.push(`/catch/${item.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver captura de ${s?.name ?? 'espécie'}`}>
                      <Stripes
                        tone={(s?.tone as Tone) ?? (['#0a3d4a', '#073040'] as Tone)}
                        imageUrl={photoUri(item.photoUrl)}
                        radius={12}
                        style={styles.photo}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <ThemedText type="subtitle" style={styles.section}>
            Capturas por espécie
          </ThemedText>
          <View style={styles.list}>
            {user.catchesBySpecies.length === 0 ? (
              <ThemedText type="body" themeColor="textSecondary">
                Nenhuma captura registrada ainda.
              </ThemedText>
            ) : (
              user.catchesBySpecies.map(entry => {
                const s = speciesById[entry.speciesId];
                return (
                  <View key={entry.speciesId} style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <Stripes tone={(s?.tone as Tone) ?? (['#0a3d4a', '#073040'] as Tone)} radius={11} style={styles.thumb} />
                    <ThemedText type="bodyBold" style={styles.flex}>
                      {s?.name ?? 'Espécie'}
                    </ThemedText>
                    <ThemedText type="monoSmall" themeColor="textSecondary">
                      {entry._count}x
                    </ThemedText>
                  </View>
                );
              })
            )}
          </View>
        </View>
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
  xp: { marginTop: 20 },
  stats: { flexDirection: 'row', gap: 9, marginTop: 16 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 15, padding: 11 },
  statValue: { fontSize: 19, lineHeight: 22 },
  body: { paddingHorizontal: Spacing.md + 2, paddingTop: 18 },
  section: { marginTop: 22 },
  list: { marginTop: 10, gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12 },
  badge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 40, height: 40 },
  empty: { marginTop: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  photoCell: { width: '31.5%', aspectRatio: 1 },
  photo: { flex: 1 },
});
