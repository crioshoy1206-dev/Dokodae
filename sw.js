const V = 'th-v29';
const FILES = ['/', '/index.html', '/boot.js', '/cloud.js', '/vendor/firebase.js', '/app.js', '/data/cards.js', '/data/base.js', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/favicon.png', '/fonts/gn-kill-gothic-ub-kana.woff2'];
const TILES = 'th-tiles';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== TILES).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // 지도 타일: 한 번 본 곳은 저장해 두고 오프라인에서도 보여줘요
  if (u.hostname === 'tile.openstreetmap.org' || u.hostname === 'api.maptiler.com' || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'cdn.jsdelivr.net') {
    if (u.hostname === 'api.maptiler.com' && u.pathname.startsWith('/geocoding/')) return;
    e.respondWith(caches.open(TILES).then((c) => c.match(e.request).then((m) => m || fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const nav = e.request.mode === 'navigate';
  // 네트워크 우선. 인터넷이 느리면(3.5초) 저장해 둔 것을 먼저 보여주고, 받은 새 파일은 다음에 써요
  e.respondWith(new Promise((done) => {
    let sent = false;
    const send = (r) => { if (!sent && r) { sent = true; done(r); } };
    const fromCache = () => caches.match(e.request, { ignoreSearch: nav }).then((m) => m || (nav ? caches.match('/index.html') : null));
    const net = fetch(e.request).then((r) => {
      if (r.ok) { const cp = r.clone(); caches.open(V).then((c) => c.put(e.request, cp)); }
      send(r); return r;
    }).catch(() => fromCache().then((m) => { send(m || Response.error()); }));
    setTimeout(() => { if (!sent) fromCache().then((m) => { if (m) send(m); }); }, 3500);
    e.waitUntil(net.catch(() => {}));
  }));
});
