import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSpeciesList } from '@/api/hooks';
import type { Species } from '@/api/types';
import { DifficultyBadge } from '@/components/badge';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SpeciesPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (species: Species) => void;
}) {
  const theme = useTheme();
  const { data: species } = useSpeciesList();
  const [query, setQuery] = useState('');

  const filtered = (species ?? []).filter(item =>
    item.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <ThemedText type="title">Escolha a espécie</ThemedText>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <TextField label="Buscar" value={query} onChangeText={setQuery} placeholder="Nome da espécie" />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={[styles.row, { borderColor: theme.border }]}
              accessibilityRole="button">
              <View style={styles.rowText}>
                <ThemedText type="bodyBold">{item.name}</ThemedText>
                <DifficultyBadge difficulty={item.difficulty} />
              </View>
              <ThemedText type="caption" themeColor="textSecondary">
                +{item.baseXp} XP
              </ThemedText>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText type="body" themeColor="textSecondary" style={styles.emptyText}>
              Nenhuma espécie encontrada.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchWrap: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  list: { padding: Spacing.md, gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: 14,
    gap: Spacing.sm,
  },
  rowText: { gap: Spacing.xs, flex: 1 },
  emptyText: { textAlign: 'center', marginTop: Spacing.xl },
});
