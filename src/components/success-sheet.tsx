import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  SlideInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Species } from '@/api/types';
import { Button } from '@/components/button';
import { FishArt, RarityFrame } from '@/components/fish-art';
import { ThemedText } from '@/components/themed-text';
import { XpTrack } from '@/components/xp-bar';
import { HeadingFont, xpProgress } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONFETTI = [
  { left: '10%', top: 30, color: '#e62e5c', rotate: '-20deg' },
  { left: '20%', top: 170, color: '#2563eb', rotate: '35deg' },
  { left: '82%', top: 44, color: '#0f7d47', rotate: '18deg' },
  { left: '76%', top: 180, color: '#8b3fd9', rotate: '-40deg' },
  { left: '34%', top: 12, color: '#ffc21a', rotate: '60deg' },
  { left: '62%', top: 6, color: '#e62e5c', rotate: '-12deg' },
] as const;

export function SuccessSheet({
  visible,
  title,
  body,
  species,
  dexLabel,
  isNewSpecies = false,
  xpBefore,
  xpGained,
  onClose,
  onViewDex,
  onShare,
}: {
  visible: boolean;
  title: string;
  body: string;
  species?: Species | null;
  dexLabel?: string;
  isNewSpecies?: boolean;
  xpBefore: number;
  xpGained: number;
  onClose: () => void;
  onViewDex: () => void;
  onShare?: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const before = xpProgress(xpBefore);
  const after = xpProgress(xpBefore + xpGained);
  const leveledUp = after.level > before.level;

  const spin = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (leveledUp) {
      const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}), 450);
      return () => clearTimeout(t);
    }
  }, [visible, leveledUp]);
  useEffect(() => {
    if (!visible || reduceMotion) return;
    spin.value = 0;
    spin.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
  }, [visible, reduceMotion, spin]);
  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          accessibilityViewIsModal
          accessibilityLabel={`${title}. Mais ${xpGained} XP${leveledUp ? `. Subiu para o nível ${after.level}` : ''}`}
          style={[styles.sheet, { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 20 }]}>
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />

          <View style={styles.stage}>
            <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
              {[0, 30, 60, 90, 120, 150].map(deg => (
                <View key={deg} style={[styles.ray, { backgroundColor: theme.accent, transform: [{ rotate: `${deg}deg` }] }]} />
              ))}
            </Animated.View>
            {CONFETTI.map((c, i) => (
              <Animated.View
                key={i}
                entering={reduceMotion ? undefined : FadeIn.delay(200 + i * 60)}
                style={[styles.confetti, { left: c.left, top: c.top, backgroundColor: c.color, transform: [{ rotate: c.rotate }] }]}
              />
            ))}
            {species && (
              <Animated.View entering={ZoomIn.delay(120).springify()} style={styles.cardWrap}>
                <RarityFrame difficulty={species.difficulty} style={styles.card}>
                  <View style={[styles.cardInner, { backgroundColor: theme.backgroundElement }]}>
                    <FishArt difficulty={species.difficulty} imageUrl={species.referenceImageUrl} iconSize={64} style={styles.cardArt}>
                      {dexLabel && (
                        <View style={[styles.cardNum, { backgroundColor: theme.backgroundElement }]}>
                          <ThemedText style={styles.cardNumText}>{dexLabel}</ThemedText>
                        </View>
                      )}
                    </FishArt>
                    <ThemedText style={styles.cardName} numberOfLines={1}>
                      {species.name}
                    </ThemedText>
                  </View>
                </RarityFrame>
                {isNewSpecies && (
                  <View style={[styles.newTag, { backgroundColor: theme.primary, boxShadow: `0 3px 0 ${theme.primaryLip}` }]}>
                    <ThemedText style={[styles.newTagText, { color: theme.primaryText }]}>NOVA!</ThemedText>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          <ThemedText type="heading" style={styles.center} accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.center}>
            {body}
          </ThemedText>

          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.delay(300).springify()}
            style={[styles.xp, { backgroundColor: theme.accent, boxShadow: `0 5px 0 ${theme.accentLip}` }]}>
            <ThemedText style={[styles.xpText, { color: theme.accentText }]}>+{xpGained} XP</ThemedText>
          </Animated.View>

          <View style={[styles.level, { backgroundColor: theme.backgroundSelected }]}>
            <View style={[styles.levelBadge, { backgroundColor: theme.primary, boxShadow: `0 4px 0 ${theme.primaryLip}` }]}>
              <ThemedText style={[styles.levelCaption, { color: theme.primaryText }]}>NÍVEL</ThemedText>
              <ThemedText style={[styles.levelNum, { color: theme.primaryText }]}>{after.level}</ThemedText>
            </View>
            <View style={styles.levelBody}>
              <View style={styles.levelRow}>
                <ThemedText type="subtitle">{leveledUp ? 'Subiu de nível!' : `Rumo ao nível ${after.level + 1}`}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" style={styles.bold}>
                  {after.xpIntoLevel}/{after.xpForNextLevel} XP
                </ThemedText>
              </View>
              <XpTrack ratio={after.ratio} />
            </View>
            {leveledUp && <Ionicons name="arrow-up-circle" size={26} color={theme.primary} />}
          </View>

          <View style={styles.actions}>
            <Button label="Ver na coleção" onPress={onViewDex} />
            {onShare ? (
              <Button label="Ver no feed" variant="secondary" onPress={onShare} />
            ) : (
              <Button label="Concluir" variant="secondary" onPress={onClose} />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingHorizontal: 22, paddingTop: 10, gap: 6, overflow: 'hidden' },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3 },
  stage: { height: 220, alignItems: 'center', justifyContent: 'center' },
  rays: { position: 'absolute', width: 420, height: 420, alignItems: 'center', justifyContent: 'center' },
  ray: { position: 'absolute', width: 420, height: 22, borderRadius: 11, opacity: 0.22 },
  confetti: { position: 'absolute', width: 10, height: 16, borderRadius: 3 },
  cardWrap: { transform: [{ rotate: '-5deg' }] },
  card: { width: 140 },
  cardInner: { borderRadius: 14, overflow: 'hidden' },
  cardArt: { height: 110 },
  cardNum: { position: 'absolute', top: 7, left: 7, borderRadius: 8, paddingHorizontal: 7, minHeight: 22, justifyContent: 'center' },
  cardNumText: { fontFamily: HeadingFont, fontSize: 12, lineHeight: 16 },
  cardName: { fontFamily: HeadingFont, fontSize: 17, lineHeight: 22, paddingHorizontal: 10, paddingVertical: 6 },
  newTag: { position: 'absolute', right: -16, top: -12, borderRadius: 10, paddingHorizontal: 10, minHeight: 30, justifyContent: 'center', transform: [{ rotate: '10deg' }] },
  newTagText: { fontFamily: HeadingFont, fontSize: 14, lineHeight: 18 },
  center: { textAlign: 'center' },
  xp: { alignSelf: 'center', borderRadius: 20, paddingHorizontal: 22, marginTop: 10, marginBottom: 6 },
  xpText: { fontFamily: HeadingFont, fontSize: 40, lineHeight: 60 },
  level: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, marginTop: 10 },
  levelBadge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  levelCaption: { fontSize: 9, lineHeight: 11, fontWeight: '800', letterSpacing: 1.2 },
  levelNum: { fontFamily: HeadingFont, fontSize: 28, lineHeight: 30 },
  levelBody: { flex: 1, gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' },
  bold: { fontWeight: '700' },
  actions: { marginTop: 14, gap: 4 },
});
