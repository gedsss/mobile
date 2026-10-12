import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Difficulty } from '@/api/types';
import { Stripes } from '@/components/stripes';
import { useRarity, useTheme } from '@/hooks/use-theme';

// Arte da carta: a foto de referência quando existe; senão o placeholder
// "holográfico" (faixas diagonais nas duas tintas da raridade) com a silhueta
// do peixe na cor da raridade.
export function FishArt({
  difficulty,
  imageUrl,
  locked = false,
  iconSize = 64,
  radius = 0,
  style,
  children,
}: {
  difficulty: Difficulty;
  imageUrl?: string | null;
  locked?: boolean;
  iconSize?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const r = useRarity()[difficulty];

  if (locked) {
    return (
      <View style={[styles.center, { borderRadius: radius, backgroundColor: theme.backgroundSelected }, style]}>
        <Ionicons name="fish" size={iconSize} color={theme.text} style={styles.silhouette} />
        {children}
      </View>
    );
  }

  return (
    <Stripes tone={r.tint} imageUrl={imageUrl} radius={radius} style={[styles.center, style]}>
      {!imageUrl && <Ionicons name="fish" size={iconSize} color={r.color} style={styles.fish} />}
      {children}
    </Stripes>
  );
}

// Moldura colorida da carta. Comum/Incomum: só a cor. Raro/Épico: + brilho.
// Lendário: moldura em gradiente dourado + brilho forte.
export function RarityFrame({
  difficulty,
  children,
  radius = 18,
  thickness = 4,
  style,
}: {
  difficulty: Difficulty;
  children: ReactNode;
  radius?: number;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const r = useRarity()[difficulty];
  const shadows = ['0 5px 0 rgba(0,0,0,0.18)'];
  if (r.glow) shadows.push(`0 0 18px ${r.glow}`);
  const frameStyle = [
    { borderRadius: radius, padding: thickness, boxShadow: shadows.join(', ') },
    style,
  ];

  if (r.frame) {
    return (
      <LinearGradient colors={r.frame} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={frameStyle}>
        {children}
      </LinearGradient>
    );
  }
  return <View style={[{ backgroundColor: r.color }, frameStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fish: { opacity: 0.8 },
  silhouette: { opacity: 0.16 },
});
