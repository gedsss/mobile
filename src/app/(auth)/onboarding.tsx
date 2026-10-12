import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Difficulty } from '@/api/types';
import { Avatar } from '@/components/avatar';
import { RarityPill } from '@/components/badge';
import { Button } from '@/components/button';
import { FishArt, RarityFrame } from '@/components/fish-art';
import { ThemedText } from '@/components/themed-text';
import { XpTrack } from '@/components/xp-bar';
import { HeadingFont } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useRarity, useTheme } from '@/hooks/use-theme';

const SLIDES = [
  {
    title: 'Toda fisgada\nvira carta',
    body: 'Registre o peixe, ganhe a carta da espécie e complete sua FishDex — do lambari ao pirarucu.',
  },
  {
    title: 'Suba de nível\npescando',
    body: 'Cada espécie vale XP pela raridade. Quanto mais difícil o peixe, maior o salto.',
  },
  {
    title: 'Desafie\na sua turma',
    body: 'Siga amigos, reaja às capturas e veja quem está na frente na coleção.',
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { complete } = useOnboarding();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const finish = async () => {
    await complete();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.top}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(s => s - 1)} style={styles.topBtn} accessibilityRole="button" accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={24} color={theme.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <Ionicons name="fish" size={20} color={theme.primaryText} />
            </View>
            <ThemedText type="title">FishDex</ThemedText>
          </View>
        )}
        {!isLast && (
          <Pressable onPress={finish} style={styles.topBtn} accessibilityRole="button">
            <ThemedText type="bodyBold" themeColor="textSecondary">
              Pular
            </ThemedText>
          </Pressable>
        )}
      </View>

      <View style={styles.stage}>
        <View style={[styles.ring, { borderColor: theme.border }]} />
        <Animated.View key={step} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.illus}>
          {step === 0 && <CardFan />}
          {step === 1 && <LevelBadge />}
          {step === 2 && <Ranking />}
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <ThemedText type="display" accessibilityRole="header">
          {slide.title}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
          {slide.body}
        </ThemedText>
      </View>

      <View style={styles.bottom}>
        <View style={styles.pager} accessibilityLabel={`Passo ${step + 1} de ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { width: i === step ? 28 : 10, backgroundColor: i === step ? theme.primary : theme.border }]} />
          ))}
        </View>
        <Button label={isLast ? 'Bora pescar!' : 'Próximo'} onPress={() => (isLast ? finish() : setStep(s => s + 1))} style={styles.cta} />
      </View>
    </View>
  );
}

function MiniCard({ difficulty, num, name, width, rotate, pill }: { difficulty: Difficulty; num: string; name: string; width: number; rotate: string; pill?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ width, transform: [{ rotate }] }}>
      <RarityFrame difficulty={difficulty} radius={18} thickness={5}>
        <View style={[styles.miniInner, { backgroundColor: theme.backgroundElement }]}>
          <FishArt difficulty={difficulty} iconSize={width * 0.5} style={{ height: width * 0.86 }}>
            <View style={[styles.miniNum, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.miniNumText}>{num}</ThemedText>
            </View>
          </FishArt>
          <View style={styles.miniBody}>
            <ThemedText style={styles.miniName}>{name}</ThemedText>
            {pill && <RarityPill difficulty={difficulty} size="sm" stars />}
          </View>
        </View>
      </RarityFrame>
    </View>
  );
}

function CardFan() {
  return (
    <View style={styles.fan}>
      <View style={[styles.fanItem, { left: 0, top: 50 }]}>
        <MiniCard difficulty="HARD" num="#010" name="Tucunaré-açu" width={132} rotate="-14deg" />
      </View>
      <View style={[styles.fanItem, { right: 0, top: 50 }]}>
        <MiniCard difficulty="EPIC" num="#014" name="Dourado" width={132} rotate="14deg" />
      </View>
      <View style={[styles.fanItem, { left: 76, top: 0 }]}>
        <MiniCard difficulty="LEGENDARY" num="#017" name="Pirarucu" width={160} rotate="0deg" pill />
      </View>
    </View>
  );
}

function XpChip({ difficulty, label, style }: { difficulty: Difficulty; label: string; style: object }) {
  const theme = useTheme();
  const r = useRarity()[difficulty];
  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 4px 0 ${theme.border}` }, style]}>
      <View style={[styles.chipDot, { backgroundColor: r.color }]} />
      <ThemedText style={styles.chipText}>{label}</ThemedText>
    </View>
  );
}

