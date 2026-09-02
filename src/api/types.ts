export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC' | 'LEGENDARY';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export type ReactionEmoji = 'LIKE' | 'LOVE' | 'FIRE' | 'WOW' | 'CLAP' | 'BIG_ONE';

export const REACTION_EMOJIS: ReactionEmoji[] = ['LIKE', 'LOVE', 'FIRE', 'WOW', 'CLAP', 'BIG_ONE'];

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface CatchesBySpecies {
  speciesId: string;
  _count: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  catchesBySpecies: CatchesBySpecies[];
  // Opcionais — só o mock preenche hoje (o backend não expõe estes campos).
  handle?: string | null;
  memberSince?: string | null;
  avatarTone?: [string, string] | null;
}

export type Habitat = 'Doce' | 'Salgada';

export interface SpeciesRegion {
  name: string;
  season: string;
}

export interface SpeciesMapPin {
  x: string;
  y: string;
  label: string;
}

export interface Species {
  id: string;
  name: string;
  scientificName: string | null;
  difficulty: Difficulty;
  baseXp: number;
  referenceImageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  // Metadados de catálogo — opcionais; ausentes no backend atual, as telas
  // simplesmente omitem as seções correspondentes quando não vierem.
  habitat?: Habitat | null;
  family?: string | null;
  averageSizeCm?: number | null;
  diet?: string | null;
  baits?: string[] | null;
  regions?: SpeciesRegion[] | null;
  mapPins?: SpeciesMapPin[] | null;
  tone?: [string, string] | null;
}

export interface Catch {
  id: string;
  userId: string;
  speciesId: string;
  photoUrl: string;
  xpAwarded: number;
  capturedAt: string;
  createdAt: string;
  weightGrams: number | null;
  lengthCm: number | null;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
}

export interface Friendship {
  id: string;
  userAId: string;
  userBId: string;
  requestedById: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
}

export interface FriendshipsResponse {
  friends: Friendship[];
  pendingSent: Friendship[];
  pendingReceived: Friendship[];
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: string;
}

export interface UnlockedAchievement {
  code: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  unlockedAt: string;
}

export interface Reaction {
  id: string;
  catchId: string;
  userId: string;
  emoji: ReactionEmoji;
  createdAt: string;
  updatedAt: string;
}

// Captura enriquecida para o feed. O backend real devolve só `Catch`; os extras
// (nível do autor, contagem de reações, "nova espécie") só existem no mock, e as
// telas tratam cada um como opcional.
export type FeedCatch = Catch & {
  authorLevel?: number;
  authorUsername?: string;
  authorAvatarTone?: [string, string] | null;
  reactionCounts?: Partial<Record<ReactionEmoji, number>>;
  myReaction?: ReactionEmoji | null;
  isNewSpecies?: boolean;
  mine?: boolean;
};
