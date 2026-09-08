import { API_URL } from '@/api/config';

// O backend guarda a foto da captura como caminho relativo ("/uploads/x.jpg").
// Para o <Image> conseguir baixar, prefixa a base da API. Deixa URIs absolutas
// (http, data:, blob:, file:) e vazias intactas.
export function photoUri(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^([a-z]+:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
}
