import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/button';
import { FishArt, RarityFrame } from '@/components/fish-art';
import { Segmented } from '@/components/pill';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { BrandGradient, HeadingFont, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function AuthView({ mode }: { mode: 'login' | 'register' }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.backgroundElement }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <LinearGradient colors={BrandGradient} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 32 }]}>
          <View style={styles.ring} />
          <View style={styles.heroCard}>
            <RarityFrame difficulty="LEGENDARY" radius={18}>
              <FishArt difficulty="LEGENDARY" iconSize={70} radius={14} style={styles.heroArt} />
            </RarityFrame>
          </View>
          <View style={[styles.logo, { backgroundColor: theme.accent, boxShadow: `0 5px 0 ${theme.accentLip}` }]}>
            <Ionicons name="fish" size={30} color={theme.accentText} />
          </View>
          <ThemedText type="display" style={styles.onDark}>
            FishDex
          </ThemedText>
          <ThemedText type="bodyBold" style={styles.onDarkSoft}>
            Pegou? Registrou. Evoluiu.
          </ThemedText>
        </LinearGradient>

        <View style={[styles.sheet, { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + Spacing.lg }]}>
          <Segmented
            value={mode}
            onChange={v => router.replace(v === 'login' ? '/(auth)/login' : '/(auth)/register')}
            options={[
              { value: 'login', label: 'Entrar' },
              { value: 'register', label: 'Criar conta' },
            ]}
          />

          <ThemedText type="title" accessibilityRole="header">
            {isRegister ? 'Crie seu perfil de pescador' : 'Bem-vindo de volta!'}
          </ThemedText>

          {error && (
            <View style={[styles.errorCard, { backgroundColor: theme.dangerSoft }]} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={22} color={theme.danger} />
              <View style={styles.flex}>
                <ThemedText type="bodyBold" themeColor="danger">
                  {error.title}
                </ThemedText>
                <ThemedText type="caption" themeColor="text">
                  {error.body}
                </ThemedText>
              </View>
            </View>
          )}

          <View style={styles.fields}>
            {isRegister && (
              <TextField
                label="Nome de usuário"
                prefix="@"
                value={username}
                onChangeText={t => {
                  setUsername(t);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="pescador_do_sul"
                error={touched && !checks.username ? 'Mínimo de 3 caracteres' : undefined}
              />
            )}
            <TextField
              label="E-mail"
              icon="mail-outline"
              value={email}
              onChangeText={t => {
                setEmail(t);
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="voce@email.com"
              error={touched && !checks.email ? 'Informe um e-mail válido' : undefined}
            />
            <TextField
              label="Senha"
              icon="lock-closed-outline"
              value={password}
              onChangeText={t => {
                setPassword(t);
                setError(null);
              }}
              revealToggle
              autoComplete={isRegister ? 'password-new' : 'password'}
              placeholder={isRegister ? 'Mínimo de 6 caracteres' : '••••••'}
              error={touched && !checks.password ? 'Mínimo de 6 caracteres' : undefined}
            />
          </View>

          <Button
            label={busy ? (isRegister ? 'Criando conta…' : 'Entrando…') : isRegister ? 'Criar conta' : 'Entrar'}
            onPress={submit}
            loading={busy}
          />

          {isRegister && (
            <ThemedText type="caption" themeColor="textSecondary" style={styles.terms}>
              Ao criar a conta você concorda com as regras de pesca responsável e com o compartilhamento das capturas com seus amigos.
            </ThemedText>
          )}

          {USE_MOCKS && (
            <Button label="Explorar sem entrar" variant="ghost" onPress={guestBrowse} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  scroll: { flexGrow: 1 },
  hero: { paddingHorizontal: 28, paddingBottom: 56, overflow: 'hidden' },
  ring: { position: 'absolute', right: -60, top: 40, width: 260, height: 260, borderRadius: 130, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.18)' },
  heroCard: { position: 'absolute', right: 18, top: 70, width: 116, transform: [{ rotate: '12deg' }] },
  heroArt: { height: 150 },
  logo: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }], marginBottom: 14 },
  onDark: { color: '#ffffff', fontFamily: HeadingFont },
  onDarkSoft: { color: '#d6d0ff' },
  sheet: { flex: 1, marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 22, paddingTop: 20, gap: 18 },
  errorCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 16 },
  fields: { gap: 14 },
  terms: { textAlign: 'center' },
});
