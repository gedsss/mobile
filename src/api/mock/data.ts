import type { Achievement, Catch, Species } from '@/api/types';

export const MOCK_ME_ID = 'mock-me';

// ---------------------------------------------------------------------------
// Catálogo de espécies — portado do Claude Design ("FishDex Mobile App Design").
// Os campos extras (habitat, family, averageSizeCm, diet, baits, regions,
// mapPins, tone) são opcionais no tipo Species: o backend real não os devolve e
// as telas omitem as seções correspondentes quando faltam.
// ---------------------------------------------------------------------------

const now = new Date().toISOString();

function species(
  partial: Omit<Species, 'createdAt' | 'updatedAt' | 'referenceImageUrl'> &
    Partial<Pick<Species, 'referenceImageUrl'>>
): Species {
  return { referenceImageUrl: null, createdAt: now, updatedAt: now, ...partial };
}

export const MOCK_SPECIES: Species[] = [
  species({
    id: 'sp-traira',
    name: 'Traíra',
    scientificName: 'Hoplias malabaricus',
    family: 'Erythrinidae',
    difficulty: 'EASY',
    baseXp: 15,
    habitat: 'Doce',
    averageSizeCm: 50,
    diet: 'Carnívoro',
    tone: ['#22453c', '#1b3931'],
    description:
      'Predadora de emboscada comum em açudes e brejos. Ataca iscas de superfície ao amanhecer e no fim da tarde.',
    baits: ['Isca de superfície', 'Minhoca', 'Peixe vivo'],
    regions: [
      { name: 'Açudes do Nordeste', season: 'ano todo' },
      { name: 'Vale do Ribeira', season: 'set–mar' },
    ],
    mapPins: [
      { x: '58%', y: '38%', label: 'NE' },
      { x: '48%', y: '68%', label: 'SP' },
    ],
  }),
  species({
    id: 'sp-betta',
    name: 'Betta',
    scientificName: 'Betta splendens',
    family: 'Osphronemidae',
    difficulty: 'EASY',
    baseXp: 10,
    habitat: 'Doce',
    averageSizeCm: 7,
    diet: 'Insetívoro',
    tone: ['#42264d', '#341e3d'],
    description:
      'Peixe de aquário originário de arrozais da Tailândia. Respira ar atmosférico pelo labirinto — dispensa aeração forte.',
    baits: ['Larva de mosquito', 'Ração em flocos'],
    regions: [{ name: 'Bacia do Mekong', season: 'aquarismo' }],
    mapPins: [{ x: '66%', y: '42%', label: 'Mekong' }],
  }),
  species({
    id: 'sp-tambaqui',
    name: 'Tambaqui',
    scientificName: 'Colossoma macropomum',
    family: 'Serrasalmidae',
    difficulty: 'MEDIUM',
    baseXp: 35,
    habitat: 'Doce',
    averageSizeCm: 90,
    diet: 'Omnívoro',
    tone: ['#1c3f47', '#16333b'],
    description:
      'Come frutos e sementes na várzea amazônica. Boca forte: exige anzol robusto e linha resistente à abrasão.',
    baits: ['Fruto de açaí', 'Massa de milho', 'Ração'],
    regions: [
      { name: 'Bacia Amazônica', season: 'nov–abr' },
      { name: 'Pantanal', season: 'mai–ago' },
    ],
    mapPins: [
      { x: '38%', y: '32%', label: 'AM' },
      { x: '46%', y: '58%', label: 'MS' },
    ],
  }),
  species({
    id: 'sp-peixe-palhaco',
    name: 'Peixe-palhaço',
    scientificName: 'Amphiprion ocellaris',
    family: 'Pomacentridae',
    difficulty: 'MEDIUM',
    baseXp: 30,
    habitat: 'Salgada',
    averageSizeCm: 9,
    diet: 'Omnívoro',
    tone: ['#6d3c1d', '#5a3118'],
    description:
      'Vive em simbiose com anêmonas de recife. Em aquário marinho, precisa de rocha viva e parâmetros estáveis.',
    baits: ['Artêmia', 'Ração marinha'],
    regions: [
      { name: 'Indo-Pacífico', season: 'ano todo' },
      { name: 'Grande Barreira', season: 'ano todo' },
    ],
    mapPins: [
      { x: '70%', y: '46%', label: 'Indo-Pac.' },
      { x: '78%', y: '66%', label: 'AU' },
    ],
  }),
  species({
    id: 'sp-pacu',
    name: 'Pacu',
    scientificName: 'Piaractus mesopotamicus',
    family: 'Serrasalmidae',
    difficulty: 'MEDIUM',
    baseXp: 30,
    habitat: 'Doce',
    averageSizeCm: 60,
    diet: 'Omnívoro',
    tone: ['#2f4522', '#26381c'],
    description:
      'Muito comum em pesqueiros do Sudeste. Briga forte em água rasa e aceita iscas vegetais.',
    baits: ['Massa de trigo', 'Milho verde', 'Coração de galinha'],
    regions: [
      { name: 'Bacia do Paraná', season: 'out–mar' },
      { name: 'Pantanal', season: 'ano todo' },
    ],
    mapPins: [
      { x: '44%', y: '60%', label: 'PR' },
      { x: '40%', y: '52%', label: 'MS' },
    ],
  }),
  species({
    id: 'sp-tucunare-acu',
    name: 'Tucunaré-açu',
    scientificName: 'Cichla temensis',
    family: 'Cichlidae',
    difficulty: 'HARD',
    baseXp: 45,
    habitat: 'Doce',
    averageSizeCm: 70,
    diet: 'Carnívoro',
    tone: ['#134539', '#0e392f'],
    description:
      'O ciclídeo mais cobiçado do Brasil. Ataque explosivo em iscas de superfície perto de galhadas e pedrais.',
    baits: ['Zara / isca de hélice', 'Jig 3/8 oz', 'Lambari vivo'],
    regions: [
      { name: 'Rio Negro (AM)', season: 'set–fev' },
      { name: 'Lago de Tucuruí', season: 'jun–nov' },
      { name: 'Represas do Sudeste', season: 'out–mar' },
    ],
    mapPins: [
      { x: '34%', y: '30%', label: 'Rio Negro' },
      { x: '52%', y: '34%', label: 'Tucuruí' },
      { x: '50%', y: '62%', label: 'SE' },
    ],
  }),
  species({
    id: 'sp-robalo-flecha',
    name: 'Robalo-flecha',
    scientificName: 'Centropomus undecimalis',
    family: 'Centropomidae',
    difficulty: 'HARD',
    baseXp: 55,
    habitat: 'Salgada',
    averageSizeCm: 90,
    diet: 'Carnívoro',
    tone: ['#1b3f54', '#153446'],
    description:
      'Vive em estuários, manguezais e barras de rio. Sensível a barulho — aproximação silenciosa é decisiva.',
    baits: ['Camarão vivo', 'Shad 4"', 'Bailarina'],
    regions: [
      { name: 'Litoral SE/S', season: 'set–abr' },
      { name: 'Baía de Paranaguá', season: 'nov–mar' },
    ],
    mapPins: [
      { x: '56%', y: '58%', label: 'Litoral SE' },
      { x: '52%', y: '72%', label: 'PR' },
    ],
  }),
  species({
    id: 'sp-anchova',
    name: 'Anchova',
    scientificName: 'Pomatomus saltatrix',
    family: 'Pomatomidae',
    difficulty: 'HARD',
    baseXp: 50,
    habitat: 'Salgada',
    averageSizeCm: 70,
    diet: 'Carnívoro',
    tone: ['#1c3141', '#162836'],
    description:
      'Caça em cardumes na arrebentação durante o inverno. Dentição afiada exige encastoamento de aço.',
    baits: ['Sardinha inteira', 'Jig metálico', 'Isca de arrasto'],
    regions: [
      { name: 'Praias do Sul', season: 'mai–ago' },
      { name: 'Cabo Frio', season: 'jun–set' },
    ],
    mapPins: [
      { x: '50%', y: '74%', label: 'Sul' },
      { x: '58%', y: '56%', label: 'RJ' },
    ],
  }),
  species({
    id: 'sp-garoupa',
    name: 'Garoupa',
    scientificName: 'Epinephelus marginatus',
    family: 'Serranidae',
    difficulty: 'EPIC',
    baseXp: 65,
    habitat: 'Salgada',
    averageSizeCm: 100,
    diet: 'Carnívoro',
    tone: ['#3e3120', '#32281a'],
    description:
      'Territorial, vive em lajes e naufrágios profundos. Recolhimento imediato evita que ela se enfie na pedra.',
    baits: ['Lula', 'Peixe cortado', 'Jig de fundo'],
    regions: [
      { name: 'Lajes de SP/RJ', season: 'ano todo' },
      { name: 'Abrolhos', season: 'set–mar' },
    ],
    mapPins: [
      { x: '56%', y: '58%', label: 'SP/RJ' },
      { x: '62%', y: '48%', label: 'BA' },
    ],
  }),
  species({
    id: 'sp-dourado',
    name: 'Dourado',
    scientificName: 'Salminus brasiliensis',
    family: 'Bryconidae',
    difficulty: 'EPIC',
    baseXp: 70,
    habitat: 'Doce',
    averageSizeCm: 80,
    diet: 'Carnívoro',
    tone: ['#5b4614', '#4a3a11'],
    description:
      'O "tigre dos rios": saltos e corridas longas. Sobe corredeiras na piracema em busca de cardumes.',
    baits: ['Isca artificial de meia-água', 'Tuvira', 'Colher giratória'],
    regions: [
      { name: 'Rio Paraná', season: 'set–nov' },
      { name: 'Rio Paraguai', season: 'ago–out' },
    ],
    mapPins: [
      { x: '44%', y: '64%', label: 'Paraná' },
      { x: '40%', y: '56%', label: 'Paraguai' },
    ],
  }),
  species({
    id: 'sp-pirarucu',
    name: 'Pirarucu',
    scientificName: 'Arapaima gigas',
    family: 'Arapaimidae',
    difficulty: 'LEGENDARY',
    baseXp: 120,
    habitat: 'Doce',
    averageSizeCm: 200,
    diet: 'Carnívoro',
    tone: ['#471f26', '#39191f'],
    description:
      'Gigante amazônico que sobe à superfície para respirar. Pesca permitida só em áreas de manejo comunitário.',
    baits: ['Peixe vivo grande', 'Isca de superfície XL'],
    regions: [
      { name: 'Mamirauá (AM)', season: 'set–nov' },
      { name: 'Rio Araguaia', season: 'jun–set' },
    ],
    mapPins: [
      { x: '34%', y: '34%', label: 'Mamirauá' },
      { x: '52%', y: '46%', label: 'Araguaia' },
    ],
  }),
  species({
    id: 'sp-marlim-azul',
    name: 'Marlim-azul',
    scientificName: 'Makaira nigricans',
    family: 'Istiophoridae',
    difficulty: 'LEGENDARY',
    baseXp: 150,
    habitat: 'Salgada',
    averageSizeCm: 350,
    diet: 'Carnívoro',
    tone: ['#182c52', '#132444'],
    description:
      'Troféu do oceano aberto. Corrida de centenas de metros — pesque com cadeira de luta e solte com cuidado.',
    baits: ['Trolling de superfície', 'Cavala viva'],
    regions: [
      { name: 'Vitória (ES)', season: 'nov–mar' },
      { name: 'Cabo Frio offshore', season: 'dez–abr' },
    ],
    mapPins: [
      { x: '64%', y: '52%', label: 'ES' },
      { x: '60%', y: '60%', label: 'RJ' },
    ],
  }),
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'achievement-first-catch',
    code: 'FIRST_CATCH',
    name: 'Primeira Captura',
    description: 'Registrou sua primeira captura.',
    iconUrl: null,
    createdAt: now,
  },
  {
    id: 'achievement-ten-species',
    code: 'TEN_SPECIES',
    name: 'Colecionador',
    description: 'Capturou 10 espécies diferentes.',
    iconUrl: null,
    createdAt: now,
  },
  {
    id: 'achievement-first-legendary',
    code: 'FIRST_LEGENDARY',
    name: 'Lendário',
    description: 'Capturou uma espécie LENDÁRIA pela primeira vez.',
    iconUrl: null,
    createdAt: now,
  },
];

