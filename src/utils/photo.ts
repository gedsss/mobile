import { API_URL } from '@/api/config';

// O backend guarda fotos como caminho relativo ("/uploads/x.jpg"); o app
// prefixa a URL da API. URLs absolutas e file:// locais passam direto.
export function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/')) return `${API_URL.replace(/\/$/, '')}${url}`;
  return url;
}
