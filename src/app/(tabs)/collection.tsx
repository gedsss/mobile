import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMe, useSpeciesList } from '@/api/hooks';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { Stripes, type Tone } from '@/components/stripes';
import { EmptyState, ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, FloatingTabBarSpace, RARITY_ORDER, Radius, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { dexNumber } from '@/utils/species';

type Tab = 'Todos' | 'Capturados' | 'Faltando';

export default function CollectionScreen() {
  const theme = useTheme();
  const rarity = useRarity();
  const { data: species, isLoading, isError, refetch } = useSpeciesList();
  const { data: me } = useMe();
  const [tab, setTab] = useState<Tab>('Todos');

  const capturedIds = useMemo(
    () => new Set((me?.catchesBySpecies ?? []).map(e => e.speciesId)),
    [me]
  );

  const total = species?.length ?? 0;
  const captured = capturedIds.size;
  const pct = total ? Math.round((captured / total) * 100) : 0;

  const tiles = (species ?? [])
    .map((s, i) => ({ s, i }))
    .filter(({ s }) =>
      tab === 'Capturados' ? capturedIds.has(s.id) : tab === 'Faltando' ? !capturedIds.has(s.id) : true
    );

  if (isLoading) {
    return (
      <Screen padded={false} topColor="headerBackground">
        <LoadingView label="Carregando coleção…" />
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen padded={false} topColor="headerBackground">
        <ErrorView onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} topColor="headerBackground">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.headerBand, { backgroundColor: theme.headerBackground }]}>
          <ThemedText type="heading" style={styles.h1}>
            Minha coleção
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.sub}>
            Cada espécie registrada abre uma ficha no Dex
          </ThemedText>
          <View style={styles.progressRow}>
            <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.13)' }]}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
            </View>
            <ThemedText type="monoSmall" themeColor="onDarkSecondary">
              {captured} / {total} espécies
            </ThemedText>
          </View>
        </View>

        <View style={styles.tabs}>
          {(['Todos', 'Capturados', 'Faltando'] as Tab[]).map(t => (
            <Pill key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legend}>
          {RARITY_ORDER.map(d => (
            <View key={d} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { borderColor: rarity[d].border, backgroundColor: theme.backgroundElement }]} />
              <ThemedText type="monoSmall" themeColor="textSecondary">
                {DifficultyLabels[d]}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        {tiles.length === 0 ? (
          <EmptyState title="Nada aqui" subtitle="Nenhuma espécie neste filtro." />
        ) : (
          <View style={styles.grid}>
            {tiles.map(({ s, i }) => {
              const isCaptured = capturedIds.has(s.id);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/species/${s.id}`)}
                  style={styles.tileWrap}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.name}${isCaptured ? ', capturado' : ', não capturado'}`}>
                  {isCaptured ? (
                    <Stripes tone={(s.tone as Tone) ?? ['#123', '#0b2831']} radius={15} style={[styles.tile, { borderColor: rarity[s.difficulty].border }]}>
                      <ThemedText type="monoSmall" style={styles.tileNum}>
                        {dexNumber(i).replace('#', '')}
                      </ThemedText>
                      <View style={styles.tileCheck}>
                        <Ionicons name="checkmark" size={9} color="#05161b" />
                      </View>
                    </Stripes>
                  ) : (
                    <View style={[styles.tile, styles.tileLocked, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                      <ThemedText type="monoSmall" themeColor="textFaint" style={styles.tileNumLocked}>
                        {dexNumber(i).replace('#', '')}
                      </ThemedText>
                      <View style={[styles.lockDash, { borderColor: theme.textFaint }]} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: FloatingTabBarSpace + Spacing.xl },
  headerBand: {
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  h1: { marginTop: 4 },
  sub: { marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.md },
  track: { flex: 1, height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md + 4, paddingTop: 14 },
  legend: { gap: 12, paddingHorizontal: Spacing.md + 4, paddingVertical: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 5, borderWidth: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingHorizontal: Spacing.md + 4, paddingTop: 4 },
  tileWrap: { width: '22%', aspectRatio: 1 },
  tile: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'flex-end',
  },
  tileLocked: { alignItems: 'flex-start' },
  tileNum: { color: 'rgba(255,255,255,0.8)' },
  tileNumLocked: {},
  tileCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3fbf8f',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockDash: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
});