export interface MockUser {
  id: string;
  username: string;
  email: string;
  handle: string;
  avatarTone: [string, string];
  memberSince: string;
  levelOverride?: number;
}

export const MOCK_USERS: Record<string, MockUser> = {
  [MOCK_ME_ID]: {
    id: MOCK_ME_ID,
    username: 'Gedson Silva',
    email: 'gedsss@fishdex.app',
    handle: '@gedsss',
    avatarTone: ['#0a3d4a', '#073040'],
    memberSince: '2026-03-01',
  },
  'mock-marina': {
    id: 'mock-marina',
    username: 'Marina Duarte',
    email: 'marina@fishdex.app',
    handle: '@madu',
    avatarTone: ['#1b3f54', '#153446'],
    memberSince: '2025-08-14',
    levelOverride: 11,
  },
  'mock-caio': {
    id: 'mock-caio',
    username: 'Caio Rezende',
    email: 'caio@fishdex.app',
    handle: '@caiorz',
    avatarTone: ['#134539', '#0e392f'],
    memberSince: '2025-11-02',
    levelOverride: 8,
  },
  'mock-bia': {
    id: 'mock-bia',
    username: 'Bia Nakamura',
    email: 'bia@fishdex.app',
    handle: '@bianaka',
    avatarTone: ['#42264d', '#341e3d'],
    memberSince: '2025-05-20',
    levelOverride: 14,
  },
  'mock-rafa': {
    id: 'mock-rafa',
    username: 'Rafael Lopes',
    email: 'rafael@fishdex.app',
    handle: '@rafal',
    avatarTone: ['#5b4614', '#4a3a11'],
    memberSince: '2026-06-10',
    levelOverride: 5,
  },
  'mock-duda': {
    id: 'mock-duda',
    username: 'Duda Prado',
    email: 'duda@fishdex.app',
    handle: '@dudap',
    avatarTone: ['#2f4522', '#26381c'],
    memberSince: '2026-07-01',
    levelOverride: 3,
  },
};

