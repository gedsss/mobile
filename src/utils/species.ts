import type { Species } from '@/api/types';

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
  habitat: string;
  size: string;
  region: string;
};

export const EMPTY_FILTER: SpeciesFilter = {
  search: '',
  chip: 'Todos',
  habitat: 'Tudo',
  size: 'Tudo',
  region: 'Tudo',
};

const REGION_MATCHERS: Record<string, RegExp> = {
  Amazônia: /Amaz|Negro|Solimões|Mamirauá|Tucuruí|Araguaia/i,
  Sudeste: /SE|SP|RJ|Furnas|Sudeste|MG|ES|Ribeira|Paraná/i,
  Litoral: /Litoral|Praia|Barra|Cabo|Baía|Vitória|Paranaguá|Cassino/i,
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

    if (filter.chip === 'Água doce' && f.habitat && f.habitat !== 'Doce') return false;
    if (filter.chip === 'Água salgada' && f.habitat && f.habitat !== 'Salgada') return false;
    if (filter.chip === 'Lendários' && f.difficulty !== 'LEGENDARY') return false;
    if (filter.chip === 'Faltando' && isCaptured(f.id)) return false;

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

export const CHIP_OPTIONS = ['Todos', 'Água doce', 'Água salgada', 'Lendários', 'Faltando'];

export const FILTER_GROUPS: { key: keyof SpeciesFilter; label: string; options: string[] }[] = [
  { key: 'habitat', label: 'Habitat', options: ['Tudo', 'Água doce', 'Água salgada'] },
  { key: 'size', label: 'Tamanho médio', options: ['Tudo', 'Até 30 cm', '30–90 cm', 'Acima de 90 cm'] },
  { key: 'region', label: 'Região', options: ['Tudo', 'Amazônia', 'Sudeste', 'Litoral'] },
];
