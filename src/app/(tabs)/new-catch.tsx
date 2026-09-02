import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as catchesApi from '@/api/catches';
import { ApiError } from '@/api/client';
import { useMe, useSpeciesList } from '@/api/hooks';
import type { Species } from '@/api/types';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { SpeciesPickerModal } from '@/components/species-picker-modal';
import { Stripes, type Tone } from '@/components/stripes';
import { SuccessSheet } from '@/components/success-sheet';
import { ThemedText } from '@/components/themed-text';
import { FloatingTabBarSpace, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/format';

export default function NewCatchScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const { data: allSpecies } = useSpeciesList();
  const { data: me } = useMe();

  // Espécie pré-selecionada vem por parâmetro (?speciesId, ex.: da ficha da
  // espécie); o usuário pode trocar pelo seletor, e a escolha manual vence.
  const [manualSpecies, setManualSpecies] = useState<Species | null>(null);
  const species =
    manualSpecies ?? (speciesId ? (allSpecies?.find(s => s.id === speciesId) ?? null) : null);
  const setSpecies = setManualSpecies;

  const [pickerVisible, setPickerVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = formatShortDate(new Date().toISOString());

  const alreadyCatalogued = useMemo(
    () => !!(species && me?.catchesBySpecies.some(e => e.speciesId === species.id)),
    [species, me]
  );

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return setError('Permissão de câmera negada.');
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError('Permissão de galeria negada.');
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const canSubmit = !!species && !!photoUri && !submitting;

  const handleSubmit = async () => {
    if (!species || !photoUri) return;
    setError(null);
    setSubmitting(true);
    try {
      const kg = Number(weightKg.replace(',', '.'));
      await catchesApi.createCatch({
        speciesId: species.id,
        photoUrl: photoUri,
        capturedAt: new Date().toISOString(),
        weightGrams: weightKg && !Number.isNaN(kg) ? Math.round(kg * 1000) : undefined,
        lengthCm: lengthCm ? Number(lengthCm.replace(',', '.')) : undefined,
        locationName: locationName.trim() || undefined,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['my-catches'] }),
      ]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível registrar a captura.');
    } finally {
      setSubmitting(false);
    }
  };

  const tone = (species?.tone as Tone) ?? ['#0a2731', '#0e2f39'];

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View>
            <ThemedText type="heading" style={styles.h1}>
              Novo registro
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Diário de pesca · {today}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: theme.backgroundSelected }]}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={pickFromLibrary}
            onLongPress={pickFromCamera}
            style={[styles.dropzone, { borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel="Adicionar foto da captura">
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            ) : (
              <>
                <View style={[styles.dropIcon, { backgroundColor: theme.headerBackground }]}>
                  <Ionicons name="camera" size={20} color={theme.accent} />
                </View>
                <ThemedText type="bodyBold">Adicionar foto da captura</ThemedText>
                <ThemedText type="monoSmall" themeColor="textSecondary">
                  toque: galeria · segure: câmera
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => setPickerVisible(true)}
            style={[styles.speciesRow, { backgroundColor: theme.backgroundElement, borderColor: species ? theme.accent : theme.border }]}
            accessibilityRole="button"
            accessibilityLabel="Selecionar espécie">
            {species ? (
              <>
                <Stripes tone={tone} radius={11} style={styles.speciesThumb} />
                <View style={styles.flex}>
                  <ThemedText type="bodyBold">{species.name}</ThemedText>
                  {species.scientificName && (
                    <ThemedText type="caption" themeColor="textFaint" style={styles.italic}>
                      {species.scientificName}
                    </ThemedText>
                  )}
                </View>
                <ThemedText type="monoSmall" style={{ color: theme.accent }}>
                  TROCAR
                </ThemedText>
              </>
            ) : (
              <>
                <View style={[styles.speciesThumb, styles.speciesThumbEmpty, { borderColor: theme.border }]} />
                <ThemedText type="bodyBold" themeColor="textSecondary" style={styles.flex}>
                  Selecionar espécie
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={theme.textFaint} />
              </>
            )}
          </Pressable>

          <View style={[styles.formCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Field label="Local">
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="Onde você pescou?"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text }]}
              />
            </Field>
            <Field label="Data" last>
              <ThemedText type="bodyBold">{today} · hoje</ThemedText>
            </Field>
          </View>

          <View style={[styles.formCard, styles.measures, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={[styles.measureCell, styles.measureCellDivider, { borderRightColor: theme.borderSubtle }]}>
              <ThemedText type="mono" themeColor="textFaint" uppercase>
                Peso (kg)
              </ThemedText>
              <TextInput
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
            <View style={styles.measureCell}>
              <ThemedText type="mono" themeColor="textFaint" uppercase>
                Comprimento (cm)
              </ThemedText>
              <TextInput
                value={lengthCm}
                onChangeText={setLengthCm}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          {species && (
            <View style={[styles.xpCard, { borderColor: theme.accent }]}>
              <View style={[styles.xpIcon, { backgroundColor: theme.accent }]}>
                <Ionicons name="sparkles" size={16} color="#04202a" />
              </View>
              <View style={styles.flex}>
                <ThemedText type="bodyBold">+{species.baseXp} XP ao salvar</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {alreadyCatalogued
                    ? 'Espécie já catalogada — registro entra no diário.'
                    : 'Nova espécie! Ela será desbloqueada no seu Dex.'}
                </ThemedText>
              </View>
            </View>
          )}

          {error && (
            <ThemedText type="caption" themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          )}
        </ScrollView>

        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background }]}>
          <Button label="Salvar no diário" onPress={handleSubmit} loading={submitting} disabled={!canSubmit} />
        </View>
      </KeyboardAvoidingView>

      <SpeciesPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setSpecies}
      />

      <SuccessSheet
        visible={success}
        title={alreadyCatalogued ? 'Registro salvo!' : 'Nova espécie catalogada!'}
        body={`${species?.name ?? ''}${locationName ? ` · ${locationName}` : ''} · ${today}`}
        xpBefore={me?.xp ?? 0}
        xpGained={species?.baseXp ?? 0}
        onClose={() => {
          setSuccess(false);
          router.replace('/(tabs)/species');
        }}
        onViewDex={() => {
          setSuccess(false);
          router.replace('/(tabs)/collection');
        }}
      />
    </Screen>
  );
}

function Field({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.field, !last && { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 }]}>
      <ThemedText type="mono" themeColor="textFaint" uppercase>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  italic: { fontStyle: 'italic' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 12,
  },
  h1: { fontSize: 23, lineHeight: 27 },
  close: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.md, paddingBottom: FloatingTabBarSpace + 60, gap: Spacing.md },
  dropzone: {
    height: 172,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    overflow: 'hidden',
  },
  dropIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: 10,
  },
  speciesThumb: { width: 40, height: 40 },
  speciesThumbEmpty: { borderRadius: 11, borderWidth: 2, borderStyle: 'dashed' },
  formCard: { borderWidth: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  field: { paddingHorizontal: 15, paddingVertical: 12, gap: 2 },
  input: { fontSize: 15, fontWeight: '700', paddingVertical: Platform.OS === 'ios' ? 4 : 2 },
  measures: { flexDirection: 'row' },
  measureCell: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, gap: 2 },
  measureCellDivider: { borderRightWidth: 1 },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    backgroundColor: 'rgba(255,196,77,0.09)',
  },
  xpIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  error: { marginTop: 4 },
  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});
