import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ONBOARDING_SLIDES } from '@/api/mock/data';
import { Button } from '@/components/button';
import { Stripes } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { complete } = useOnboarding();
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  const finish = async () => {
    await complete();
    router.replace('/(auth)/login');
  };

  const next = () => (isLast ? finish() : setStep(s => s + 1));

  return (
    <Screen padded={false} topColor="headerBackground">
      <View style={[styles.root, { backgroundColor: theme.headerBackground }]}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <View style={[styles.logoDot, { backgroundColor: theme.headerBackground }]} />
            </View>
            <ThemedText type="title">FishDex</ThemedText>
          </View>
          <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
            <ThemedText type="bodyBold" themeColor="textSecondary">
              Pular
            </ThemedText>
          </Pressable>
        </View>

        <Stripes tone={slide.tone} radius={Radius.card} style={styles.hero} />

        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { width: i === step ? 26 : 10, backgroundColor: i === step ? theme.primary : 'rgba(255,255,255,0.25)' },
              ]}
            />
          ))}
        </View>

        <ThemedText type="mono" style={[styles.kicker, { color: theme.accent }]} uppercase>
          {slide.kicker}
        </ThemedText>
        <ThemedText type="heading" style={styles.title}>
          {slide.title}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
          {slide.body}
        </ThemedText>

        <View style={styles.spacer} />
        <Button label={slide.cta} onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logo: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 9, height: 9, borderRadius: 999 },
  hero: { marginTop: Spacing.lg, height: 210, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  dots: { flexDirection: 'row', gap: 7, marginTop: Spacing.lg },
  dot: { height: 4, borderRadius: 999 },
  kicker: { marginTop: Spacing.lg },
  title: { marginTop: Spacing.sm, fontSize: 31, lineHeight: 35 },
  body: { marginTop: Spacing.sm, fontSize: 15, lineHeight: 23 },
  spacer: { flex: 1, minHeight: Spacing.lg },
});
