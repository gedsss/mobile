import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import * as friendshipsApi from '@/api/friendships';
import { useMe } from '@/api/hooks';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { HeadingFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Cartão amarelo com o código do jogador. O backend adiciona amigos pelo ID do
// usuário, então é ele que vai para a área de transferência.
export function FriendCodeCard() {
  const theme = useTheme();
  const { data: me } = useMe();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!me) return;
    await Clipboard.setStringAsync(me.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const share = () => me && Share.share({ message: `Me adiciona na FishDex! Meu código: ${me.id}` }).catch(() => {});

  return (
    <View style={[styles.card, { backgroundColor: theme.accent, boxShadow: `0 5px 0 ${theme.accentLip}` }]}>
      <View style={styles.flex}>
        <ThemedText type="monoSmall" style={{ color: theme.accentText }}>
          SEU CÓDIGO
        </ThemedText>
        <ThemedText style={[styles.handle, { color: theme.accentText }]} numberOfLines={1}>
          {me ? (me.handle ?? `@${me.username}`) : '…'}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.accentText }} numberOfLines={1} selectable>
          {me?.id ?? 'carregando…'}
        </ThemedText>
      </View>
      <Pressable onPress={copy} style={[styles.icon, { backgroundColor: theme.accentText }]} accessibilityRole="button" accessibilityLabel={copied ? 'Código copiado' : 'Copiar código'}>
        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={22} color={theme.accent} />
      </Pressable>
      <Pressable onPress={share} style={[styles.icon, { backgroundColor: theme.accentText }]} accessibilityRole="button" accessibilityLabel="Compartilhar código">
        <Ionicons name="share-outline" size={22} color={theme.accent} />
      </Pressable>
    </View>
  );
}

export function AddFriendForm() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => friendshipsApi.sendFriendRequest(target.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      setSent(true);
      setTarget('');
    },
    onError: err => setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o pedido.'),
  });

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <TextField
          label="Adicionar amigo"
          icon="search"
          value={target}
          onChangeText={t => {
            setTarget(t);
            setError(null);
            setSent(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Cole o código do amigo"
          containerStyle={styles.flex}
          error={error ?? undefined}
        />
      </View>
      <Button
        label="Enviar pedido"
        icon="person-add"
        onPress={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={!target.trim()}
      />
      {sent && (
        <View style={styles.sent} accessibilityRole="alert">
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <ThemedText type="label" themeColor="success">
            Pedido enviado!
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 22, marginBottom: 5 },
  handle: { fontFamily: HeadingFont, fontSize: 28, lineHeight: 32 },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  form: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  sent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
