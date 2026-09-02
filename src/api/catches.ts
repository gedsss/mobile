import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockCatches } from '@/api/mock/store';
import type { Catch } from '@/api/types';

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

export function getMyCatches() {
  if (USE_MOCKS) return mockCatches.getMyCatches();
  return request<Catch[]>('/catches/me');
}

export function getCatch(id: string) {
  if (USE_MOCKS) return mockCatches.getCatch(id);
  return request<Catch>(`/catches/${id}`);
}
