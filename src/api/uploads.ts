import { uploadRequest } from '@/api/client';
import { USE_MOCKS } from '@/api/config';

// Envia a foto da captura para o backend (POST /uploads) e devolve o caminho
// relativo servido de volta ("/uploads/<uuid>.<ext>"). O caller guarda isso em
// `photoUrl`; para exibir, passe por `resolvePhotoUrl()` (src/utils/photo.ts).
export async function uploadPhoto(uri: string): Promise<{ url: string }> {
  // Modo demo: sem backend, o próprio URI local já serve de placeholder.
  if (USE_MOCKS) return { url: uri };

  const name = uri.split('/').pop() || `captura-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(name);
  const ext = (match?.[1] ?? 'jpg').toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const form = new FormData();

  if (uri.startsWith('data:') || uri.startsWith('blob:')) {
    // No navegador (Expo web), o image-picker devolve um data:/blob: URI.
    const blob = await (await fetch(uri)).blob();
    form.append('file', blob, name);
  } else {
    // Em dispositivo (iOS/Android), o React Native aceita { uri, name, type }.
    form.append('file', { uri, name, type: mime } as unknown as Blob);
  }

  return uploadRequest<{ url: string }>('/uploads', form);
}
