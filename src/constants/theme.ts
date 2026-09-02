import { Platform } from 'react-native';

// Paleta FishDex — importada do Claude Design ("FishDex Mobile App Design").
// O tema escuro é o desenho original (água profunda + âmbar de progressão); o
// tema claro é derivado para manter a mesma leitura em telas no modo claro.
// Cor funcional != decoração: laranja = ação, âmbar = XP/nível, verde = capturado.
export const Colors = {
  light: {
    text: '#08252b',
    textSecondary: '#4d6a70',
    textFaint: '#7c979d',
    background: '#eef5f4',
    backgroundElement: '#ffffff',
    backgroundSelected: '#dcebe8',
    headerBackground: '#0b2e38',
    border: '#d3e2df',
    borderSubtle: '#e2edea',
    primary: '#f07d2e',
    primaryText: '#ffffff',
    accent: '#d98a1c',
    accentText: '#ffffff',
    success: '#2e9e5b',
    danger: '#d64545',
    tabBar: '#0b2e38',
    tabInactive: 'rgba(226,240,239,0.5)',
    overlay: 'rgba(5,22,27,0.55)',
    onDark: '#f1f6f5',
    onDarkSecondary: 'rgba(226,240,239,0.62)',
  },
  dark: {
    text: '#f7fbfa',
    textSecondary: '#87a5ac',
    textFaint: '#6b8d96',
    background: '#061c23',
    backgroundElement: '#0b2831',
    backgroundSelected: '#12333c',
    headerBackground: '#04202a',
    border: '#173c46',
    borderSubtle: '#12333c',
    primary: '#ff8a3d',
    primaryText: '#04202a',
    accent: '#ffc44d',
    accentText: '#04202a',
    success: '#3fbf8f',
    danger: '#ff7373',
    tabBar: '#07333f',
    tabInactive: 'rgba(226,240,239,0.45)',
    overlay: 'rgba(5,22,27,0.72)',
    onDark: '#f1f6f5',
    onDarkSecondary: 'rgba(226,240,239,0.62)',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof (typeof Colors)['light'] & keyof (typeof Colors)['dark'];

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

type RarityTone = { color: string; border: string };

export const RarityPalette: Record<ColorScheme, Record<Difficulty, RarityTone>> = {
  dark: {
    EASY: { color: '#8ee0bd', border: '#3d7a66' },
    MEDIUM: { color: '#7cd0ef', border: '#356f88' },
    HARD: { color: '#ffb072', border: '#8f5a30' },
    EPIC: { color: '#c9a4ff', border: '#6a4f96' },
    LEGENDARY: { color: '#ffc44d', border: '#94701d' },
  },
  light: {
    EASY: { color: '#1f9e73', border: '#8fcdb8' },
    MEDIUM: { color: '#2b8fc0', border: '#9cd0e6' },
    HARD: { color: '#d97a2e', border: '#e6b48c' },
    EPIC: { color: '#7b57c9', border: '#c3aee6' },
    LEGENDARY: { color: '#c99114', border: '#e6cf8f' },
  },
};

// Compat: alguns lugares ainda pedem só a cor sólida da raridade.
export const DifficultyColors: Record<Difficulty, string> = {
  EASY: RarityPalette.dark.EASY.color,
  MEDIUM: RarityPalette.dark.MEDIUM.color,
  HARD: RarityPalette.dark.HARD.color,
  EPIC: RarityPalette.dark.EPIC.color,
  LEGENDARY: RarityPalette.dark.LEGENDARY.color,
};

export type Habitat = 'Doce' | 'Salgada';

type HabitatTone = { bg: string; ink: string };

export const HabitatPalette: Record<ColorScheme, Record<Habitat, HabitatTone>> = {
  dark: {
    Doce: { bg: '#0c352c', ink: '#63d6ab' },
    Salgada: { bg: '#0b3040', ink: '#7cc6ea' },
  },
  light: {
    Doce: { bg: '#dcefe6', ink: '#1f8c63' },
    Salgada: { bg: '#dbedf5', ink: '#2b7fa8' },
  },
};

// Reações — enum ReactionEmoji do backend. Cada uma tem uma cor e um "glyph"
// (raio de borda do miolo) espelhados do Claude Design.
export const ReactionMeta: Record<
  string,
  { label: string; color: string; glyph: number | string }
> = {
  LIKE: { label: 'Curti', color: '#7cd0ef', glyph: 3 },
  LOVE: { label: 'Amei', color: '#ff8aa8', glyph: 999 },
  FIRE: { label: 'Fogo', color: '#ff8a3d', glyph: 999 },
  WOW: { label: 'Uau', color: '#c9a4ff', glyph: 999 },
  CLAP: { label: 'Palmas', color: '#ffc44d', glyph: 2 },
  BIG_ONE: { label: 'Peixão', color: '#3fbf8f', glyph: 999 },
};

export const ReactionEmojiMap: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  FIRE: '🔥',
  WOW: '😮',
  CLAP: '👏',
  BIG_ONE: '🐋',
};

// Famílias de fonte registradas por useFonts() em app/_layout.tsx.
export const HeadingFont = 'Baloo2_700Bold';
export const HeadingFontSemiBold = 'Baloo2_600SemiBold';
// O desenho usa JetBrains Mono nos micro-rótulos; sem pacote extra, caímos numa
// monoespaçada da plataforma (troca por @expo-google-fonts/jetbrains-mono é 1 linha).
export const MonoFont = Platform.select({ ios: 'Menlo', default: 'monospace' }) as string;

// Escala 4pt: ritmo consistente entre componente, seção e página.
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  card: 20,
  xl: 22,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

export const BottomTabInset = Platform.select({ ios: 24, android: 16 }) ?? 0;
// Altura reservada pela barra de abas flutuante — telas roláveis somam isto ao
// padding inferior para o conteúdo não ficar atrás dela.
export const FloatingTabBarSpace = 96;
export const MaxContentWidth = 720;

// Fórmula linear espelhada do backend (src/modules/catches/level.ts) — usada
// só para calcular a barra de progresso até o próximo nível na UI.
export const XP_PER_LEVEL = 100;

export function xpProgress(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL, ratio: xpIntoLevel / XP_PER_LEVEL };
}
