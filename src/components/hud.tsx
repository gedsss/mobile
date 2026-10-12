import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useMe, useSpeciesList } from '@/api/hooks';
import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { XpTrack } from '@/components/xp-bar';
import { HeadingFont, xpProgress } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// HUD de jogador: nível + XP + espécies capturadas, sempre no topo das telas
// principais. Toque abre o perfil.
export function XpHud() {
  const theme = useTheme();
  const { data: me } = useMe();
  const { data: species } = useSpeciesList();
  const { level, xpIntoLevel, xpForNextLevel, ratio } = xpProgress(me?.xp ?? 0);
  const caught = me?.catchesBySpecies.length ?? 0;
  const total = species?.length ?? 0;

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      accessibilityRole="button"
      accessibilityLabel={`Nível ${level}, ${xpIntoLevel} de ${xpForNextLevel} XP, ${caught} de ${total} espécies. Abrir perfil`}
      style={[styles.hud, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}>
      <Avatar name={me?.username ?? '?'} size={44} level={level} />
      <View style={styles.middle}>
        <View style={styles.row}>
          <ThemedText style={styles.level}>Nível {level}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.bold}>
            {xpIntoLevel}/{xpForNextLevel} XP
          </ThemedText>
        </View>
        <XpTrack ratio={ratio} />
      </View>
      <View style={[styles.dex, { backgroundColor: theme.backgroundSelected }]}>
        <Ionicons name="albums" size={16} color={theme.primary} />
        <ThemedText style={styles.dexText}>
          {caught}/{total}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hud: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingLeft: 12, borderRadius: 20 },
  middle: { flex: 1, minWidth: 0, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  level: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
  bold: { fontWeight: '700' },
  dex: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 10, borderRadius: 12 },
  dexText: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
});
