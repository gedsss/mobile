import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'fishdex_token';
const ONBOARDING_KEY = 'fishdex_onboarding_seen';

// expo-secure-store não tem implementação nativa pra web (só iOS/Android);
// no navegador cai pra localStorage, que é o motivo do app rodar via
// `npm run web` sem precisar de dispositivo físico.
function webStorage(key: string) {
  return {
    get: async () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: async (value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignora ambientes sem localStorage (ex.: private mode bloqueado)
      }
    },
    clear: async () => {
      try {
        localStorage.removeItem(key);
      } catch {
        // no-op
      }
    },
  };
}

function nativeStorage(key: string) {
  return {
    get: () => SecureStore.getItemAsync(key),
    set: (value: string) => SecureStore.setItemAsync(key, value),
    clear: () => SecureStore.deleteItemAsync(key),
  };
}

const storage = (key: string) => (Platform.OS === 'web' ? webStorage(key) : nativeStorage(key));

export const tokenStorage = storage(TOKEN_KEY);

const onboardingRaw = storage(ONBOARDING_KEY);
export const onboardingStorage = {
  hasSeen: async () => (await onboardingRaw.get()) === '1',
  markSeen: () => onboardingRaw.set('1'),
  reset: () => onboardingRaw.clear(),
};
