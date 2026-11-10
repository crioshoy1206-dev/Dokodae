const V = 'th-v20';
const FILES = ['/', '/index.html', '/boot.js', '/cloud.js', '/vendor/firebase.js', '/app.js', '/data/cards.js', '/manifest.json', '/icon-192.png', '/apple-touch-icon.png', '/favicon.png', '/fonts/gn-kill-gothic-ub-kana.woff2'];
const TILES = 'th-tiles';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== TILES).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // 지도 타일: 한 번 본 곳은 저장해 두고 오프라인에서도 보여줘요
  if (u.hostname === 'tile.openstreetmap.org' || u.hostname === 'api.maptiler.com' || u.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(caches.open(TILES).then((c) => c.match(e.request).then((m) => m || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  // 네트워크 우선, 실패하면 캐시 (오프라인에서도 열리게)
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(V).then((c) => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then((m) => m || caches.match('/index.html'))));
});
