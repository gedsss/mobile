import { Platform } from 'react-native';

// Paleta FishDex — Variação A "Gamer / Pokédex" (canvas "FishDex Redesign").
// Base índigo, ação em rosa-volt, XP/nível em amarelo. Cor funcional != decoração:
// primary = ação, accent = XP/nível/＋, success = capturado. Os nomes dos tokens
// foram mantidos da versão anterior para não quebrar telas que só leem cores.
export const Colors = {
  light: {
    text: '#17123d',
    textSecondary: '#5a5482',
    textFaint: '#6b6596',
    background: '#f2f0ff',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e9e5ff',
    headerBackground: '#1d1660',
    border: '#d8d2f5',
    borderSubtle: '#e6e1fa',
    primary: '#e62e5c',
    primaryText: '#ffffff',
    primaryLip: '#a8173d',
    accent: '#ffc21a',
    accentText: '#3b2a00',
    accentLip: '#c98f00',
    accentSoft: '#fff4cc',
    success: '#12814a',
    successText: '#ffffff',
    danger: '#c62828',
    dangerSoft: '#ffe4e0',
    tabBar: '#ffffff',
    tabInactive: '#5a5482',
    overlay: 'rgba(15,11,42,0.55)',
    onDark: '#ffffff',
    onDarkSecondary: '#d6d0ff',
    skeleton: '#e2ddfb',
  },
  dark: {
    text: '#f4f2ff',
    textSecondary: '#a9a3d6',
    textFaint: '#8f89c2',
    background: '#0f0b2a',
    backgroundElement: '#1b1645',
    backgroundSelected: '#262061',
    headerBackground: '#1d1660',
    border: '#332c73',
    borderSubtle: '#28225e',
    primary: '#ff5c85',
    primaryText: '#1a0612',
    primaryLip: '#b3264d',
    accent: '#ffd23f',
    accentText: '#2a1e00',
    accentLip: '#b98a00',
    accentSoft: '#3a3010',
    success: '#4fd58c',
    successText: '#062a16',
    danger: '#ff8a80',
    dangerSoft: '#4a1712',
    tabBar: '#1b1645',
    tabInactive: '#a9a3d6',
    overlay: 'rgba(4,2,16,0.72)',
    onDark: '#ffffff',
    onDarkSecondary: '#d6d0ff',
    skeleton: '#2b2468',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof (typeof Colors)['light'] & keyof (typeof Colors)['dark'];

// Gradiente fixo da marca (hero do login, cartão do perfil) — igual nos dois temas.
export const BrandGradient = ['#3a27a8', '#17123d'] as const;
export const XpGradient = ['#ffc21a', '#ff9a1f'] as const;

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC' | 'LEGENDARY';

export const RARITY_ORDER: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'EPIC', 'LEGENDARY'];

// Rótulo de raridade sempre acompanha a cor no componente (nunca só a cor).
export const DifficultyLabels: Record<Difficulty, string> = {
  EASY: 'COMUM',
  MEDIUM: 'INCOMUM',
  HARD: 'RARO',
  EPIC: 'ÉPICO',
  LEGENDARY: 'LENDÁRIO',
};

// Estrelas = segunda pista de raridade, independente de cor.
export const DifficultyStars: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EPIC: 4,
  LEGENDARY: 5,
};

export type RarityTone = {
  // Cor sólida da moldura/pill e o texto que vai por cima dela.
  color: string;
  onColor: string;
  // Compat: borda usada por telas antigas.
  border: string;
  // As duas faixas do placeholder "holográfico".
  tint: readonly [string, string];
  // Brilho em volta da carta (null = sem brilho; só a partir de Raro).
  glow: string | null;
  // Moldura em gradiente (só Lendário).
  frame?: readonly [string, string, string];
};

const RARITY_BASE: Record<Difficulty, Omit<RarityTone, 'tint' | 'border'>> = {
  EASY: { color: '#6b7390', onColor: '#ffffff', glow: null },
  MEDIUM: { color: '#0f7d47', onColor: '#ffffff', glow: null },
  HARD: { color: '#2563eb', onColor: '#ffffff', glow: 'rgba(37,99,235,0.4)' },
  EPIC: { color: '#8b3fd9', onColor: '#ffffff', glow: 'rgba(139,63,217,0.55)' },
  LEGENDARY: {
    color: '#e89a00',
    onColor: '#3b2000',
    glow: 'rgba(255,170,0,0.6)',
    frame: ['#ffe27a', '#ff9a1f', '#ffd54a'],
  },
};

