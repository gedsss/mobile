import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddFriendForm, FriendCodeCard } from '@/components/friend-code';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Modal de adicionar amigo — o mesmo formulário que fica no topo de /friends.
export default function AddFriendScreen() {
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <ThemedText type="heading" accessibilityRole="header">
          Adicionar amigo
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}` }]}
          accessibilityRole="button"
          accessibilityLabel="Fechar">
          <Ionicons name="close" size={22} color={theme.text} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <FriendCodeCard />
        <AddFriendForm />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Spacing.md },
  close: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 16 },
});
