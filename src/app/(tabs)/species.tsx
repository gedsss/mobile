import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useMe, useSpeciesList } from '@/api/hooks';
import { XpHud } from '@/components/hud';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { SpeciesGridCard, SpeciesListRow } from '@/components/species-card';
import { EmptyState, ErrorView, SkeletonCardGrid } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { FloatingTabBarSpace, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  CHIP_OPTIONS,
  EMPTY_FILTER,
  FILTER_GROUPS,
  activeFilterCount,
  filterSpecies,
  suggestSpecies,
  type SpeciesFilter,
} from '@/utils/species';

export default function CatalogScreen() {
  const theme = useTheme();
  const { data: species, isLoading, isError, refetch } = useSpeciesList();
  const { data: me } = useMe();

  const [filter, setFilter] = useState<SpeciesFilter>(EMPTY_FILTER);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const countById = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of me?.catchesBySpecies ?? []) map.set(e.speciesId, e._count);
    return map;
  }, [me]);

  const indexById = useMemo(() => {
    const map: Record<string, number> = {};
    (species ?? []).forEach((s, i) => (map[s.id] = i));
    return map;
  }, [species]);

  const results = useMemo(
    () => (species ? filterSpecies(species, filter, id => countById.has(id)) : []),
    [species, filter, countById]
  );

  const total = species?.length ?? 0;
  const captured = countById.size;
  const panelCount = activeFilterCount(filter);
  const set = (patch: Partial<SpeciesFilter>) => setFilter(f => ({ ...f, ...patch }));
  const chipCount: Record<string, number> = { Todas: total, Capturadas: captured, Faltando: total - captured };

  const header = (
    <View style={styles.header}>
      <XpHud />

      <View style={styles.titleRow}>
        <ThemedText type="heading">Catálogo</ThemedText>
        <View style={[styles.toggle, { backgroundColor: theme.backgroundSelected }]} accessibilityRole="radiogroup">
          {(['grid', 'list'] as const).map(v => {
            const on = view === v;
            return (
              <Pressable
                key={v}
                onPress={() => setView(v)}
                style={[styles.toggleBtn, on && { backgroundColor: theme.backgroundElement, boxShadow: `0 2px 0 ${theme.border}` }]}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={v === 'grid' ? 'Ver em grade' : 'Ver em lista'}>
                <Ionicons name={v === 'grid' ? 'grid' : 'list'} size={20} color={on ? theme.text : theme.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.search, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          value={filter.search}
          onChangeText={t => set({ search: t })}
          placeholder="Buscar espécie ou nome científico"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Buscar espécie"
          returnKeyType="search"
          style={[styles.searchInput, { color: theme.text }]}
        />
        {filter.search.length > 0 && (
          <Pressable onPress={() => set({ search: '' })} style={styles.clear} accessibilityRole="button" accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsScroll}>
        {CHIP_OPTIONS.map(chip => (
          <Pill key={chip} label={chip} count={chipCount[chip]} active={filter.chip === chip} onPress={() => set({ chip })} />
        ))}
        <Pill
          label={panelCount ? `Filtros · ${panelCount}` : 'Filtros'}
          active={filtersOpen || panelCount > 0}
          trailingIcon={filtersOpen ? 'chevron-up' : 'chevron-down'}
          onPress={() => setFiltersOpen(o => !o)}
        />
      </ScrollView>

      {filtersOpen && (
        <View style={[styles.panel, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 4px 0 ${theme.border}` }]}>
          {FILTER_GROUPS.map(group => (
            <View key={group.key} style={styles.group}>
              <ThemedText type="mono" uppercase>
                {group.label}
              </ThemedText>
              <View style={styles.wrap}>
                {group.options.map(opt => (
                  <Pill
                    key={opt}
                    label={opt}
                    active={filter[group.key] === opt}
                    onPress={() => set({ [group.key]: opt } as Partial<SpeciesFilter>)}
                  />
                ))}
              </View>
            </View>
          ))}
          <Pressable
            onPress={() => setFilter(f => ({ ...EMPTY_FILTER, search: f.search, chip: f.chip }))}
            style={styles.reset}
            accessibilityRole="button">
            <ThemedText type="link">Limpar filtros</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );

  const empty = (() => {
    if (filter.search.trim()) {
      const suggestions = suggestSpecies(species ?? [], filter.search);
      return (
        <EmptyState
          icon="search"
          title="Nenhum peixe com esse nome"
          subtitle="Confira a grafia ou busque pelo nome científico.">
          {suggestions.length > 0 && (
            <View style={styles.suggest}>
              <ThemedText type="label" themeColor="textSecondary">
                Você quis dizer
              </ThemedText>
              <View style={styles.wrap}>
                {suggestions.map(s => (
                  <Pill key={s.id} label={s.name} onPress={() => set({ search: s.name })} />
                ))}
              </View>
            </View>
          )}
        </EmptyState>
      );
    }
    if (filter.chip === 'Capturadas' && captured === 0) {
      return (
        <EmptyState
          icon="add"
          title="Nenhuma carta ainda"
          subtitle="Registre sua primeira captura para ganhar a carta da espécie e seus primeiros XP."
          actionLabel="Registrar primeira captura"
          onAction={() => router.push('/(tabs)/new-catch')}
        />
      );
    }
    return <EmptyState icon="funnel-outline" title="Nada por aqui" subtitle="Nenhuma espécie com esses filtros." />;
  })();

  if (isError) {
    return (
      <Screen padded={false}>
        <ErrorView onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      {isLoading ? (
        <View>
          {header}
          <SkeletonCardGrid />
        </View>
      ) : (
        <FlatList
          key={view}
          data={results}
          keyExtractor={item => item.id}
          numColumns={view === 'grid' ? 2 : 1}
          columnWrapperStyle={view === 'grid' ? styles.column : undefined}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) =>
            view === 'grid' ? (
              <SpeciesGridCard
                species={item}
                index={indexById[item.id]}
                captured={countById.has(item.id)}
                captureCount={countById.get(item.id)}
              />
            ) : (
              <View style={styles.listPad}>
                <SpeciesListRow species={item} index={indexById[item.id]} captured={countById.has(item.id)} />
              </View>
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={empty}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  toggle: { flexDirection: 'row', padding: 3, borderRadius: 14 },
  toggleBtn: { width: 44, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, borderRadius: 16, paddingLeft: 14, paddingRight: 4 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500', paddingVertical: 12 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chipsScroll: { marginHorizontal: -20 },
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 2 },
  panel: { borderRadius: 20, padding: Spacing.md, gap: 14, marginBottom: 4 },
  group: { gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reset: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  suggest: { alignItems: 'center', gap: 8, marginTop: 8 },
  listContent: { paddingBottom: FloatingTabBarSpace + Spacing.xl, flexGrow: 1 },
  listPad: { paddingHorizontal: 20 },
  column: { gap: 12, paddingHorizontal: 20 },
});
