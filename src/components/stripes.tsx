import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { resolvePhotoUrl } from '@/utils/photo';

// Faixas diagonais em duas tonalidades. Foto (photoUrl) entra no lugar das
// faixas; ilustração .svg (referenceImageUrl) fica por cima delas, inteira.
export type Tone = readonly [string, string];

const STRIPE_WIDTH = 18;
const STRIPE_COUNT = 44; // cobre ~2x a maior largura de tela útil

export function Stripes({
  tone,
  imageUrl,
  radius = 0,
  style,
  children,
}: {
  tone: Tone;
  imageUrl?: string | null;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const url = resolvePhotoUrl(imageUrl);
  const isIllustration = url != null && url.endsWith('.svg');

  return (
    <View style={[styles.container, { borderRadius: radius, backgroundColor: tone[1] }, style]}>
      {url && !isIllustration ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.stripeWrap} pointerEvents="none">
          {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
            <View
              key={i}
              style={{ width: STRIPE_WIDTH, height: '100%', backgroundColor: i % 2 ? tone[0] : tone[1] }}
            />
          ))}
        </View>
      )}
      {isIllustration && <Image source={{ uri: url }} style={styles.illustration} contentFit="contain" />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  illustration: { position: 'absolute', top: '6%', bottom: '6%', left: '4%', right: '4%' },
  stripeWrap: {
    position: 'absolute',
    left: '-60%',
    top: '-60%',
    width: '220%',
    height: '220%',
    flexDirection: 'row',
    transform: [{ rotate: '-45deg' }],
  },
});
