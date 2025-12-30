const CACHE_NAME = 'biblia-v2.0.0';
const urlsToCache = [
  '/',
  '/js/api-client.js',
  '/js/pwa-installer.js',
  '/assets/icons/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network First for API, Cache First for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Não cachear rotas da API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache First Strategy para assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Clone response
          const responseClone = response.clone();

          // Cache new requests
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback - retornar página raiz
        return caches.match('/');
      })
  );
});
