import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as friendshipsApi from '@/api/friendships';
import { ApiError } from '@/api/client';
import { useMe } from '@/api/hooks';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddFriendScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [targetId, setTargetId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => friendshipsApi.sendFriendRequest(targetId.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      setSuccess(true);
      setTargetId('');
    },
    onError: err => setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o pedido.'),
  });

  const handleCopy = async () => {
    if (!me) return;
    await Clipboard.setStringAsync(me.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <ThemedText type="heading">Adicionar amigo</ThemedText>

        <Card>
          <ThemedText type="caption" themeColor="textSecondary">
            Seu código FishDex
          </ThemedText>
          <View style={styles.codeRow}>
            <ThemedText type="bodyBold" numberOfLines={1} style={styles.codeText}>
              {me?.id ?? 'carregando...'}
            </ThemedText>
            <Pressable
              onPress={handleCopy}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Copiar código">
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={22} color={theme.primary} />
            </Pressable>
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            Compartilhe esse código com seu amigo para que ele possa te adicionar.
          </ThemedText>
        </Card>

        <View style={styles.form}>
          <ThemedText type="subtitle">Adicionar por código</ThemedText>
          <TextField
            label="Código do amigo"
            value={targetId}
            onChangeText={text => {
              setTargetId(text);
              setError(null);
              setSuccess(false);
            }}
            autoCapitalize="none"
            placeholder="cole o código aqui"
          />
          {error && (
            <ThemedText type="caption" themeColor="danger">
              {error}
            </ThemedText>
          )}
          {success && (
            <ThemedText type="caption" themeColor="success">
              Pedido enviado!
            </ThemedText>
          )}
          <Button
            label="Enviar pedido"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!targetId.trim()}
          />
        </View>

        <Button label="Fechar" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.lg, paddingVertical: Spacing.md },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  codeText: { flex: 1 },
  form: { gap: Spacing.sm },
});