const RARITY_TINTS: Record<ColorScheme, Record<Difficulty, readonly [string, string]>> = {
  light: {
    EASY: ['#e3e6ee', '#d3d8e4'],
    MEDIUM: ['#d6f3e3', '#bdebd2'],
    HARD: ['#dce6ff', '#c6d6ff'],
    EPIC: ['#eedfff', '#e0c8ff'],
    LEGENDARY: ['#fff0c2', '#ffe08a'],
  },
  dark: {
    EASY: ['#262a3d', '#2e3349'],
    MEDIUM: ['#0e3324', '#123f2c'],
    HARD: ['#14265e', '#192e70'],
    EPIC: ['#2a1650', '#331b60'],
    LEGENDARY: ['#3d2a05', '#4a3307'],
  },
};

function buildRarity(scheme: ColorScheme): Record<Difficulty, RarityTone> {
  const out = {} as Record<Difficulty, RarityTone>;
  for (const d of RARITY_ORDER) {
    out[d] = { ...RARITY_BASE[d], border: RARITY_BASE[d].color, tint: RARITY_TINTS[scheme][d] };
  }
  return out;
}

export const RarityPalette: Record<ColorScheme, Record<Difficulty, RarityTone>> = {
  light: buildRarity('light'),
  dark: buildRarity('dark'),
};

// Compat: alguns lugares ainda pedem só a cor sólida da raridade.
export const DifficultyColors: Record<Difficulty, string> = {
  EASY: RARITY_BASE.EASY.color,
  MEDIUM: RARITY_BASE.MEDIUM.color,
  HARD: RARITY_BASE.HARD.color,
  EPIC: RARITY_BASE.EPIC.color,
  LEGENDARY: RARITY_BASE.LEGENDARY.color,
};

export type Habitat = 'Doce' | 'Salgada';

type HabitatTone = { bg: string; ink: string };

export const HabitatPalette: Record<ColorScheme, Record<Habitat, HabitatTone>> = {
  dark: {
    Doce: { bg: '#0e3324', ink: '#4fd58c' },
    Salgada: { bg: '#14265e', ink: '#7c98ff' },
  },
  light: {
    Doce: { bg: '#d6f3e3', ink: '#0f6b3d' },
    Salgada: { bg: '#dce6ff', ink: '#1d4fc4' },
  },
};

// Reações — enum ReactionEmoji do backend. Cada uma tem rótulo, ícone Ionicons e
// cor de destaque quando é a reação escolhida.
export const ReactionMeta: Record<
  string,
  { label: string; color: string; icon: 'thumbs-up' | 'heart' | 'flame' | 'happy' | 'hand-left' | 'fish' }
> = {
  LIKE: { label: 'Curti', color: '#2563eb', icon: 'thumbs-up' },
  LOVE: { label: 'Amei', color: '#e62e5c', icon: 'heart' },
  FIRE: { label: 'Fogo', color: '#ff7a1a', icon: 'flame' },
  WOW: { label: 'Uau', color: '#8b3fd9', icon: 'happy' },
  CLAP: { label: 'Palmas', color: '#c98f00', icon: 'hand-left' },
  BIG_ONE: { label: 'Peixão', color: '#0f7d47', icon: 'fish' },
};

// Famílias de fonte registradas por useFonts() em app/_layout.tsx.
export const DisplayFont = 'Baloo2_800ExtraBold';
export const HeadingFont = 'Baloo2_800ExtraBold';
export const HeadingFontSemiBold = 'Baloo2_700Bold';
export const MonoFont = Platform.select({ ios: 'Menlo', default: 'monospace' }) as string;

// Escala 4pt.
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  card: 18,
  xl: 22,
  sheet: 34,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
} as const;

export const BottomTabInset = Platform.select({ ios: 24, android: 16 }) ?? 0;
// A tab bar agora é encaixada (não flutua), então as listas só precisam de um
// respiro no fim — mantido o nome para não mexer nas telas.
export const FloatingTabBarSpace = 24;
export const MaxContentWidth = 720;

// Fórmula linear espelhada do backend (src/modules/catches/level.ts).
export const XP_PER_LEVEL = 100;

export function xpProgress(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL, ratio: xpIntoLevel / XP_PER_LEVEL };
}
