import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { resolvePhotoUrl } from '@/utils/photo';

// Placeholder "foto" do desenho: faixas diagonais em duas tonalidades. As fotos
// reais são opcionais (referenceImageUrl / photoUrl) — quando existem, entram no
// lugar das faixas. O Claude Design deixa claro que as faixas são provisórias.
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
  return (
    <View style={[styles.container, { borderRadius: radius, backgroundColor: tone[1] }, style]}>
      {resolvePhotoUrl(imageUrl) ? (
        <Image source={{ uri: resolvePhotoUrl(imageUrl) as string }} style={StyleSheet.absoluteFill} contentFit="cover" />
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
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
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
