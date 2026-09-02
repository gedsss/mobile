import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockSpecies } from '@/api/mock/store';
import type { Species } from '@/api/types';

export function getSpeciesList() {
  if (USE_MOCKS) return mockSpecies.getSpeciesList();
  return request<Species[]>('/species', { auth: false });
}

export function getSpecies(id: string) {
  if (USE_MOCKS) return mockSpecies.getSpecies(id);
  return request<Species>(`/species/${id}`, { auth: false });
}
