import type { Difficulty, Species } from '@/api/types';

// Número no Dex a partir da posição no catálogo (ordem do backend/mock).
export function dexNumber(index: number) {
  return `#${String(index + 1).padStart(3, '0')}`;
}

export function dexNumberMap(list: Species[]): Record<string, string> {
  const map: Record<string, string> = {};
  list.forEach((s, i) => {
    map[s.id] = dexNumber(i);
  });
  return map;
}

export type SpeciesFilter = {
  search: string;
  chip: string;
  rarity: string;
  habitat: string;
  size: string;
  region: string;
};

export const EMPTY_FILTER: SpeciesFilter = {
  search: '',
  chip: 'Todas',
  rarity: 'Tudo',
  habitat: 'Tudo',
  size: 'Tudo',
  region: 'Tudo',
};

const RARITY_BY_LABEL: Record<string, Difficulty> = {
  Comum: 'EASY',
  Incomum: 'MEDIUM',
  Raro: 'HARD',
  Épico: 'EPIC',
  Lendário: 'LEGENDARY',
};

// Quantos filtros do painel (fora busca e chip) estão ativos.
export function activeFilterCount(filter: SpeciesFilter) {
  return (['rarity', 'habitat', 'size', 'region'] as const).filter(k => filter[k] !== 'Tudo').length;
}

const REGION_MATCHERS: Record<string, RegExp> = {
  Amazônia: /Amaz|Negro|Solimões|Mamirauá|Tucuruí|Tapajós|Xingu|Madeira|Araguaia|\(AM|\(PA|\(RO/,
  Sudeste: /Sudeste|SP|RJ|MG|ES|Paraná|Grande/,
  Litoral: /Litoral|Praia|Baía|Cabo|Vitória|Paranaguá|Mar aberto|Parcéis|Ilhas|Costões|Mangues|Estuários/i,
};

// Espelha filtered() do Claude Design. Filtros que dependem de campos ausentes
// (habitat / averageSizeCm / regions) simplesmente não excluem nada.
export function filterSpecies(
  list: Species[],
  filter: SpeciesFilter,
  isCaptured: (id: string) => boolean
): Species[] {
  const q = filter.search.trim().toLowerCase();

  return list.filter(f => {
    if (q && !(f.name.toLowerCase().includes(q) || (f.scientificName ?? '').toLowerCase().includes(q))) {
      return false;
    }

    if (filter.chip === 'Capturadas' && !isCaptured(f.id)) return false;
    if (filter.chip === 'Faltando' && isCaptured(f.id)) return false;

    if (filter.rarity !== 'Tudo' && f.difficulty !== RARITY_BY_LABEL[filter.rarity]) return false;

    if (filter.habitat === 'Água doce' && f.habitat && f.habitat !== 'Doce') return false;
    if (filter.habitat === 'Água salgada' && f.habitat && f.habitat !== 'Salgada') return false;

    const size = f.averageSizeCm;
    if (size != null) {
      if (filter.size === 'Até 30 cm' && size > 30) return false;
      if (filter.size === '30–90 cm' && (size < 30 || size > 90)) return false;
      if (filter.size === 'Acima de 90 cm' && size <= 90) return false;
    }

    if (filter.region !== 'Tudo') {
      const re = REGION_MATCHERS[filter.region];
      const regions = f.regions ?? [];
      if (re && regions.length && !regions.some(r => re.test(r.name))) return false;
      if (filter.region === 'Litoral' && f.habitat && f.habitat !== 'Salgada') return false;
    }

    return true;
  });
}

export const CHIP_OPTIONS = ['Todas', 'Capturadas', 'Faltando'] as const;

export const FILTER_GROUPS: { key: keyof SpeciesFilter; label: string; options: string[] }[] = [
  { key: 'rarity', label: 'Raridade', options: ['Tudo', 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'] },
  { key: 'habitat', label: 'Habitat', options: ['Tudo', 'Água doce', 'Água salgada'] },
  { key: 'size', label: 'Tamanho médio', options: ['Tudo', 'Até 30 cm', '30–90 cm', 'Acima de 90 cm'] },
  { key: 'region', label: 'Região', options: ['Tudo', 'Amazônia', 'Sudeste', 'Litoral'] },
];

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Sugestões para "busca sem resultado": espécies que compartilham alguma
// palavra (ou o começo dela) com o termo buscado, ignorando acentos.
export function suggestSpecies(list: Species[], query: string, max = 3): Species[] {
  const words = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter(w => w.length >= 3);
  if (!words.length) return [];
  return list
    .filter(s => {
      const haystack = normalize(`${s.name} ${s.scientificName ?? ''}`);
      return words.some(w => haystack.includes(w.slice(0, Math.max(3, w.length - 2))));
    })
    .slice(0, max);
}
