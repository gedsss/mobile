import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockFriendships } from '@/api/mock/store';
import type { Friendship, FriendshipsResponse } from '@/api/types';

export function listFriendships() {
  if (USE_MOCKS) return mockFriendships.listFriendships();
  return request<FriendshipsResponse>('/friendships');
}

export function sendFriendRequest(targetUserId: string) {
  if (USE_MOCKS) return mockFriendships.sendFriendRequest(targetUserId);
  return request<Friendship>('/friendships', { method: 'POST', body: { targetUserId } });
}

export function acceptFriendship(id: string) {
  if (USE_MOCKS) return mockFriendships.acceptFriendship(id);
  return request<Friendship>(`/friendships/${id}/accept`, { method: 'PATCH' });
}

export function blockFriendship(id: string) {
  if (USE_MOCKS) return mockFriendships.blockFriendship(id);
  return request<Friendship>(`/friendships/${id}/block`, { method: 'PATCH' });
}
