import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/pill';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const theme = useTheme();
  const { login, register } = useAuth();
  const isRegister = mode === 'register';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(USE_MOCKS && !isRegister ? 'gedsss@fishdex.app' : '');
  const [password, setPassword] = useState(USE_MOCKS && !isRegister ? 'pescaria' : '');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ title: string; body: string } | null>(null);

  const checks = {
    username: username.trim().length >= 3,
    email: EMAIL_RE.test(email.trim()),
    password: password.length >= 6,
  };
  const fieldsValid = isRegister
    ? checks.username && checks.email && checks.password
    : checks.email && checks.password;

  const submit = async () => {
    if (!fieldsValid) {
      setTouched(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isRegister) await register(username.trim(), email.trim(), password);
      else await login(email.trim(), password);
      router.replace('/(tabs)/species');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : isRegister ? 'Não foi possível criar a conta.' : 'Não foi possível entrar.';
      setError({ title: isRegister ? 'Erro ao criar conta' : 'E-mail ou senha inválidos', body: message });
    } finally {
      setBusy(false);
    }
  };

  const guestBrowse = async () => {
    setBusy(true);
    try {
      await login('convidado@fishdex.app', 'convidado');
      router.replace('/(tabs)/species');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} topColor="headerBackground">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: theme.headerBackground }}
          contentContainerStyle={[styles.content, { backgroundColor: theme.headerBackground }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <View style={[styles.logoDot, { backgroundColor: theme.headerBackground }]} />
            </View>
            <ThemedText type="title">FishDex</ThemedText>
          </View>

          <ThemedText type="heading" style={styles.title}>
            {isRegister ? 'Comece o seu Dex' : 'Bem-vindo de volta'}
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.subtitle}>
            {isRegister
              ? 'Crie sua conta para registrar capturas, desbloquear espécies e acompanhar seus amigos.'
              : 'Entre para continuar catalogando espécies e ver o feed dos seus amigos.'}
          </ThemedText>

          <View style={styles.toggle}>
            <Segmented
              value={mode}
              onChange={v => router.replace(v === 'login' ? '/(auth)/login' : '/(auth)/register')}
              options={[
                { value: 'login', label: 'Entrar' },
                { value: 'register', label: 'Criar conta' },
              ]}
            />
          </View>

          {error && (
            <View style={[styles.errorCard, { borderColor: theme.primary }]}>
              <ThemedText type="bodyBold" style={{ color: theme.primary }}>
                {error.title}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {error.body}
              </ThemedText>
            </View>
          )}

          <View style={styles.fields}>
            {isRegister && (
              <TextField
                label="Nome de usuário"
                value={username}
                onChangeText={t => {
                  setUsername(t);
                  setError(null);
                }}
                autoCapitalize="none"
                placeholder="pescador_do_sul"
                error={touched && !checks.username ? 'Mínimo de 3 caracteres' : undefined}
              />
            )}
            <TextField
              label="E-mail"
              value={email}
              onChangeText={t => {
                setEmail(t);
                setError(null);
              }}
              glyph="square"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="voce@email.com"
              error={touched && !checks.email ? 'Informe um e-mail válido' : undefined}
            />
            <TextField
              label="Senha"
              value={password}
              onChangeText={t => {
                setPassword(t);
                setError(null);
              }}
              glyph="rounded"
              revealToggle
              autoComplete={isRegister ? 'password-new' : 'password'}
              placeholder="••••••"
              error={touched && !checks.password ? 'Mínimo de 6 caracteres' : undefined}
            />
          </View>

          {isRegister && (
            <ThemedText type="caption" themeColor="textFaint" style={styles.terms}>
              Ao criar a conta você concorda com as regras de pesca responsável e o compartilhamento das capturas com
              seus amigos.
            </ThemedText>
          )}

          <Button
            label={busy ? (isRegister ? 'Criando conta…' : 'Entrando…') : isRegister ? 'Criar conta' : 'Entrar'}
            onPress={submit}
            loading={busy}
            style={styles.cta}
          />

          <View style={styles.switchRow}>
            <ThemedText type="caption" themeColor="textSecondary">
              {isRegister ? 'Já tem conta?' : 'Ainda não tem conta?'}
            </ThemedText>
            <Pressable
              onPress={() => router.replace(isRegister ? '/(auth)/login' : '/(auth)/register')}
              hitSlop={8}>
              <ThemedText type="bodyBold" style={{ color: theme.accent }}>
                {isRegister ? 'Entrar' : 'Criar conta'}
              </ThemedText>
            </Pressable>
          </View>

          {USE_MOCKS && (
            <Button label="Explorar catálogo sem entrar" variant="ghost" onPress={guestBrowse} style={styles.guest} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logo: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 10, height: 10, borderRadius: 999 },
  title: { marginTop: Spacing.lg },
  subtitle: { marginTop: 6 },
  toggle: { marginTop: Spacing.lg },
  errorCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,138,61,0.14)',
    gap: 2,
  },
  fields: { marginTop: Spacing.md, gap: Spacing.sm },
  terms: { marginTop: Spacing.sm, lineHeight: 17 },
  cta: { marginTop: Spacing.lg },
  switchRow: { marginTop: Spacing.md, flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  guest: { marginTop: Spacing.md },
});