// ---------------------------------------------------------------------------
// Capturas iniciais. Datas em pt-BR abreviado → ISO. xpAwarded = baseXp da
// espécie no momento da captura (snapshot, como no backend).
// ---------------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

function at(day: number, month: keyof typeof MONTHS | string, year: number, hour = 8) {
  return new Date(year, MONTHS[month], day, hour).toISOString();
}
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

const xpOf = (speciesId: string) => MOCK_SPECIES.find(s => s.id === speciesId)?.baseXp ?? 0;

interface Seed {
  id: string;
  userId: string;
  speciesId: string;
  capturedAt: string;
  locationName: string | null;
  weightGrams: number | null;
  lengthCm: number | null;
}

const SEEDS: Seed[] = [
  // ---- Minhas capturas (diário) ----
  { id: 'c-me-1', userId: MOCK_ME_ID, speciesId: 'sp-traira', capturedAt: at(12, 'mar', 2026), locationName: 'Represa de Guarapiranga', weightGrams: 1400, lengthCm: 42 },
  { id: 'c-me-2', userId: MOCK_ME_ID, speciesId: 'sp-betta', capturedAt: at(2, 'fev', 2026), locationName: 'Aquário 40 L — casa', weightGrams: null, lengthCm: null },
  { id: 'c-me-3', userId: MOCK_ME_ID, speciesId: 'sp-tambaqui', capturedAt: at(8, 'jan', 2026), locationName: 'Rio Solimões — AM', weightGrams: 6200, lengthCm: 61 },
  { id: 'c-me-4', userId: MOCK_ME_ID, speciesId: 'sp-peixe-palhaco', capturedAt: at(21, 'dez', 2025), locationName: 'Aquário marinho — clube', weightGrams: null, lengthCm: null },
  { id: 'c-me-5', userId: MOCK_ME_ID, speciesId: 'sp-pacu', capturedAt: at(28, 'fev', 2026), locationName: 'Pesqueiro Maeda — SP', weightGrams: 3100, lengthCm: 47 },
  { id: 'c-me-6', userId: MOCK_ME_ID, speciesId: 'sp-tucunare-acu', capturedAt: at(14, 'out', 2025), locationName: 'Rio Negro — Barcelos', weightGrams: 4800, lengthCm: 68 },
  { id: 'c-me-7', userId: MOCK_ME_ID, speciesId: 'sp-tucunare-acu', capturedAt: at(3, 'nov', 2025), locationName: 'Represa de Furnas — MG', weightGrams: 1900, lengthCm: 44 },
  { id: 'c-me-8', userId: MOCK_ME_ID, speciesId: 'sp-robalo-flecha', capturedAt: at(19, 'jan', 2026), locationName: 'Barra de Guaratuba — PR', weightGrams: 5300, lengthCm: 78 },
  { id: 'c-me-9', userId: MOCK_ME_ID, speciesId: 'sp-dourado', capturedAt: at(5, 'out', 2025), locationName: 'Rio Paraná — Porto Rico', weightGrams: 7600, lengthCm: 79 },

  // ---- Capturas de amigos (feed) ----
  { id: 'c-fr-1', userId: 'mock-marina', speciesId: 'sp-pirarucu', capturedAt: hoursAgo(2), locationName: 'Mamirauá — AM', weightGrams: 18400, lengthCm: 148 },
  { id: 'c-fr-2', userId: 'mock-caio', speciesId: 'sp-tambaqui', capturedAt: daysAgo(2), locationName: 'Rio Solimões — AM', weightGrams: 6200, lengthCm: 61 },
  { id: 'c-fr-3', userId: 'mock-bia', speciesId: 'sp-peixe-palhaco', capturedAt: daysAgo(3), locationName: 'Aquário marinho — clube', weightGrams: null, lengthCm: null },
  { id: 'c-fr-4', userId: 'mock-marina', speciesId: 'sp-anchova', capturedAt: daysAgo(4), locationName: 'Praia do Cassino — RS', weightGrams: 4200, lengthCm: 71 },
  { id: 'c-fr-5', userId: 'mock-caio', speciesId: 'sp-dourado', capturedAt: daysAgo(5), locationName: 'Rio Paraná — Porto Rico', weightGrams: 7600, lengthCm: 79 },
  { id: 'c-fr-6', userId: 'mock-bia', speciesId: 'sp-marlim-azul', capturedAt: daysAgo(6), locationName: 'Vitória — ES', weightGrams: 92000, lengthCm: 280 },
  { id: 'c-fr-7', userId: 'mock-marina', speciesId: 'sp-tucunare-acu', capturedAt: daysAgo(9), locationName: 'Lago de Tucuruí — PA', weightGrams: 2100, lengthCm: 49 },
  { id: 'c-fr-8', userId: 'mock-caio', speciesId: 'sp-pacu', capturedAt: daysAgo(13), locationName: 'Pesqueiro Maeda — SP', weightGrams: 2800, lengthCm: 44 },
];

