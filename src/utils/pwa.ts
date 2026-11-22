import { Platform } from 'react-native';

// Registra o service worker na versão web — é o que faz o navegador oferecer
// "Instalar app" / "Adicionar à tela inicial". No app nativo não faz nada.
export function registerServiceWorker() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  // Em desenvolvimento o cache atrapalha o hot reload; só registra no build.
  if (__DEV__) return;

  const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
