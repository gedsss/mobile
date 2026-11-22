import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockUsers } from '@/api/mock/store';
import type { FeedCatch, UnlockedAchievement, UserProfile } from '@/api/types';

export function getMe() {
  if (USE_MOCKS) return mockUsers.getMe();
  return request<UserProfile>('/users/me');
}

export function getUser(id: string) {
  if (USE_MOCKS) return mockUsers.getUser(id);
  return request<UserProfile>(`/users/${id}`);
}

export function getUserAchievements(id: string) {
  if (USE_MOCKS) return mockUsers.getUserAchievements(id);
  return request<UnlockedAchievement[]>(`/users/${id}/achievements`);
}

export function getUserCatches(id: string) {
  if (USE_MOCKS) return mockUsers.getUserCatches(id);
  return request<FeedCatch[]>(`/users/${id}/catches`);
}
