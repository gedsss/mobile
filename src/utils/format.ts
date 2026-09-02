import type { Catch } from '@/api/types';

export function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `há ${diffDays} d`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateInput(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

// "12 mar 2026"
export function formatShortDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');
}

// "mar 2026"
export function formatMonthYear(iso: string) {
  return new Date(iso)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '');
}

// gramas → "1,4 kg" (ou "820 g" abaixo de 1 kg)
export function formatWeight(grams: number) {
  if (grams < 1000) return `${grams} g`;
  return `${(grams / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

// "12 mar 2026 · 1,4 kg · 42 cm" — pula os campos ausentes
export function formatCatchMeta(item: Pick<Catch, 'capturedAt' | 'weightGrams' | 'lengthCm'>) {
  const parts = [formatShortDate(item.capturedAt)];
  if (item.weightGrams != null) parts.push(formatWeight(item.weightGrams));
  if (item.lengthCm != null) parts.push(`${item.lengthCm} cm`);
  return parts.join(' · ');
}
