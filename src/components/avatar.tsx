import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HeadingFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Gradientes de avatar (texto branco por cima, ≥ 4.5:1 no ponto mais claro).
const GRADIENTS: readonly [string, string][] = [
  ['#7c5cff', '#e62e5c'],
  ['#2d5bff', '#0e8f7e'],
  ['#e62e5c', '#e5700f'],
  ['#8b3fd9', '#2d5bff'],
  ['#0f7d47', '#1d6fa3'],
  ['#c2410c', '#8b3fd9'],
];

function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initialsOf(name: string) {
  const parts = name.replace(/[@._-]+/g, ' ').trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.trim().slice(0, 2);
  return (letters || '?').toUpperCase();
}

export function Avatar({
  name,
  size = 44,
  level,
  shape = 'square',
}: {
  name: string;
  size?: number;
  // Quando informado, mostra o selo de nível no canto.
  level?: number;
  shape?: 'circle' | 'square';
  // Props antigas, ignoradas no redesign.
  tone?: unknown;
  ring?: string;
}) {
  const theme = useTheme();
  const radius = shape === 'circle' ? size / 2 : Math.round(size * 0.32);
  const badge = Math.max(20, Math.round(size * 0.46));

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={level ? `${name}, nível ${level}` : name}>
      <LinearGradient
        colors={gradientFor(name)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.fill, { borderRadius: radius }]}>
        <ThemedText style={[styles.initials, { fontSize: size * 0.36, lineHeight: size * 0.46 }]}>
          {initialsOf(name)}
        </ThemedText>
      </LinearGradient>
      {level != null && (
        <View
          style={[
            styles.level,
            {
              minWidth: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: theme.accent,
              boxShadow: `0 0 0 2px ${theme.backgroundElement}`,
            },
          ]}>
          <ThemedText style={[styles.levelText, { color: theme.accentText, fontSize: badge * 0.55, lineHeight: badge }]}>
            {level}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#ffffff', fontFamily: HeadingFont },
  level: { position: 'absolute', right: -6, bottom: -6, paddingHorizontal: 4, alignItems: 'center' },
  levelText: { fontFamily: HeadingFont },
});
