import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockCatches } from '@/api/mock/store';
import type { Catch, FeedCatch } from '@/api/types';

export interface CreateCatchInput {
  speciesId: string;
  photoUrl: string;
  capturedAt: string;
  weightGrams?: number;
  lengthCm?: number;
  locationName?: string;
}

export function createCatch(data: CreateCatchInput) {
  if (USE_MOCKS) return mockCatches.createCatch(data);
  return request<Catch>('/catches', { method: 'POST', body: data });
}

// O backend enriquece as capturas do próprio usuário com autor/reações
// (mesmo shape do feed) — por isso FeedCatch em vez de Catch.
export function getMyCatches(): Promise<FeedCatch[]> {
  if (USE_MOCKS) return mockCatches.getMyCatches();
  return request<FeedCatch[]>('/catches/me');
}

export function getCatch(id: string): Promise<FeedCatch> {
  if (USE_MOCKS) return mockCatches.getCatch(id);
  return request<FeedCatch>(`/catches/${id}`);
}
