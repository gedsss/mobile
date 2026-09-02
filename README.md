# FishDex — App Mobile

App React Native (Expo + TypeScript + Expo Router) para o backend em `../` (FishDex API). Só para celular — sem layout desktop dedicado.

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

## Rodando

### Modo demonstração (sem backend, sem Postgres)

O `.env` já vem com `EXPO_PUBLIC_USE_MOCKS=true`. Nesse modo, todo o app funciona com dados fictícios guardados em memória (12 espécies do protótipo com ficha completa, 3 amigos + 2 pedidos pendentes, capturas próprias e do feed com reações) — dá pra logar, navegar por todas as telas, registrar uma captura nova (foto real da câmera/galeria) e ver XP/nível subindo, sem precisar do backend nem do Docker rodando. O login vem pré-preenchido (qualquer e-mail/senha serve; "Explorar catálogo sem entrar" faz login de convidado). O estado reseta a cada reload do app (`r` no terminal, ou fechar/abrir de novo).

```bash
npm install
npm start        # depois: 'w' pra abrir no navegador, ou escaneie o QR com o app Expo Go
```

### Modo real (contra o backend)

1. Backend rodando (`docker compose up -d`, `npm run dev` na raiz do projeto).
2. No `.env` da pasta `mobile/`: ajuste `EXPO_PUBLIC_API_URL` para o IP da sua máquina na rede local (não `localhost` — o celular físico via Expo Go não enxerga o `localhost` do computador; confirme o IP com `ipconfig`) e mude `EXPO_PUBLIC_USE_MOCKS` para `false`.
3. `npm install`
4. `npm start` (ou `npm run web`, `npm run android`, `npm run ios`)
5. Escaneie o QR code com o app **Expo Go** no celular, ou pressione `w` no terminal para abrir no navegador.

## Telas

Onboarding (3 slides, aparece uma vez) → Entrar/Criar conta (toggle numa tela só) →
Catálogo (busca + filtros + grade/lista) → Ficha da espécie (ficha técnica, iscas,
mapa de ocorrência, seus registros) → Novo registro (foto + espécie + medidas, com
sheet de sucesso e XP) → Coleção/Dex (grade numerada por raridade) → Feed (abas
Amigos/Minhas, reações inline, banner de pedidos de amizade) → Perfil (XP,
conquistas com progresso, diário). Amigos é uma tela acessada pelo feed e pelo
perfil, não é mais uma aba.

## Estrutura

```
src/
  app/            rotas (expo-router)
    (auth)/       onboarding, login, register — visível quando deslogado
    (tabs)/       species (Catálogo), feed, new-catch (＋), collection (Coleção), profile
    species/[id], catch/[id], user/[id], friends/index, friends/add
  api/            client HTTP (fetch), um módulo por recurso, hooks de react-query
    mock/         catálogo + capturas fictícias (portados do protótipo)
  auth/           AuthContext (sessão + token)
  components/     reutilizáveis (Button, Card, Stripes, Pill, FeedPostCard, SuccessSheet…)
  constants/      tokens de design (cores, raridade, habitat, tipografia, espaçamento)
  hooks/          useTheme/useRarity/useHabitat, useOnboarding
  utils/          format (datas/medidas), species (nº do Dex + filtros), storage
```

O onboarding usa uma flag persistida (`onboardingStorage` em `utils/storage.ts`) —
para revê-lo, limpe os dados do app / `localStorage` no navegador.

## Limitações conhecidas (dependem do backend atual)

- **Sem upload de foto real**: não existe endpoint `POST /uploads` no backend ainda. A tela de nova captura usa a URI local da foto escolhida como `photoUrl` — funciona para o fluxo completo (XP, nível, feed), mas a imagem só é visível no aparelho onde foi tirada, não é enviada a um servidor. Quando a estratégia de storage for definida (`CLAUDE.md`, decisão em aberto), trocar isso é uma mudança pequena e isolada em `src/app/(tabs)/new-catch.tsx`.
- **Reações sem contagem agregada (modo real)**: o backend não tem um `GET` para ler reações existentes numa captura. No modo demo o mock semeia contadores por post e o feed os mostra ao vivo; no modo real só a reação feita na sessão atual fica destacada, sem contadores.
- **Ficha técnica da espécie parcial no modo real**: família, habitat, tamanho médio, dieta, iscas e mapa de ocorrência vêm dos campos opcionais em `Species` que só o mock preenche. Contra o backend, essas seções somem e a ficha mostra só nome/científico/dificuldade/baseXp/descrição.
- **Onboarding e "Explorar sem entrar"**: o botão de convidado só aparece no modo demo (faz um login fake); o onboarding aparece uma vez por dispositivo (flag em `expo-secure-store`/`localStorage`).
- **Adicionar amigo é por código (ID)**: não existe endpoint de busca de usuário por nome. A tela "Adicionar amigo" usa o próprio `id` do usuário como código para compartilhar/colar, em vez de busca por username.
- **Perfil de amigo não lista as fotos das capturas**: só existe `GET /catches/me` (capturas do próprio usuário logado) — não há `GET /users/:id/catches`. O perfil de um amigo mostra nível, XP, conquistas e contagem por espécie (todos esses dados vêm de `GET /users/:id`), mas não uma galeria de fotos. Adicionar essa listagem exigiria um novo endpoint no backend.
- **Catálogo de espécies pode estar vazio**: `prisma/seed.ts` hoje só popula `Achievement`; nenhuma `Species` é criada automaticamente. Sem espécies cadastradas, a Pokédex e o seletor de espécie na nova captura ficam vazios — cadastre algumas manualmente (Prisma Studio: `npx prisma studio`) para testar o fluxo de captura.
- **Data da captura é sempre "agora"**: o campo "Data" no formulário é só leitura ("hoje") — não há seletor de data nativo; a captura é registrada com o horário do envio.
- **Peso em kg na UI, gramas na API**: o formulário pede o peso em kg (como no protótipo) e converte para `weightGrams` (× 1000) ao enviar.
- **Localização é só texto livre**: por causa da decisão de privacidade em aberto no `CLAUDE.md` sobre coordenadas exatas, o app não captura GPS — só um campo de texto opcional (`locationName`).