export const INITIAL_MOCK_CATCHES: Catch[] = SEEDS.map(seed => ({
  id: seed.id,
  userId: seed.userId,
  speciesId: seed.speciesId,
  photoUrl: '',
  xpAwarded: xpOf(seed.speciesId),
  capturedAt: seed.capturedAt,
  createdAt: seed.capturedAt,
  weightGrams: seed.weightGrams,
  lengthCm: seed.lengthCm,
  locationLat: null,
  locationLng: null,
  locationName: seed.locationName,
}));

// Reações pré-existentes por captura (o backend não expõe leitura agregada; o
// mock semeia para o feed mostrar contadores realistas).
export const INITIAL_MOCK_REACTIONS: Record<string, Partial<Record<string, number>>> = {
  'c-fr-1': { FIRE: 9, WOW: 6, BIG_ONE: 4, LOVE: 2 },
  'c-fr-2': { LIKE: 4, BIG_ONE: 2 },
  'c-fr-3': { LOVE: 12, WOW: 4 },
  'c-fr-4': { LIKE: 5, FIRE: 2 },
  'c-fr-5': { FIRE: 8, CLAP: 5, WOW: 2 },
  'c-fr-6': { WOW: 7, BIG_ONE: 5, FIRE: 3 },
  'c-fr-7': { LIKE: 6, CLAP: 3 },
  'c-fr-8': { LIKE: 3 },
};

