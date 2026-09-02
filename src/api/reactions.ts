import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockReactions } from '@/api/mock/store';
import type { Reaction, ReactionEmoji } from '@/api/types';

export function react(catchId: string, emoji: ReactionEmoji) {
  if (USE_MOCKS) return mockReactions.react(catchId, emoji);
  return request<Reaction>(`/catches/${catchId}/reaction`, { method: 'PUT', body: { emoji } });
}

export function removeReaction(catchId: string) {
  if (USE_MOCKS) return mockReactions.removeReaction(catchId);
  return request<void>(`/catches/${catchId}/reaction`, { method: 'DELETE' });
}
