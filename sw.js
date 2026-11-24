// Service worker : cache hors-ligne (app + images chargées à la demande)
const CACHE = 'muscu-coach-v15';
const CORE = ['./', './index.html', './app.js', './nutri.js', './sync.js', './bank.js', './detail.js', './muscles.js', './hr.js', './montre.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  if (same) {
    // Réseau d'abord pour l'appli : les mises à jour arrivent tout de suite, le cache sert hors ligne
    e.respondWith(fetch(e.request).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return res; })
      .catch(() => caches.match(e.request).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const u = new URL(e.request.url);
      if (res.ok && (u.origin === location.origin || u.hostname === 'raw.githubusercontent.com' || u.hostname === 'cdn.jsdelivr.net' || u.hostname.endsWith('gstatic.com') || u.hostname === 'fonts.googleapis.com')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
