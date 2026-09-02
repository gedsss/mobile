import { request } from '@/api/client';
import { USE_MOCKS } from '@/api/config';
import { mockAuth } from '@/api/mock/store';
import type { AuthUser } from '@/api/types';

export function register(data: { username: string; email: string; password: string }) {
  if (USE_MOCKS) return mockAuth.register(data);
  return request<AuthUser>('/auth/register', { method: 'POST', body: data, auth: false });
}

export function login(data: { email: string; password: string }) {
  if (USE_MOCKS) return mockAuth.login(data.email);
  return request<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: data,
    auth: false,
  });
}
