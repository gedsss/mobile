import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMe, useSpeciesList } from '@/api/hooks';
import type { Species } from '@/api/types';
import { RarityPill } from '@/components/badge';
import { FishArt } from '@/components/fish-art';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { HeadingFont, Spacing } from '@/constants/theme';
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
  const { data: me } = useMe();
  const [query, setQuery] = useState('');
  const caught = new Set((me?.catchesBySpecies ?? []).map(e => e.speciesId));

  const q = query.trim().toLowerCase();
  const filtered = (species ?? []).filter(
    item => item.name.toLowerCase().includes(q) || (item.scientificName ?? '').toLowerCase().includes(q)
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <ThemedText type="title" accessibilityRole="header">
            Qual peixe?
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.close, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <TextField icon="search" value={query} onChangeText={setQuery} placeholder="Nome popular ou científico" accessibilityLabel="Buscar espécie" autoFocus />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isNew = !caught.has(item.id);
            return (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={[styles.row, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.baseXp} XP${isNew ? ', espécie nova' : ''}`}>
                <FishArt difficulty={item.difficulty} imageUrl={item.referenceImageUrl} iconSize={26} radius={12} style={styles.thumb} />
                <View style={styles.rowText}>
                  <ThemedText type="subtitle" numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={styles.meta}>
                    <RarityPill difficulty={item.difficulty} size="sm" />
                    {isNew && (
                      <ThemedText type="monoSmall" style={{ color: theme.primary }}>
                        NOVA
                      </ThemedText>
                    )}
                  </View>
                </View>
                <ThemedText style={[styles.xp, { color: theme.textSecondary }]}>+{item.baseXp} XP</ThemedText>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedText type="body" themeColor="textSecondary" style={styles.emptyText}>
              Nenhuma espécie com esse nome.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Spacing.md },
  close: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: 20, paddingTop: Spacing.md },
  list: { padding: 20, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 70, padding: 10, borderRadius: 18, gap: 12 },
  thumb: { width: 50, height: 50 },
  rowText: { gap: 4, flex: 1, minWidth: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xp: { fontFamily: HeadingFont, fontSize: 15, lineHeight: 20 },
  emptyText: { textAlign: 'center', marginTop: Spacing.xl },
});