// Reação que "eu" já deixei em algumas capturas.
export const INITIAL_MY_REACTIONS: Record<string, string> = {
  'c-fr-2': 'FIRE',
  'c-fr-5': 'CLAP',
};

// Slides do onboarding (3 telas) — portado do Claude Design.
export const ONBOARDING_SLIDES = [
  {
    kicker: 'Bem-vindo',
    title: 'Todo peixe tem um lugar no seu Dex',
    body:
      'FishDex é o seu catálogo vivo de espécies. Cada captura registrada preenche uma ficha e desbloqueia a espécie na sua coleção.',
    cta: 'Continuar',
    tone: ['#0a3d4a', '#062a34'] as [string, string],
  },
  {
    kicker: 'Identifique',
    title: 'Fotografe e descubra o que você pegou',
    body:
      'A foto sugere a espécie e abre a ficha técnica: família, habitat, tamanho médio, dieta e as iscas que funcionam.',
    cta: 'Continuar',
    tone: ['#0b423e', '#093632'] as [string, string],
  },
  {
    kicker: 'Evolua',
    title: 'Suba de nível a cada nova espécie',
    body:
      'Espécies raras valem mais XP. Complete o Dex, desbloqueie conquistas e acompanhe seu diário de pesca por local e data.',
    cta: 'Começar a pescar',
    tone: ['#5a4211', '#48350d'] as [string, string],
  },
];
