import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import * as catchesApi from '@/api/catches';
import { useSpecies, useUser } from '@/api/hooks';
import { Avatar } from '@/components/avatar';
import { DifficultyBadge } from '@/components/badge';
import { Card } from '@/components/card';
import { ReactionBar } from '@/components/reaction-bar';
import { Screen } from '@/components/screen';
import { ErrorView, LoadingView } from '@/components/states';
import { Stripes, type Tone } from '@/components/stripes';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatCatchMeta, formatRelativeDate } from '@/utils/format';

export default function CatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: ['catch', id],
    queryFn: () => catchesApi.getCatch(id),
    enabled: !!id,
  });
  const { data: author } = useUser(item?.userId);
  const { data: species } = useSpecies(item?.speciesId);

  if (isLoading) return <LoadingView label="Carregando captura…" />;
  if (isError || !item) return <ErrorView onRetry={refetch} />;

  const tone = (species?.tone as Tone) ?? (['#0a3d4a', '#073040'] as Tone);

  return (
    <Screen padded={false}>
      <ScrollView>
        <Stripes tone={tone} imageUrl={item.photoUrl || null} style={styles.photo} />

        <View style={styles.content}>
          <Pressable
            style={styles.author}
            onPress={() => author && router.push(`/user/${author.id}`)}
            accessibilityRole="button">
            <Avatar name={author?.username ?? '?'} tone={author?.avatarTone as Tone} shape="square" />
            <View>
              <ThemedText type="bodyBold">{author?.username ?? '...'}</ThemedText>
              <ThemedText type="monoSmall" themeColor="textSecondary">
                {formatRelativeDate(item.capturedAt)}
              </ThemedText>
            </View>
          </Pressable>

          <View style={styles.speciesRow}>
            <Pressable onPress={() => router.push(`/species/${item.speciesId}`)}>
              <ThemedText type="title">{species?.name ?? 'Espécie'}</ThemedText>
            </Pressable>
            {species && <DifficultyBadge difficulty={species.difficulty} />}
          </View>

          <Card style={styles.statsCard}>
            <Stat label="XP ganho" value={`+${item.xpAwarded}`} />
            <Stat label="Registro" value={formatCatchMeta(item)} />
          </Card>

          {item.locationName && (
            <ThemedText type="body" themeColor="textSecondary">
              {item.locationName}
            </ThemedText>
          )}

          <View style={styles.reactionsSection}>
            <ThemedText type="subtitle">Reações</ThemedText>
            <ReactionBar catchId={item.id} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="bodyBold">{value}</ThemedText>
      <ThemedText type="monoSmall" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', aspectRatio: 4 / 3 },
  content: { padding: Spacing.md, gap: Spacing.md },
  author: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around', gap: Spacing.sm },
  stat: { alignItems: 'center', gap: Spacing.xs, flexShrink: 1 },
  reactionsSection: { gap: Spacing.sm, paddingTop: Spacing.sm },
});
