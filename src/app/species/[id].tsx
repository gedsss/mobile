import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode } from 'react';
import { type DimensionValue, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMe, useMyCatches, useSpecies, useSpeciesList } from '@/api/hooks';
import { RarityPill } from '@/components/badge';
import { Button } from '@/components/button';
import { FishArt, RarityFrame } from '@/components/fish-art';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { HeadingFont, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { formatShortDate, formatWeight } from '@/utils/format';
import { dexNumber } from '@/utils/species';

const ARTIFICIAL = /artificial|plug|colher|jig|zara|h[ée]lice|spinner|superf[ií]cie|frog|sapinho|stick|crank|soft|shad/i;

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const rarity = useRarity();
  const { data: species, isLoading, isError, refetch } = useSpecies(id);
  const { data: list } = useSpeciesList();
  const { data: me } = useMe();
  const { data: myCatches } = useMyCatches();

  if (isLoading) return <LoadingView label="Carregando espécie…" />;
  if (isError || !species) return <ErrorView onRetry={refetch} />;

  const r = rarity[species.difficulty];
  const index = Math.max(0, (list ?? []).findIndex(s => s.id === species.id));
  const records = (myCatches ?? []).filter(c => c.speciesId === species.id);
  const count = me?.catchesBySpecies.find(e => e.speciesId === species.id)?._count ?? records.length;
  const captured = count > 0;
  const best = records.reduce<number | null>((max, c) => (c.lengthCm != null && (max == null || c.lengthCm > max) ? c.lengthCm : max), null);

  const tiles = [
    species.family && { label: 'Família', value: species.family },
    species.habitat && { label: 'Habitat', value: species.habitat === 'Doce' ? 'Água doce' : 'Água salgada' },
    species.averageSizeCm != null && { label: 'Tamanho médio', value: `${species.averageSizeCm} cm` },
    species.diet && { label: 'Dieta', value: species.diet },
  ].filter(Boolean) as { label: string; value: string }[];

  const share = () =>
    Share.share({ message: `${species.name} (${species.scientificName ?? ''}) — ${dexNumber(index)} na minha FishDex` }).catch(() => {});

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + Spacing.sm, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <RoundButton icon="chevron-back" label="Voltar" onPress={() => router.back()} />
          <RoundButton icon="share-outline" label="Compartilhar" onPress={share} />
        </View>

        <View style={styles.pad}>
          <RarityFrame difficulty={species.difficulty} radius={24} thickness={5}>
            <FishArt
              difficulty={species.difficulty}
              imageUrl={species.referenceImageUrl}
              iconSize={150}
              radius={19}
              style={styles.hero}>
              <View style={[styles.num, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.numText}>{dexNumber(index)}</ThemedText>
              </View>
              <View style={[styles.status, { backgroundColor: captured ? theme.success : theme.backgroundElement }]}>
                <ThemedText style={[styles.statusText, { color: captured ? theme.successText : theme.textSecondary }]}>
                  {captured ? `CAPTURADO ×${count}` : 'AINDA NÃO CAPTURADO'}
                </ThemedText>
              </View>
              {!species.referenceImageUrl && (
                <ThemedText type="caption" themeColor="textSecondary" style={styles.noPhoto}>
                  Sem foto de referência
                </ThemedText>
              )}
            </FishArt>
          </RarityFrame>
        </View>

        <View style={[styles.pad, styles.titleBlock]}>
          <ThemedText type="display" accessibilityRole="header">
            {species.name}
          </ThemedText>
          {species.scientificName && (
            <ThemedText type="body" themeColor="textSecondary" style={styles.italic}>
              {species.scientificName}
            </ThemedText>
          )}
          <View style={styles.pills}>
            <RarityPill difficulty={species.difficulty} stars />
            <View style={[styles.xpChip, { backgroundColor: theme.accent }]}>
              <ThemedText style={[styles.xpChipText, { color: theme.accentText }]}>{species.baseXp} XP por captura</ThemedText>
            </View>
          </View>
        </View>

        {tiles.length > 0 && (
          <View style={[styles.pad, styles.tiles]}>
            {tiles.map(t => (
              <View key={t.label} style={[styles.tile, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
                <ThemedText type="monoSmall" uppercase>
                  {t.label}
                </ThemedText>
                <ThemedText type="number">{t.value}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {species.description && (
          <ThemedText type="body" themeColor="textSecondary" style={[styles.pad, styles.description]}>
            {species.description}
          </ThemedText>
        )}

        {species.baits && species.baits.length > 0 && (
          <Section title="Iscas que funcionam">
            <View style={styles.tiles}>
              {species.baits.map(bait => {
                const artificial = ARTIFICIAL.test(bait);
                return (
                  <View key={bait} style={[styles.bait, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
                    <View style={[styles.baitIcon, { backgroundColor: theme.backgroundSelected }]}>
                      <Ionicons name={artificial ? 'flash' : 'leaf'} size={18} color={artificial ? theme.primary : theme.success} />
                    </View>
                    <View style={styles.flex}>
                      <ThemedText type="label" numberOfLines={2}>
                        {bait}
                      </ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {artificial ? 'Artificial' : 'Natural'}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </Section>
        )}

        {species.regions && species.regions.length > 0 && (
          <Section title="Onde ocorre">
            <View style={[styles.mapCard, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
              <View style={[styles.map, { backgroundColor: theme.backgroundSelected }]} accessibilityLabel={`Mapa com ${species.mapPins?.length ?? 0} pontos de ocorrência`}>
                {[20, 40, 60, 80].map(p => (
                  <View key={`h${p}`} style={[styles.gridH, { top: `${p}%`, backgroundColor: theme.border }]} />
                ))}
                {[20, 40, 60, 80].map(p => (
                  <View key={`v${p}`} style={[styles.gridV, { left: `${p}%`, backgroundColor: theme.border }]} />
                ))}
                {(species.mapPins ?? []).map(pin => (
                  <View key={pin.label} style={[styles.pin, { left: pin.x as DimensionValue, top: pin.y as DimensionValue }]}>
                    <View style={[styles.pinLabel, { backgroundColor: theme.text }]}>
                      <ThemedText type="monoSmall" style={{ color: theme.background }}>
                        {pin.label}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.pinDot,
                        { backgroundColor: r.color, boxShadow: `0 0 0 3px ${theme.backgroundElement}, 0 0 10px ${r.color}` },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.regions}>
                {species.regions.map(region => (
                  <View key={region.name} style={styles.region}>
                    <Ionicons name="location" size={18} color={r.color} />
                    <ThemedText type="label" style={styles.flex}>
                      {region.name}
                    </ThemedText>
                    <View style={[styles.season, { backgroundColor: theme.backgroundSelected }]}>
                      <ThemedText type="caption" style={styles.bold}>
                        {region.season}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Section>
        )}

        <Section title="Seus registros" aside={captured ? `${count} ${count === 1 ? 'captura' : 'capturas'}` : undefined}>
          {records.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              Você ainda não pegou esta espécie. Registre a primeira e ganhe a carta!
            </ThemedText>
          ) : (
            <View style={styles.records}>
              {records.map(record => (
                <View
                  key={record.id}
                  style={[styles.record, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
                  <FishArt difficulty={species.difficulty} imageUrl={record.photoUrl} iconSize={32} radius={14} style={styles.recordThumb} />
                  <View style={styles.flex}>
                    <ThemedText type="number">
                      {[record.lengthCm != null && `${record.lengthCm} cm`, record.weightGrams != null && formatWeight(record.weightGrams)]
                        .filter(Boolean)
                        .join(' · ') || 'Sem medidas'}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                      {record.locationName ?? 'Local não informado'}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {formatShortDate(record.capturedAt)}
                      {best != null && record.lengthCm === best && records.length > 1 ? ' · recorde pessoal' : ''}
                    </ThemedText>
                  </View>
                  <View style={[styles.xpTag, { backgroundColor: theme.accent }]}>
                    <ThemedText style={[styles.xpTagText, { color: theme.accentText }]}>+{record.xpAwarded} XP</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Section>
      </ScrollView>

      <View style={[styles.dock, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background, boxShadow: `0 -2px 0 ${theme.border}` }]}>
        <Button
          label={`Registrar ${species.name}`}
          badge={`+${species.baseXp} XP`}
          onPress={() => router.push({ pathname: '/(tabs)/new-catch', params: { speciesId: species.id } })}
        />
      </View>
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: 'chevron-back' | 'share-outline'; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.round, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 3px 0 ${theme.border}` }]}>
      <Ionicons name={icon} size={22} color={theme.text} />
    </Pressable>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <View style={[styles.pad, styles.section]}>
      <View style={styles.sectionHead}>
        <ThemedText type="title" accessibilityRole="header">
          {title}
        </ThemedText>
        {aside && (
          <ThemedText type="label" themeColor="textSecondary">
            {aside}
          </ThemedText>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  pad: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  round: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 220 },
  num: { position: 'absolute', top: 12, left: 12, borderRadius: 9, paddingHorizontal: 9, minHeight: 26, justifyContent: 'center' },
  numText: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  status: { position: 'absolute', top: 12, right: 12, borderRadius: 13, paddingHorizontal: 10, minHeight: 26, justifyContent: 'center' },
  statusText: { fontFamily: HeadingFont, fontSize: 13, lineHeight: 17 },
  noPhoto: { position: 'absolute', left: 12, bottom: 10, fontWeight: '700' },
  titleBlock: { marginTop: 18, gap: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
  xpChip: { borderRadius: 999, paddingHorizontal: 10, minHeight: 24, justifyContent: 'center' },
  xpChipText: { fontFamily: HeadingFont, fontSize: 13, lineHeight: 17 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  tile: { width: '48%', flexGrow: 1, padding: 12, borderRadius: 16, gap: 2 },
  description: { marginTop: 14 },
  section: { marginTop: 26, gap: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bait: { width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16 },
  baitIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  mapCard: { marginTop: 12, borderRadius: 20, overflow: 'hidden' },
  map: { height: 170, margin: 4, borderRadius: 16, overflow: 'hidden' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.8 },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, opacity: 0.8 },
  pin: { position: 'absolute', alignItems: 'center', gap: 4, transform: [{ translateX: -20 }, { translateY: -34 }] },
  pinLabel: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  pinDot: { width: 14, height: 14, borderRadius: 7 },
  regions: { padding: 14, gap: 10 },
  region: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  season: { borderRadius: 999, paddingHorizontal: 10, minHeight: 26, justifyContent: 'center' },
  records: { marginTop: 12, gap: 10 },
  record: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18 },
  recordThumb: { width: 64, height: 64 },
  xpTag: { borderRadius: 9, paddingHorizontal: 8, minHeight: 26, justifyContent: 'center' },
  xpTagText: { fontFamily: HeadingFont, fontSize: 13, lineHeight: 17 },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12 },
});
