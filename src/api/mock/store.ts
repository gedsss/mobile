import type {
  Achievement,
  AuthUser,
  Catch,
  CatchesBySpecies,
  FeedCatch,
  Friendship,
  FriendshipsResponse,
  Reaction,
  ReactionEmoji,
  UnlockedAchievement,
  UserProfile,
} from '@/api/types';
import { ApiError } from '@/api/client';
import {
  INITIAL_MOCK_CATCHES,
  INITIAL_MOCK_REACTIONS,
  INITIAL_MY_REACTIONS,
  MOCK_ACHIEVEMENTS,
  MOCK_ME_ID,
  MOCK_SPECIES,
  MOCK_USERS,
} from '@/api/mock/data';

// Estado só em memória — reseta a cada reload do app. Serve pra navegar pelo
// front sem precisar do backend/Postgres rodando.
let catches: Catch[] = [...INITIAL_MOCK_CATCHES];

let friendships: Friendship[] = [
  friendship('fr-marina', 'mock-marina', 'ACCEPTED', 'mock-marina'),
  friendship('fr-caio', 'mock-caio', 'ACCEPTED', MOCK_ME_ID),
  friendship('fr-bia', 'mock-bia', 'ACCEPTED', MOCK_ME_ID),
  friendship('fr-rafa', 'mock-rafa', 'PENDING', 'mock-rafa'),
  friendship('fr-duda', 'mock-duda', 'PENDING', 'mock-duda'),
];

function friendship(id: string, otherId: string, status: Friendship['status'], requestedById: string): Friendship {
  const [userAId, userBId] = [MOCK_ME_ID, otherId].sort();
  return {
    id,
    userAId,
    userBId,
    requestedById,
    status,
    createdAt: new Date().toISOString(),
    respondedAt: status === 'PENDING' ? null : new Date().toISOString(),
  };
}

const unlockedByUser: Record<string, Set<string>> = { [MOCK_ME_ID]: new Set(['FIRST_CATCH']) };

// Contagens de reações "de outras pessoas" (base imutável). A minha reação é
// somada por cima a partir de `myReactions`.
const seedCounts: Record<string, Partial<Record<ReactionEmoji, number>>> = { ...INITIAL_MOCK_REACTIONS };
const myReactions: Record<string, ReactionEmoji> = { ...(INITIAL_MY_REACTIONS as Record<string, ReactionEmoji>) };

const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

function calculateLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function catchesBySpeciesFor(userId: string): CatchesBySpecies[] {
  const counts = new Map<string, number>();
  for (const item of catches) {
    if (item.userId !== userId) continue;
    counts.set(item.speciesId, (counts.get(item.speciesId) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([speciesId, count]) => ({ speciesId, _count: count }));
}

function xpFor(userId: string) {
  return catches.filter(item => item.userId === userId).reduce((sum, item) => sum + item.xpAwarded, 0);
}

function levelFor(userId: string) {
  return MOCK_USERS[userId]?.levelOverride ?? calculateLevel(xpFor(userId));
}

function profileFor(userId: string): UserProfile {
  const user = MOCK_USERS[userId];
  if (!user) throw new ApiError(404, 'recurso não encontrado');
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    xp: xpFor(userId),
    level: levelFor(userId),
    catchesBySpecies: catchesBySpeciesFor(userId),
    handle: user.handle,
    memberSince: user.memberSince,
    avatarTone: user.avatarTone,
  };
}

function reactionCountsFor(catchId: string): Partial<Record<ReactionEmoji, number>> {
  const merged: Partial<Record<ReactionEmoji, number>> = { ...(seedCounts[catchId] ?? {}) };
  const mine = myReactions[catchId];
  if (mine) merged[mine] = (merged[mine] ?? 0) + 1;
  return merged;
}

function isEarliestOfSpecies(target: Catch) {
  return !catches.some(
    c =>
      c.userId === target.userId &&
      c.speciesId === target.speciesId &&
      new Date(c.capturedAt).getTime() < new Date(target.capturedAt).getTime()
  );
}

function toFeedCatch(item: Catch): FeedCatch {
  const author = MOCK_USERS[item.userId];
  return {
    ...item,
    mine: item.userId === MOCK_ME_ID,
    authorLevel: levelFor(item.userId),
    authorUsername: author?.username,
    authorAvatarTone: author?.avatarTone ?? null,
    reactionCounts: reactionCountsFor(item.id),
    myReaction: myReactions[item.id] ?? null,
    isNewSpecies: isEarliestOfSpecies(item),
  };
}

export const mockAuth = {
  async login(email: string): Promise<{ token: string; user: AuthUser }> {
    await delay();
    const me = MOCK_USERS[MOCK_ME_ID];
    return { token: 'mock-token', user: { id: me.id, username: me.username, email: email || me.email } };
  },
  async register(data: { username: string; email: string }): Promise<AuthUser> {
    await delay();
    return { id: MOCK_ME_ID, username: data.username, email: data.email };
  },
};

export const mockUsers = {
  async getMe() {
    await delay();
    return profileFor(MOCK_ME_ID);
  },
  async getUser(id: string) {
    await delay();
    return profileFor(id);
  },
  async getUserAchievements(id: string): Promise<UnlockedAchievement[]> {
    await delay();
    const codes = unlockedByUser[id] ?? new Set<string>();
    return MOCK_ACHIEVEMENTS.filter(item => codes.has(item.code)).map(item => ({
      code: item.code,
      name: item.name,
      description: item.description,
      iconUrl: item.iconUrl,
      unlockedAt: new Date().toISOString(),
    }));
  },
};

export const mockSpecies = {
  async getSpeciesList() {
    await delay();
    return MOCK_SPECIES;
  },
  async getSpecies(id: string) {
    await delay();
    const species = MOCK_SPECIES.find(item => item.id === id);
    if (!species) throw new ApiError(404, 'recurso não encontrado');
    return species;
  },
};

export const mockAchievements = {
  async getAchievements(): Promise<Achievement[]> {
    await delay();
    return MOCK_ACHIEVEMENTS;
  },
};

export const mockCatches = {
  async createCatch(data: {
    speciesId: string;
    photoUrl: string;
    capturedAt: string;
    weightGrams?: number;
    lengthCm?: number;
    locationName?: string;
  }) {
    await delay();
    const species = MOCK_SPECIES.find(item => item.id === data.speciesId);
    if (!species) throw new ApiError(404, 'Especie nao encontrada');
    const newCatch: Catch = {
      id: `catch-${Date.now()}`,
      userId: MOCK_ME_ID,
      speciesId: data.speciesId,
      photoUrl: data.photoUrl,
      xpAwarded: species.baseXp,
      capturedAt: data.capturedAt,
      createdAt: data.capturedAt,
      weightGrams: data.weightGrams ?? null,
      lengthCm: data.lengthCm ?? null,
      locationLat: null,
      locationLng: null,
      locationName: data.locationName ?? null,
    };
    catches = [newCatch, ...catches];

    const total = catches.filter(item => item.userId === MOCK_ME_ID).length;
    const unlocked = (unlockedByUser[MOCK_ME_ID] ??= new Set());
    if (total === 1) unlocked.add('FIRST_CATCH');
    if (catchesBySpeciesFor(MOCK_ME_ID).length >= 10) unlocked.add('TEN_SPECIES');
    if (species.difficulty === 'LEGENDARY') unlocked.add('FIRST_LEGENDARY');

    return newCatch;
  },
  async getMyCatches() {
    await delay();
    return catches
      .filter(item => item.userId === MOCK_ME_ID)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
  },
  async getCatch(id: string) {
    await delay();
    const found = catches.find(item => item.id === id);
    if (!found) throw new ApiError(404, 'recurso não encontrado');
    return found;
  },
};

function acceptedFriendIds(): Set<string> {
  return new Set(
    friendships
      .filter(item => item.status === 'ACCEPTED')
      .map(item => (item.userAId === MOCK_ME_ID ? item.userBId : item.userAId))
  );
}

export const mockFeed = {
  async getFeed(page: number, limit: number): Promise<FeedCatch[]> {
    await delay();
    const friendIds = acceptedFriendIds();
    const sorted = catches
      .filter(item => friendIds.has(item.userId))
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return sorted.slice((page - 1) * limit, page * limit).map(toFeedCatch);
  },
  async getMyPosts(page: number, limit: number): Promise<FeedCatch[]> {
    await delay();
    const sorted = catches
      .filter(item => item.userId === MOCK_ME_ID)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return sorted.slice((page - 1) * limit, page * limit).map(toFeedCatch);
  },
};

export const mockFriendships = {
  async listFriendships(): Promise<FriendshipsResponse> {
    await delay();
    return {
      friends: friendships.filter(item => item.status === 'ACCEPTED'),
      pendingSent: friendships.filter(item => item.status === 'PENDING' && item.requestedById === MOCK_ME_ID),
      pendingReceived: friendships.filter(item => item.status === 'PENDING' && item.requestedById !== MOCK_ME_ID),
    };
  },
  async sendFriendRequest(targetUserId: string): Promise<Friendship> {
    await delay();
    if (targetUserId === MOCK_ME_ID) throw new ApiError(409, 'nao pode adicionar a si mesmo');
    const [userAId, userBId] = [MOCK_ME_ID, targetUserId].sort();
    if (friendships.some(item => item.userAId === userAId && item.userBId === userBId)) {
      throw new ApiError(409, 'amizade ja existe entre usuarios');
    }
    if (!MOCK_USERS[targetUserId]) {
      MOCK_USERS[targetUserId] = {
        id: targetUserId,
        username: `usuario-${targetUserId.slice(0, 5)}`,
        email: '',
        handle: `@${targetUserId.slice(0, 6)}`,
        avatarTone: ['#0a3d4a', '#073040'],
        memberSince: new Date().toISOString(),
      };
    }
    const created: Friendship = {
      id: `friendship-${Date.now()}`,
      userAId,
      userBId,
      requestedById: MOCK_ME_ID,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };
    friendships = [...friendships, created];
    return created;
  },
  async acceptFriendship(id: string): Promise<Friendship> {
    await delay();
    friendships = friendships.map(item =>
      item.id === id ? { ...item, status: 'ACCEPTED', respondedAt: new Date().toISOString() } : item
    );
    const updated = friendships.find(item => item.id === id);
    if (!updated) throw new ApiError(404, 'amizade nao existe');
    return updated;
  },
  async blockFriendship(id: string): Promise<Friendship> {
    await delay();
    friendships = friendships.map(item =>
      item.id === id ? { ...item, status: 'BLOCKED', respondedAt: new Date().toISOString() } : item
    );
    const updated = friendships.find(item => item.id === id);
    if (!updated) throw new ApiError(404, 'amizade nao existe');
    return updated;
  },
};

export const mockReactions = {
  async react(catchId: string, emoji: ReactionEmoji): Promise<Reaction> {
    await delay(150);
    myReactions[catchId] = emoji;
    return {
      id: `reaction-${catchId}`,
      catchId,
      userId: MOCK_ME_ID,
      emoji,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  async removeReaction(catchId: string): Promise<void> {
    await delay(150);
    delete myReactions[catchId];
  },
};
