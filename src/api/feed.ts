import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockFeed } from '@/api/mock/store';
import type { FeedCatch } from '@/api/types';

export function getFeed(page: number, limit = 10): Promise<FeedCatch[]> {
  if (USE_MOCKS) return mockFeed.getFeed(page, limit);
  return request<FeedCatch[]>(`/feed?page=${page}&limit=${limit}`);
}

export function getMyPosts(page: number, limit = 10): Promise<FeedCatch[]> {
  if (USE_MOCKS) return mockFeed.getMyPosts(page, limit);
  return request<FeedCatch[]>(`/catches/me?page=${page}&limit=${limit}`);
}
