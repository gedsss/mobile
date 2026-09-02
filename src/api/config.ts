// Em dispositivo físico via Expo Go, "localhost" aponta pro próprio celular,
// não pro computador rodando o backend — defina EXPO_PUBLIC_API_URL no .env
// da pasta mobile/ com o IP da máquina na mesma rede (ex.: http://192.168.0.10:3000).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Liga dados fictícios em memória (sem rede, sem backend, sem Postgres) —
// útil pra navegar pelo app enquanto o servidor/banco não estão no ar.
// Desligue voltando EXPO_PUBLIC_USE_MOCKS pra "false" no .env quando o
// backend estiver disponível.
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
