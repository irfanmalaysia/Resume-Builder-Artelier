// Offline helper for the resume app. Change VERSION when you upload new files.
const VERSION = 'v3';
const CACHE = 'artelier-resume-' + VERSION;
const CORE = ['./', 'index.html', 'support.js', 'vendor/react.production.min.js', 'vendor/react-dom.production.min.js',
  'vendor/jspdf.umd.min.js', 'assets/logo.png', 'assets/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // never touch analytics, fonts, payments
  const isPage = req.mode === 'navigate' || req.url.endsWith('.html');
  if (isPage) {
    // newest page when online, saved copy when offline
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
  }
});
