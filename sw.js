/* sw.js — 오프라인 캐시. 파일 바꾸면 VERSION 올리기 */
const VERSION = 'jinan-v17';
const FILES = ['./', 'index.html', 'move.html', 'food.html', 'shop.html', 'prep.html', 'weather.html', 'money.html', 'rules.html',
  'style.css', 'config.js', 'data.js', 'common.js', 'weather-api.js', 'home.js', 'move.js', 'food.js', 'shop.js', 'prep.js',
  'weather.js', 'money.js', 'rules.js', 'favicon.svg', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 같은 사이트 파일: 네트워크 먼저 → 실패하면 캐시 (산속에서 끊겨도 열림) */
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
