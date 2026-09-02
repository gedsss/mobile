import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockAchievements } from '@/api/mock/store';
import type { Achievement } from '@/api/types';

export function getAchievements() {
  if (USE_MOCKS) return mockAchievements.getAchievements();
  return request<Achievement[]>('/achievements', { auth: false });
}
