import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { type DimensionValue, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMe, useMyCatches, useSpecies } from '@/api/hooks';
import { RarityTag } from '@/components/badge';
import { Button } from '@/components/button';
import { Stripes, type Tone } from '@/components/stripes';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, Radius, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { formatCatchMeta } from '@/utils/format';

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const rarity = useRarity();
  const { data: species, isLoading, isError, refetch } = useSpecies(id);
  const { data: me } = useMe();
  const { data: myCatches } = useMyCatches();

  if (isLoading) return <LoadingView label="Carregando espécie…" />;
  if (isError || !species) return <ErrorView onRetry={refetch} />;

  const r = rarity[species.difficulty];
  const tone = (species.tone as Tone) ?? ['#123', '#0b2831'];
  const records = (myCatches ?? []).filter(c => c.speciesId === species.id);
  const captured = records.length > 0 || !!me?.catchesBySpecies.find(e => e.speciesId === species.id);

  const specs: { label: string; value: string; italic?: boolean }[] = [
    species.scientificName ? { label: 'Nome científico', value: species.scientificName, italic: true } : null,
    species.family ? { label: 'Família', value: species.family } : null,
    species.habitat ? { label: 'Habitat', value: species.habitat === 'Doce' ? 'Água doce' : 'Água salgada' } : null,
    species.averageSizeCm != null ? { label: 'Tamanho médio', value: `~${species.averageSizeCm} cm` } : null,
    species.diet ? { label: 'Dieta', value: species.diet } : null,
  ].filter(Boolean) as { label: string; value: string; italic?: boolean }[];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Stripes tone={tone} style={styles.hero}>
          <View style={styles.scrimTop} pointerEvents="none" />
          <View style={styles.scrimStack} pointerEvents="none">
            {[0.08, 0.16, 0.28, 0.42, 0.6].map((o, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: `rgba(5,22,27,${o})` }} />
            ))}
          </View>
          <View style={[styles.heroTop, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable
              onPress={() => router.back()}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
            <View style={[styles.numBadge, { backgroundColor: 'rgba(5,22,27,0.42)' }]}>
              <ThemedText type="monoSmall" style={{ color: '#fff' }}>
                {species.difficulty === 'LEGENDARY' ? 'LENDÁRIO' : species.family ?? species.name}
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.tagRow}>
              <RarityTag difficulty={species.difficulty} />
              {captured && (
                <View style={styles.capturedTag}>
                  <ThemedText type="monoSmall" style={{ color: '#05161b' }}>
                    CAPTURADO
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="heading" style={styles.heroName}>
              {species.name}
            </ThemedText>
            {species.scientificName && (
              <ThemedText type="body" style={styles.heroSci}>
                {species.scientificName}
              </ThemedText>
            )}
          </View>
        </Stripes>

        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.quickStats}>
            {[
              { label: 'Tamanho méd.', value: species.averageSizeCm != null ? `${species.averageSizeCm} cm` : '—' },
              { label: 'XP base', value: `+${species.baseXp}` },
              { label: 'Raridade', value: DifficultyLabels[species.difficulty] },
            ].map(stat => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <ThemedText type="monoSmall" themeColor="textFaint" uppercase>
                  {stat.label}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.statValue}>
                  {stat.value}
                </ThemedText>
              </View>
            ))}
          </View>

          {species.description && (
            <ThemedText type="body" themeColor="textSecondary" style={styles.description}>
              {species.description}
            </ThemedText>
          )}

          {specs.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.section}>
                Ficha técnica
              </ThemedText>
              <View style={[styles.specCard, { backgroundColor: theme.backgroundElement, borderColor: r.border }]}>
                {specs.map((spec, i) => (
                  <View
                    key={spec.label}
                    style={[styles.specRow, i < specs.length - 1 && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 }]}>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {spec.label}
                    </ThemedText>
                    <ThemedText type="bodyBold" style={[styles.specValue, spec.italic && styles.italic]}>
                      {spec.value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {species.baits && species.baits.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.section}>
                Iscas recomendadas
              </ThemedText>
              <View style={styles.baitWrap}>
                {species.baits.map(bait => (
                  <View
                    key={bait}
                    style={[styles.bait, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <View style={[styles.baitDot, { backgroundColor: theme.accent }]} />
                    <ThemedText type="caption" themeColor="text">
                      {bait}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {species.regions && species.regions.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <ThemedText type="subtitle">Onde encontrar</ThemedText>
                <ThemedText type="monoSmall" themeColor="textSecondary">
                  {species.regions.length} {species.regions.length === 1 ? 'região' : 'regiões'}
                </ThemedText>
              </View>
              <View style={[styles.mapCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <View style={styles.map}>
                  {[18, 38, 58, 78].map(top => (
                    <View key={`h${top}`} style={[styles.mapLineH, { top: `${top}%`, backgroundColor: theme.borderSubtle }]} />
                  ))}
                  {[20, 40, 60, 80].map(left => (
                    <View key={`v${left}`} style={[styles.mapLineV, { left: `${left}%`, backgroundColor: theme.borderSubtle }]} />
                  ))}
                  {(species.mapPins ?? []).map(pin => (
                    <View
                      key={pin.label}
                      style={[styles.pin, { left: pin.x as DimensionValue, top: pin.y as DimensionValue }]}>
                      <View style={[styles.pinLabel, { backgroundColor: theme.headerBackground }]}>
                        <ThemedText type="monoSmall" style={{ color: '#fff' }}>
                          {pin.label}
                        </ThemedText>
                      </View>
                      <View style={[styles.pinDot, { backgroundColor: theme.primary }]} />
                    </View>
                  ))}
                </View>
                <View style={styles.regionList}>
                  {species.regions.map(region => (
                    <View key={region.name} style={styles.regionRow}>
                      <View style={[styles.regionDot, { backgroundColor: theme.primary }]} />
                      <ThemedText type="caption" themeColor="text" style={styles.flex}>
                        {region.name}
                      </ThemedText>
                      <ThemedText type="monoSmall" themeColor="textSecondary">
                        {region.season}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {records.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.section}>
                Seus registros
              </ThemedText>
              <View style={styles.recordList}>
                {records.map(record => (
                  <View
                    key={record.id}
                    style={[styles.recordRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <Stripes tone={tone} radius={12} style={styles.recordThumb} />
                    <View style={styles.flex}>
                      <ThemedText type="bodyBold">{record.locationName ?? 'Local não informado'}</ThemedText>
                      <ThemedText type="monoSmall" themeColor="textSecondary">
                        {formatCatchMeta(record)}
                      </ThemedText>
                    </View>
                    <ThemedText type="monoSmall" style={{ color: theme.primary }}>
                      +{record.xpAwarded}xp
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background }]}>
        <Button
          label={captured ? 'Registrar nova captura' : 'Registrar esta captura'}
          onPress={() => router.push({ pathname: '/(tabs)/new-catch', params: { speciesId: species.id } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  hero: { height: 310, width: '100%' },
  scrimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '28%', backgroundColor: 'rgba(5,22,27,0.4)' },
  scrimStack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', flexDirection: 'column' },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 18 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,22,27,0.42)',
  },
  numBadge: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 13 },
  heroBottom: { position: 'absolute', left: 22, right: 22, bottom: 26, gap: 6 },
  tagRow: { flexDirection: 'row', gap: 8 },
  capturedTag: { backgroundColor: 'rgba(63,191,143,0.92)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  heroName: { color: '#fff', fontSize: 30, lineHeight: 33 },
  heroSci: { color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', fontSize: 13.5 },
  sheet: {
    marginTop: -22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  quickStats: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 11 },
  statValue: { marginTop: 3 },
  description: { marginTop: 16, lineHeight: 22 },
  section: { marginTop: 20 },
  sectionRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  specCard: { marginTop: 10, borderWidth: 1.5, borderRadius: Radius.lg, overflow: 'hidden' },
  specRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingHorizontal: 15, paddingVertical: 13 },
  specValue: { textAlign: 'right', flexShrink: 1 },
  italic: { fontStyle: 'italic', fontWeight: '400' },
  baitWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bait: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  baitDot: { width: 8, height: 8, borderRadius: 4 },
  mapCard: { marginTop: 10, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  map: { height: 160, backgroundColor: '#07222a' },
  mapLineH: { position: 'absolute', left: 0, right: 0, height: 1 },
  mapLineV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  pin: { position: 'absolute', alignItems: 'center', gap: 3, transform: [{ translateX: -14 }, { translateY: -26 }] },
  pinLabel: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  pinDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 2.5, borderColor: '#fff' },
  regionList: { padding: 15, gap: 9 },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  regionDot: { width: 7, height: 7, borderRadius: 4 },
  recordList: { marginTop: 10, gap: 9 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 16, padding: 9 },
  recordThumb: { width: 52, height: 52 },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: Spacing.md,
  },
});
