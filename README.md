# FishDex — App Mobile

App React Native (Expo + TypeScript + Expo Router) para a FishDex API (backend em
`../../PROJETO-INTEGRADOR BACK 2026-2`). Só para celular — sem layout desktop dedicado.

O visual segue o protótipo do Claude Design ("FishDex Mobile App Design"): tema
água-profunda com acento laranja/âmbar (claro/escuro adaptativos, paleta em
`src/constants/theme.ts`), tipografia Baloo 2 nos títulos, faixas diagonais como
placeholder das fotos (`src/components/stripes.tsx`) e barra de abas flutuante.

## Stack

- Expo SDK 57 + Expo Router (file-based routing, `Stack.Protected` para o fluxo de auth)
- TypeScript
- `@tanstack/react-query` (cache, paginação, mutações)
- `expo-secure-store` (token JWT)
- `expo-image-picker` (foto da captura), `expo-clipboard` (copiar código de amigo)
- `@expo-google-fonts/baloo-2` (títulos) + fonte do sistema (corpo de texto)
- `@expo/vector-icons` (Ionicons)

## Rodando (contra o backend)

1. **Backend no ar** — ver `../../PROJETO-INTEGRADOR BACK 2026-2/INTEGRACAO.md`
   (resumo: `docker compose up -d`, `npx prisma migrate deploy`, `npx tsx prisma/seed.ts`, `npm run dev`).

2. Configurar o `.env` desta pasta:

   ```bash
   cp .env.example .env
   ```

   ```bash
   EXPO_PUBLIC_API_URL=http://SEU-IP:3000   # IP da máquina do backend na rede local
   EXPO_PUBLIC_USE_MOCKS=false              # false = fala com o backend
   ```

   Descubra o IP com `ipconfig` (Windows). **Não use `localhost`** se for abrir no
   celular físico — o Expo Go não enxerga o localhost do PC. No navegador, na mesma
   máquina do backend, `http://localhost:3000` serve.

3. Rodar:

   ```bash
   npm install
   npm start        # 'w' abre no navegador; ou escaneie o QR com o app Expo Go
   ```

4. Login demo (criado pelo seed do backend): **`gedson@fishdex.app` / `pescaria123`**.
   Esse usuário já tem amigos (Marina, Caio), capturas e feed com conteúdo.

### Modo demo (sem backend)

Para navegar pelas telas sem subir nada: `EXPO_PUBLIC_USE_MOCKS=true` no `.env`.
O app passa a usar dados fictícios em memória (`src/api/mock/`, 12 espécies com ficha
completa, 3 amigos, capturas e reações), qualquer e-mail/senha loga, e aparece o
botão "Explorar catálogo sem entrar". O estado reseta a cada reload.

## Telas

Onboarding (3 slides, uma vez) → Entrar/Criar conta → Catálogo (busca + filtros +
grade/lista) → Ficha da espécie (ficha técnica, iscas, mapa de ocorrência, seus
registros) → Novo registro (foto + espécie + medidas, sobe a foto pro servidor,
sheet de sucesso com XP) → Coleção/Dex (grade numerada por raridade) → Feed (abas
Amigos/Minhas, reações inline com contador, banner de pedidos) → Perfil (XP,
conquistas com progresso, diário) → Perfil de amigo (nível, conquistas, galeria de
capturas, contagem por espécie). Amigos é uma tela acessada pelo feed e pelo perfil.

## Estrutura

```
src/
  app/            rotas (expo-router)
    (auth)/       onboarding, login, register — visível quando deslogado
    (tabs)/       species (Catálogo), feed, new-catch (＋), collection, profile
    species/[id], catch/[id], user/[id], friends/index, friends/add
  api/            client HTTP (fetch), um módulo por recurso, hooks de react-query
    mock/         catálogo + capturas fictícias (só quando EXPO_PUBLIC_USE_MOCKS=true)
  auth/           AuthContext (sessão + token)
  components/     reutilizáveis (Button, Card, Stripes, Pill, FeedPostCard, ReactionBar…)
  constants/      tokens de design (cores, raridade, habitat, tipografia, espaçamento)
  hooks/          useTheme/useRarity/useHabitat, useOnboarding
  utils/          format (datas/medidas), species (nº do Dex + filtros), photo, storage
```

Cada `src/api/<recurso>.ts` tem o mesmo formato: se `USE_MOCKS`, chama o mock;
senão, `request()` (ou `uploadRequest()` para o multipart) contra `EXPO_PUBLIC_API_URL`.
`src/utils/photo.ts` (`photoUri`) prefixa a base da API nos caminhos `/uploads/...`
que o backend devolve.

## Limitações conhecidas

- **Data da captura é sempre "agora"**: o campo "Data" no formulário é só leitura — não
  há seletor de data nativo; a captura é registrada com o horário do envio.
- **Peso em kg na UI, gramas na API**: o formulário pede kg e converte para
  `weightGrams` (× 1000) ao enviar.
- **Localização é só texto livre** (`locationName`): por decisão de privacidade em
  aberto no `CLAUDE.md` do backend, o app não captura GPS.
- **Bloqueio de amizade** existe na API (`PATCH /friendships/:id/block`) mas as
  regras exatas do estado `BLOCKED` ainda estão em aberto no backend.
- **Fotos ficam no disco do servidor de dev** (`uploads/` do backend, gitignorado) —
  some se o servidor for recriado. Para produção, trocar por bucket externo é uma
  mudança isolada em `src/api/uploads.ts` + módulo `uploads` do backend.
- **CORS**: no navegador (`npm run web`), o backend precisa liberar a origem do Expo
  (`localhost:8081`) — já está configurado (`app.register(cors, …)` com todos os
  métodos). No celular (Expo Go) não há CORS.
