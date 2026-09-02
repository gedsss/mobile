import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useMe, useSpeciesList } from '@/api/hooks';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { SpeciesGridCard, SpeciesListRow } from '@/components/species-card';
import { EmptyState, ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { FloatingTabBarSpace, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  CHIP_OPTIONS,
  EMPTY_FILTER,
  FILTER_GROUPS,
  filterSpecies,
  type SpeciesFilter,
} from '@/utils/species';

export default function CatalogScreen() {
  const theme = useTheme();
  const { data: species, isLoading, isError, refetch } = useSpeciesList();
  const { data: me } = useMe();

  const [filter, setFilter] = useState<SpeciesFilter>(EMPTY_FILTER);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const capturedIds = useMemo(
    () => new Set((me?.catchesBySpecies ?? []).map(e => e.speciesId)),
    [me]
  );

  const indexById = useMemo(() => {
    const map: Record<string, number> = {};
    (species ?? []).forEach((s, i) => (map[s.id] = i));
    return map;
  }, [species]);

  const results = useMemo(
    () => (species ? filterSpecies(species, filter, id => capturedIds.has(id)) : []),
    [species, filter, capturedIds]
  );

  const total = species?.length ?? 0;
  const captured = capturedIds.size;
  const pct = total ? Math.round((captured / total) * 100) : 0;
  const set = (patch: Partial<SpeciesFilter>) => setFilter(f => ({ ...f, ...patch }));

  const header = (
    <View>
      <View style={[styles.headerBand, { backgroundColor: theme.headerBackground }]}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText type="caption" themeColor="textSecondary">
              Boa pesca,
            </ThemedText>
            <ThemedText type="title">{me?.username?.split(' ')[0] ?? 'pescador'}</ThemedText>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/collection')}
            style={[styles.levelPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
            accessibilityRole="button"
            accessibilityLabel="Ver coleção">
            <View style={[styles.levelDot, { borderColor: theme.accent }]} />
            <View>
              <ThemedText type="monoSmall" themeColor="textSecondary">
                NÍVEL
              </ThemedText>
              <ThemedText type="bodyBold" style={{ color: theme.accent }}>
                {me?.level ?? 1}
              </ThemedText>
            </View>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.search, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Ionicons name="search" size={15} color={theme.onDarkSecondary} />
            <TextInput
              value={filter.search}
              onChangeText={t => set({ search: t })}
              placeholder="Buscar espécie ou nome científico"
              placeholderTextColor={theme.onDarkSecondary}
              style={[styles.searchInput, { color: theme.onDark }]}
            />
          </View>
          <Pressable
            onPress={() => setFiltersOpen(o => !o)}
            style={[styles.filterBtn, { backgroundColor: filtersOpen ? theme.primary : 'rgba(255,255,255,0.1)' }]}
            accessibilityRole="button"
            accessibilityLabel="Filtros">
            <Ionicons name="options-outline" size={20} color={filtersOpen ? theme.primaryText : theme.onDark} />
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.13)' }]}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
          </View>
          <ThemedText type="monoSmall" themeColor="onDarkSecondary">
            {captured} / {total} espécies
          </ThemedText>
        </View>
      </View>

      {filtersOpen && (
        <View style={[styles.filterPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          {FILTER_GROUPS.map(group => (
            <View key={group.key} style={styles.filterGroup}>
              <ThemedText type="mono" themeColor="textSecondary" uppercase>
                {group.label}
              </ThemedText>
              <View style={styles.wrapRow}>
                {group.options.map(opt => (
                  <Pill
                    key={opt}
                    label={opt}
                    shape="rounded"
                    active={filter[group.key] === opt}
                    onPress={() => set({ [group.key]: opt } as Partial<SpeciesFilter>)}
                  />
                ))}
              </View>
            </View>
          ))}
          <Pressable
            onPress={() => setFilter(EMPTY_FILTER)}
            style={[styles.clearBtn, { backgroundColor: theme.background }]}>
            <ThemedText type="bodyBold">Limpar filtros</ThemedText>
          </Pressable>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {CHIP_OPTIONS.map(chip => (
          <Pill key={chip} label={chip} active={filter.chip === chip} onPress={() => set({ chip })} />
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <View style={styles.toolbarTitle}>
          <ThemedText type="subtitle">Catálogo</ThemedText>
          <ThemedText type="mono" themeColor="textFaint">
            {results.length} de {total}
          </ThemedText>
        </View>
        <View style={[styles.viewToggle, { backgroundColor: theme.backgroundSelected }]}>
          {(['grid', 'list'] as const).map(v => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={[styles.viewBtn, view === v && { backgroundColor: theme.headerBackground }]}
              accessibilityRole="button"
              accessibilityLabel={v === 'grid' ? 'Grade' : 'Lista'}>
              <Ionicons
                name={v === 'grid' ? 'grid' : 'reorder-three'}
                size={16}
                color={view === v ? theme.onDark : theme.textFaint}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <Screen padded={false} topColor="headerBackground">
        <LoadingView label="Carregando catálogo…" />
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
      <FlatList
        key={view}
        data={results}
        keyExtractor={item => item.id}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.column : undefined}
        ListHeaderComponent={header}
        renderItem={({ item }) =>
          view === 'grid' ? (
            <SpeciesGridCard
              species={item}
              index={indexById[item.id]}
              captured={capturedIds.has(item.id)}
            />
          ) : (
            <View style={styles.listPad}>
              <SpeciesListRow
                species={item}
                index={indexById[item.id]}
                captured={capturedIds.has(item.id)}
              />
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="Nada encontrado" subtitle="Ajuste a busca ou os filtros." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: FloatingTabBarSpace + Spacing.xl },
  listPad: { paddingHorizontal: Spacing.md },
  column: { gap: 12, paddingHorizontal: Spacing.md },
  headerBand: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelPill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: Radius.pill, padding: 6, paddingRight: 12 },
  levelDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, backgroundColor: '#0a3d4a' },
  searchRow: { flexDirection: 'row', gap: 9, marginTop: Spacing.md },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, height: 46, borderRadius: 15, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 13.5, fontWeight: '600' },
  filterBtn: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  track: { flex: 1, height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  filterPanel: {
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 14,
  },
  filterGroup: { gap: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  clearBtn: { height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  chipsRow: { gap: 8, paddingHorizontal: Spacing.md, paddingVertical: 14 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 2,
    paddingBottom: 8,
  },
  toolbarTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  viewToggle: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: 11 },
  viewBtn: { width: 30, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
