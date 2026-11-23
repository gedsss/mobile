import { API_URL } from '@/api/config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  // Content-Type só quando há corpo: o Fastify responde 400
  // (FST_ERR_CTP_EMPTY_JSON_BODY) para JSON declarado sem corpo — era o que
  // quebrava os PATCH sem body (aceitar/bloquear amizade).
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message ?? data.error)) ||
      `Erro ${response.status}`;
    if (response.status === 401 && auth) unauthorizedHandler?.();
    throw new ApiError(response.status, message);
  }

  return data as T;
}

// Envio de arquivo (multipart). Não define Content-Type — o fetch monta o
// boundary sozinho a partir do FormData; só injeta o token de auth.
export async function uploadRequest<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message ?? data.error)) ||
      `Erro ${response.status}`;
    if (response.status === 401) unauthorizedHandler?.();
    throw new ApiError(response.status, message);
  }

  return data as T;
}
