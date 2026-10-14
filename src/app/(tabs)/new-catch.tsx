import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as catchesApi from '@/api/catches';
import { ApiError } from '@/api/client';
import * as uploadsApi from '@/api/uploads';
import { useMe, useSpeciesList } from '@/api/hooks';
import type { Species } from '@/api/types';
import { RarityPill } from '@/components/badge';
import { Button } from '@/components/button';
import { FishArt } from '@/components/fish-art';
import { Screen } from '@/components/screen';
import { SpeciesPickerModal } from '@/components/species-picker-modal';
import { SuccessSheet } from '@/components/success-sheet';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { HeadingFont, Spacing } from '@/constants/theme';
import { useRarity, useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/utils/format';
import { dexNumber } from '@/utils/species';

export default function NewCatchScreen() {
  const theme = useTheme();
  const rarity = useRarity();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();
  const { data: allSpecies } = useSpeciesList();
  const { data: me } = useMe();

  // Espécie pré-selecionada vem por parâmetro (?speciesId, ex.: da ficha da
  // espécie); o usuário pode trocar pelo seletor, e a escolha manual vence.
  const [manualSpecies, setManualSpecies] = useState<Species | null>(null);
  const species = manualSpecies ?? (speciesId ? (allSpecies?.find(s => s.id === speciesId) ?? null) : null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // XP antes de salvar — congelado para a celebração não "pular" quando o
  // perfil for recarregado.
  const [xpBefore, setXpBefore] = useState(0);
  const [wasNew, setWasNew] = useState(false);

  const today = formatShortDate(new Date().toISOString());
  const isNew = useMemo(
    () => !!(species && !me?.catchesBySpecies.some(e => e.speciesId === species.id)),
    [species, me]
  );
  const dexLabel = species && allSpecies ? dexNumber(allSpecies.findIndex(s => s.id === species.id)) : undefined;

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
      const cm = Number(lengthCm.replace(',', '.'));
      setXpBefore(me?.xp ?? 0);
      setWasNew(isNew);
      const { url: photoUrl } = await uploadsApi.uploadPhoto(photoUri);
      await catchesApi.createCatch({
        speciesId: species.id,
        photoUrl,
        capturedAt: new Date().toISOString(),
        weightGrams: weightKg && !Number.isNaN(kg) ? Math.round(kg * 1000) : undefined,
        lengthCm: lengthCm && !Number.isNaN(cm) ? cm : undefined,
        locationName: locationName.trim() || undefined,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
        queryClient.invalidateQueries({ queryKey: ['my-catches'] }),
        queryClient.invalidateQueries({ queryKey: ['user-catches'] }),
        queryClient.invalidateQueries({ queryKey: ['user'] }),
      ]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível registrar a captura.');
    } finally {
      setSubmitting(false);
    }
  };

  const missing = !species ? 'Escolha a espécie' : !photoUri ? 'Adicione uma foto' : null;

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: theme.backgroundElement, boxShadow: `inset 0 0 0 2px ${theme.border}, 0 3px 0 ${theme.border}` }]}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <Ionicons name="close" size={22} color={theme.text} />
          </Pressable>
          <View>
            <ThemedText type="title" accessibilityRole="header">
              Nova captura
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              {today}
            </ThemedText>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.photo, { backgroundColor: theme.backgroundSelected, borderColor: photoUri ? 'transparent' : theme.border }]}>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Foto da captura" />
                <Pressable
                  onPress={pickFromLibrary}
                  style={[styles.swap, { backgroundColor: theme.backgroundElement }]}
                  accessibilityRole="button"
                  accessibilityLabel="Trocar foto">
                  <Ionicons name="swap-horizontal" size={18} color={theme.text} />
                  <ThemedText type="label">Trocar</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={[styles.camIcon, { backgroundColor: theme.primary, boxShadow: `0 4px 0 ${theme.primaryLip}` }]}>
                  <Ionicons name="camera" size={28} color={theme.primaryText} />
                </View>
                <ThemedText type="subtitle">Adicionar foto</ThemedText>
                <View style={styles.photoActions}>
                  <Button label="Câmera" icon="camera-outline" size="sm" variant="secondary" onPress={pickFromCamera} />
                  <Button label="Galeria" icon="images-outline" size="sm" variant="secondary" onPress={pickFromLibrary} />
                </View>
              </>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="label">Espécie</ThemedText>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={[
                styles.speciesRow,
                {
                  backgroundColor: theme.backgroundElement,
                  boxShadow: `inset 0 0 0 2px ${species ? rarity[species.difficulty].color : theme.border}`,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={species ? `Espécie: ${species.name}. Trocar` : 'Selecionar espécie'}>
              {species ? (
                <>
                  <FishArt difficulty={species.difficulty} imageUrl={species.referenceImageUrl} iconSize={28} radius={12} style={styles.thumb} />
                  <View style={styles.flex}>
                    <ThemedText type="subtitle" numberOfLines={1}>
                      {species.name}
                    </ThemedText>
                    {species.scientificName && (
                      <ThemedText type="caption" themeColor="textSecondary" style={styles.italic} numberOfLines={1}>
                        {species.scientificName}
                      </ThemedText>
                    )}
                  </View>
                  <RarityPill difficulty={species.difficulty} size="sm" style={styles.centerSelf} />
                </>
              ) : (
                <>
                  <View style={[styles.thumb, styles.thumbEmpty, { borderColor: theme.border }]}>
                    <Ionicons name="fish-outline" size={22} color={theme.textSecondary} />
                  </View>
                  <ThemedText type="bodyBold" themeColor="textSecondary" style={styles.flex}>
                    Qual peixe você pegou?
                  </ThemedText>
                </>
              )}
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.row}>
            <TextField
              label="Comprimento"
              icon="resize-outline"
              unit="cm"
              value={lengthCm}
              onChangeText={setLengthCm}
              keyboardType="decimal-pad"
              placeholder="—"
              containerStyle={styles.flex}
            />
            <TextField
              label="Peso"
              icon="barbell-outline"
              unit="kg"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="—"
              containerStyle={styles.flex}
            />
          </View>
          <TextField
            label="Onde foi?"
            icon="location-outline"
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Ex.: Rio Cuiabá, Barão de Melgaço (MT)"
          />

          {error && (
            <View style={[styles.error, { backgroundColor: theme.dangerSoft }]} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={20} color={theme.danger} />
              <ThemedText type="label" themeColor="danger" style={styles.flex}>
                {error}
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={[styles.dock, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: theme.background, boxShadow: `0 -2px 0 ${theme.border}` }]}>
          {species && (
            <View style={styles.preview}>
              <Ionicons name="sparkles" size={20} color={theme.accentLip} />
              <ThemedText type="label" style={styles.flex}>
                {isNew ? 'Espécie nova pra sua coleção!' : 'Mais um registro no seu diário'}
              </ThemedText>
              <View style={[styles.xpChip, { backgroundColor: theme.accent }]}>
                <ThemedText style={[styles.xpChipText, { color: theme.accentText }]}>+{species.baseXp} XP</ThemedText>
              </View>
            </View>
          )}
          <Button
            label={missing ?? 'Registrar captura'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>

      <SpeciesPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={setManualSpecies} />

      <SuccessSheet
        visible={success}
        title="Captura registrada!"
        body={
          wasNew && dexLabel
            ? `${species?.name ?? ''} entrou na sua FishDex como ${dexLabel}`
            : `${species?.name ?? ''}${locationName ? ` · ${locationName}` : ''}`
        }
        species={species}
        dexLabel={dexLabel}
        isNewSpecies={wasNew}
        xpBefore={xpBefore}
        xpGained={species?.baseXp ?? 0}
        onClose={() => {
          setSuccess(false);
          router.replace('/(tabs)/species');
        }}
        onViewDex={() => {
          setSuccess(false);
          router.replace('/(tabs)/collection');
        }}
        onShare={() => {
          setSuccess(false);
          router.replace('/(tabs)/feed');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  italic: { fontStyle: 'italic' },
  centerSelf: { alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: Spacing.sm, paddingBottom: 12 },
  close: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 180, gap: 16 },
  photo: {
    height: 190,
    borderRadius: 22,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  camIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  swap: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 14 },
  field: { gap: 6 },
  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 66, borderRadius: 16, paddingLeft: 8, paddingRight: 12 },
  thumb: { width: 48, height: 48 },
  thumbEmpty: { borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14 },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  xpChip: { borderRadius: 10, paddingHorizontal: 10, minHeight: 28, justifyContent: 'center' },
  xpChipText: { fontFamily: HeadingFont, fontSize: 16, lineHeight: 20 },
});
