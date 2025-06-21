const CACHE_NAME = 'dodiklatpur-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Pastikan untuk menyertakan semua aset yang digunakan aplikasi Anda
  // Termasuk gambar latar belakang dan logo yang dimuat melalui URL
  'https://iili.io/FxvZccg.md.jpg',
  'https://iili.io/FxvkDJt.png',
  'https://iili.io/Fxw9se4.png',
  // CDN yang Anda gunakan:
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js',
  'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap',
  // Firebase CDN (jika Anda memuatnya melalui CDN di index.html, bukan sebagai modul npm)
  // Kalau Anda menginstal Firebase sebagai modul npm di proyek React, tidak perlu dicache di sini
  // Karena bundler React akan menyertakannya dalam kode aplikasi.
];

// Instalasi Service Worker dan cache aset
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Mengambil aset dari cache atau jaringan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // If not in cache, try fetching from network
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // the browser can consume the original response and we can
            // consume the cloned one.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Mengelola pembaruan cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null; // Keep the cache
        })
      );
    })
  );
});