import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, xpProgress } from '@/constants/theme';
import { useColorSchemeName, useTheme } from '@/hooks/use-theme';

export function SuccessSheet({
  visible,
  title,
  body,
  xpBefore,
  xpGained,
  onClose,
  onViewDex,
}: {
  visible: boolean;
  title: string;
  body: string;
  xpBefore: number;
  xpGained: number;
  onClose: () => void;
  onViewDex: () => void;
}) {
  const theme = useTheme();
  const scheme = useColorSchemeName();
  const before = xpProgress(xpBefore);
  const after = xpProgress(xpBefore + xpGained);
  const track = scheme === 'dark' ? '#12333c' : theme.backgroundSelected;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.checkWrap}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={34} color="#05161b" />
            </View>
          </View>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.body}>
            {body}
          </ThemedText>

          <View style={[styles.xpCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={styles.xpHeader}>
              <ThemedText type="caption" themeColor="textSecondary">
                Nível {before.level} → {after.level}
              </ThemedText>
              <ThemedText type="mono" style={{ color: theme.primary }}>
                +{xpGained} XP
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: track }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${after.level > before.level ? 100 : Math.round(after.ratio * 100)}%`,
                    backgroundColor: theme.accent,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button label="Fechar" variant="secondary" onPress={onClose} style={styles.action} />
            <Button label="Ver no FishDex" onPress={onViewDex} style={styles.actionWide} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', padding: Spacing.md },
  sheet: { borderRadius: 28, padding: 22 },
  checkWrap: { alignItems: 'center' },
  check: {
    width: 74,
    height: 74,
    borderRadius: 26,
    backgroundColor: '#3fbf8f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16, textAlign: 'center' },
  body: { marginTop: 6, textAlign: 'center' },
  xpCard: { marginTop: 18, borderWidth: 1, borderRadius: 18, padding: 15 },
  xpHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  track: { marginTop: 8, height: 9, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  actions: { marginTop: 16, flexDirection: 'row', gap: 9 },
  action: { flex: 1 },
  actionWide: { flex: 1.3 },
});
