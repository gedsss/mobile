import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMe, useSpeciesList } from '@/api/hooks';
import type { Species } from '@/api/types';
import { RarityPill } from '@/components/badge';
import { Button } from '@/components/button';
import { FishArt } from '@/components/fish-art';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorView, Skeleton } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { DifficultyLabels, FloatingTabBarSpace, HeadingFont, RARITY_ORDER, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { dexNumber } from '@/utils/species';

type Tab = 'Todas' | 'Capturadas' | 'Faltam';

export default function CollectionScreen() {
  const theme = useTheme();
  const rarity = useRarity();
  const { data: species, isLoading, isError, refetch } = useSpeciesList();
  const { data: me } = useMe();
  const [tab, setTab] = useState<Tab>('Todas');
  const [hint, setHint] = useState<{ s: Species; i: number } | null>(null);

  const capturedIds = useMemo(() => new Set((me?.catchesBySpecies ?? []).map(e => e.speciesId)), [me]);

  const total = species?.length ?? 0;
  const captured = capturedIds.size;
  const pct = total ? Math.round((captured / total) * 100) : 0;

  const byRarity = RARITY_ORDER.map(d => {
    const all = (species ?? []).filter(s => s.difficulty === d);
    return { d, total: all.length, got: all.filter(s => capturedIds.has(s.id)).length };
  }).filter(r => r.total > 0);

  const tiles = (species ?? [])
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (tab === 'Capturadas' ? capturedIds.has(s.id) : tab === 'Faltam' ? !capturedIds.has(s.id) : true));

  if (isError) {
    return (
      <Screen padded={false}>
        <ErrorView onRetry={refetch} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="heading" accessibilityRole="header">
          Minha FishDex
        </ThemedText>

        <View style={[styles.summary, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 4px 0 ${theme.border}` }]}>
          {isLoading ? (
            <>
              <Skeleton width={120} height={40} />
              <Skeleton height={14} />
            </>
          ) : (
            <>
              <View style={styles.summaryTop}>
                <ThemedText type="display">{captured}</ThemedText>
                <ThemedText style={[styles.of, { color: theme.textSecondary }]}>/ {total}</ThemedText>
                <ThemedText type="label" themeColor="textSecondary" style={styles.pct}>
                  {pct}% completa
                </ThemedText>
              </View>
              <View style={styles.segBar} accessibilityLabel={`${captured} de ${total} espécies capturadas`}>
                {byRarity.map(({ d, total: t, got }, idx) => (
                  <View
                    key={d}
                    style={[
                      styles.seg,
                      { flex: t, backgroundColor: theme.backgroundSelected },
                      idx === 0 && styles.segFirst,
                      idx === byRarity.length - 1 && styles.segLast,
                    ]}>
                    <View style={{ width: `${(got / t) * 100}%`, height: '100%', backgroundColor: rarity[d].color }} />
                  </View>
                ))}
              </View>
              <View style={styles.counters}>
                {byRarity.map(({ d, total: t, got }) => (
                  <View key={d} style={styles.counter}>
                    <View style={[styles.dot, { backgroundColor: rarity[d].color }]} />
                    <ThemedText style={styles.counterNum}>
                      {got}/{t}
                    </ThemedText>
                    <ThemedText type="monoSmall">{DifficultyLabels[d]}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.tabs}>
          {(['Todas', 'Capturadas', 'Faltam'] as Tab[]).map(t => (
            <Pill
              key={t}
              label={t}
              count={t === 'Capturadas' ? captured : t === 'Faltam' ? total - captured : undefined}
              active={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </View>

        {!isLoading && tiles.length === 0 ? (
          tab === 'Capturadas' ? (
            <EmptyState
              icon="add"
              title="Nenhuma carta ainda"
              subtitle="Cada captura registrada vira uma carta aqui."
              actionLabel="Registrar captura"
              onAction={() => router.push('/(tabs)/new-catch')}
            />
          ) : (
            <EmptyState icon="trophy-outline" title="Coleção completa!" subtitle="Você pegou todas as espécies do catálogo." />
          )
        ) : (
          <View style={styles.grid}>
            {tiles.map(({ s, i }) => {
              const got = capturedIds.has(s.id);
              const r = rarity[s.difficulty];
              return (
                <Pressable
                  key={s.id}
                  onPress={() => (got ? router.push(`/species/${s.id}`) : setHint({ s, i }))}
                  accessibilityRole="button"
                  accessibilityLabel={got ? `${dexNumber(i)} ${s.name}, capturado` : `${dexNumber(i)}, ainda não capturado. Ver pista`}
                  style={({ pressed }) => [
                    styles.tile,
                    got
                      ? { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 3px ${r.color}, 0 4px 0 ${r.color}` }
                      : { backgroundColor: theme.backgroundSelected, boxShadow: `inset 0 0 0 2px ${theme.border}` },
                    pressed && styles.pressed,
                  ]}>
                  {got ? (
                    <FishArt difficulty={s.difficulty} imageUrl={s.referenceImageUrl} iconSize={44} style={styles.tileArt} />
                  ) : (
                    <FishArt difficulty={s.difficulty} locked iconSize={44} style={styles.tileArt} />
                  )}
                  <ThemedText style={[styles.tileNum, { color: got ? theme.text : theme.textSecondary }]}>{dexNumber(i)}</ThemedText>
                  {!got && <Ionicons name="lock-closed" size={14} color={theme.textSecondary} style={styles.lock} />}
                  <ThemedText style={[styles.tileName, !got && { color: theme.textSecondary }]} numberOfLines={1}>
                    {got ? s.name : '???'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <LockedSheet hint={hint} onClose={() => setHint(null)} />
    </Screen>
  );
}

// Sheet de espécie bloqueada: revela raridade, XP e uma pista — nunca o nome.
function LockedSheet({ hint, onClose }: { hint: { s: Species; i: number } | null; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = hint?.s;
  const clue = s
    ? [
        s.family && `família ${s.family}`,
        s.habitat && (s.habitat === 'Doce' ? 'vive em água doce' : 'vive em água salgada'),
        s.averageSizeCm != null && `mede cerca de ${s.averageSizeCm} cm`,
        s.regions?.length && `aparece em ${s.regions.map(r => r.name).join(', ')}`,
      ]
        .filter(Boolean)
        .join('; ')
    : '';

  return (
    <Modal visible={!!hint} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.overlay }]} onPress={onClose} accessibilityLabel="Fechar" />
      {s && hint && (
        <View style={[styles.sheet, { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 20 }]} accessibilityViewIsModal>
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />
          <View style={[styles.lockedCard, { backgroundColor: theme.backgroundSelected, boxShadow: `inset 0 0 0 3px ${theme.border}` }]}>
            <FishArt difficulty={s.difficulty} locked iconSize={110} style={styles.lockedArt} />
            <ThemedText style={styles.lockedNum}>{dexNumber(hint.i)}</ThemedText>
          </View>
          <ThemedText type="heading">???</ThemedText>
          <View style={styles.hintPills}>
            <RarityPill difficulty={s.difficulty} stars />
            <ThemedText style={[styles.xpTxt, { color: theme.textSecondary }]}>vale {s.baseXp} XP</ThemedText>
          </View>
          {clue.length > 0 && (
            <View style={[styles.clue, { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons name="bulb" size={22} color={theme.accentLip} />
              <ThemedText type="body" style={styles.flex}>
                <ThemedText type="bodyBold">Pista: </ThemedText>
                {clue.charAt(0).toUpperCase() + clue.slice(1)}.
              </ThemedText>
            </View>
          )}
          <View style={styles.sheetActions}>
            <Button
              label="Registrar esta captura"
              onPress={() => {
                onClose();
                router.push({ pathname: '/(tabs)/new-catch', params: { speciesId: s.id } });
              }}
            />
            <Button label="Fechar" variant="secondary" onPress={onClose} />
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: FloatingTabBarSpace + Spacing.xl, gap: 14 },
  summary: { borderRadius: 22, padding: 16, gap: 12, marginBottom: 4 },
  summaryTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  of: { fontFamily: HeadingFont, fontSize: 22, lineHeight: 26 },
  pct: { marginLeft: 'auto' },
  segBar: { flexDirection: 'row', gap: 3, height: 14 },
  seg: { overflow: 'hidden' },
  segFirst: { borderTopLeftRadius: 7, borderBottomLeftRadius: 7 },
  segLast: { borderTopRightRadius: 7, borderBottomRightRadius: 7 },
  counters: { flexDirection: 'row', justifyContent: 'space-between' },
  counter: { alignItems: 'center', gap: 2, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  counterNum: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 19 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', borderRadius: 16, overflow: 'hidden', paddingBottom: 8, marginBottom: 4 },
  pressed: { transform: [{ translateY: 2 }] },
  tileArt: { height: 86, margin: 3, borderRadius: 13 },
  tileNum: { position: 'absolute', top: 9, left: 10, fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  lock: { position: 'absolute', top: 9, right: 9 },
  tileName: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18, paddingHorizontal: 8, paddingTop: 4 },
  backdrop: { flex: 1 },
  sheet: { borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingHorizontal: 22, paddingTop: 10, alignItems: 'center', gap: 10 },
  grabber: { width: 44, height: 5, borderRadius: 3 },
  lockedCard: { width: 170, height: 210, borderRadius: 22, marginTop: 10, overflow: 'hidden' },
  lockedArt: { flex: 1 },
  lockedNum: { position: 'absolute', top: 10, left: 12, fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  hintPills: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpTxt: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
  clue: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, alignSelf: 'stretch' },
  sheetActions: { alignSelf: 'stretch', gap: 4, marginTop: 6 },
});
