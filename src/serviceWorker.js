/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'attendance-cache-v1';
const urlsToCache = ['/', '/index.html', '/static/js/bundle.js'];

globalThis.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

globalThis.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});