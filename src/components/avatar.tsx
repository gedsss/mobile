import { StyleSheet, View } from 'react-native';

import { Stripes, type Tone } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';

const PALETTE: Tone[] = [
  ['#0a3d4a', '#073040'],
  ['#1b3f54', '#153446'],
  ['#134539', '#0e392f'],
  ['#42264d', '#341e3d'],
  ['#5b4614', '#4a3a11'],
  ['#2f4522', '#26381c'],
];

function toneFor(seed: string): Tone {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({
  name,
  size = 44,
  shape = 'circle',
  tone,
  ring,
}: {
  name: string;
  size?: number;
  shape?: 'circle' | 'square';
  tone?: Tone;
  ring?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const radius = shape === 'circle' ? size / 2 : Math.round(size * 0.32);

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: radius },
        ring ? { borderWidth: 2, borderColor: ring } : null,
      ]}>
      <Stripes tone={tone ?? toneFor(name)} radius={radius} style={styles.fill} />
      <ThemedText style={{ color: '#f1f6f5', fontSize: size * 0.4, fontWeight: '800' }}>
        {initial}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
