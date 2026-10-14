// Service worker mínimo — torna o app instalável (PWA) e dá um fallback offline.
// Estratégia: network-first. Online sempre pega a versão nova (as atualizações
// aparecem ao recarregar); offline serve a última vista. Só cacheia o próprio
// site: a API roda em outra origem (EXPO_PUBLIC_API_URL) e nunca é cacheada,
// para não guardar dados desatualizados.
const CACHE = 'fishdex-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // só o próprio site
  if (url.pathname.startsWith('/api/')) return;     // caso a API seja servida no mesmo domínio
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        // offline: rota ainda não visitada cai no index (o roteador resolve no cliente)
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/') : undefined))
      )
  );
});