function LevelBadge() {
  const theme = useTheme();
  return (
    <View style={styles.levelWrap}>
      <View style={[styles.levelBadge, { backgroundColor: theme.primary, boxShadow: `0 8px 0 ${theme.primaryLip}` }]}>
        <ThemedText style={[styles.levelCaption, { color: theme.primaryText }]}>NÍVEL</ThemedText>
        <ThemedText style={[styles.levelNum, { color: theme.primaryText }]}>13</ThemedText>
      </View>
      <View style={styles.levelBar}>
        <XpTrack ratio={1} height={16} />
      </View>
      <XpChip difficulty="HARD" label="+35 XP Pintado" style={{ position: 'absolute', left: -6, top: 0, transform: [{ rotate: '-8deg' }] }} />
      <XpChip difficulty="EPIC" label="+60 XP Dourado" style={{ position: 'absolute', right: -6, top: 36, transform: [{ rotate: '7deg' }] }} />
      <XpChip difficulty="EASY" label="+10 XP Traíra" style={{ position: 'absolute', right: 10, top: 276, transform: [{ rotate: '4deg' }] }} />
    </View>
  );
}

function Ranking() {
  const theme = useTheme();
  const rows = [
    { pos: 1, name: 'Rafael Souza', n: 14, me: false },
    { pos: 2, name: 'Você', n: 11, me: true },
    { pos: 3, name: 'Bia Nogueira', n: 9, me: false },
  ];
  return (
    <View style={[styles.rank, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 6px 0 ${theme.border}` }]}>
      <View style={styles.rankHead}>
        <Ionicons name="trophy" size={22} color={theme.accentLip} />
        <ThemedText type="subtitle" style={{ flex: 1 }}>
          Ranking da turma
        </ThemedText>
        <ThemedText type="monoSmall">ESPÉCIES</ThemedText>
      </View>
      {rows.map(r => (
        <View key={r.pos} style={[styles.rankRow, r.me ? { backgroundColor: theme.primary } : r.pos === 1 ? { backgroundColor: theme.backgroundSelected } : null]}>
          <ThemedText style={[styles.rankPos, { color: r.me ? theme.primaryText : theme.textSecondary }]}>{r.pos}</ThemedText>
          <Avatar name={r.me ? 'Marina Costa' : r.name} size={36} />
          <ThemedText type="bodyBold" style={[{ flex: 1 }, r.me && { color: theme.primaryText }]}>
            {r.name}
          </ThemedText>
          <ThemedText style={[styles.rankN, r.me && { color: theme.primaryText }]}>{r.n}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  topBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  ring: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 2, borderStyle: 'dashed' },
  illus: { width: 310, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: 10 },
  body: { fontSize: 17, lineHeight: 25 },
  bottom: { marginTop: 24, alignItems: 'center', gap: 20 },
  pager: { flexDirection: 'row', gap: 6 },
  dot: { height: 10, borderRadius: 5 },
  cta: { alignSelf: 'stretch' },
  fan: { width: 310, height: 290 },
  fanItem: { position: 'absolute' },
  miniInner: { borderRadius: 13, overflow: 'hidden' },
  miniNum: { position: 'absolute', top: 7, left: 7, borderRadius: 8, paddingHorizontal: 7, minHeight: 22, justifyContent: 'center' },
  miniNumText: { fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  miniBody: { padding: 8, gap: 4 },
  miniName: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
  levelWrap: { width: 310, height: 320, alignItems: 'center', justifyContent: 'center', gap: 24 },
  levelBadge: { width: 160, height: 160, borderRadius: 48, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  levelCaption: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  levelNum: { fontFamily: HeadingFont, fontSize: 80, lineHeight: 84 },
  levelBar: { width: 230 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 14, borderRadius: 14 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
  rank: { width: 300, padding: 16, borderRadius: 24, gap: 8 },
  rankHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 4 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 10, borderRadius: 14 },
  rankPos: { width: 18, fontFamily: HeadingFont, fontSize: 18, lineHeight: 22 },
  rankN: { fontFamily: HeadingFont, fontSize: 18, lineHeight: 22 },
});
