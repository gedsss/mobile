/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, HabitatPalette, RarityPalette, type ColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColorSchemeName(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useColorSchemeName()];
}

export function useRarity() {
  return RarityPalette[useColorSchemeName()];
}

export function useHabitat() {
  return HabitatPalette[useColorSchemeName()];
}
