const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];
  
const PRECACHE = 'precache-v1';
const RUNTIME_CACHE = 'runtime';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
        .open(PRECACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
console.log('Service Worker Installed')
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
        .keys()
        .then((cacheNames) => {
            return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        })
        .then((cachesToDelete) => {
            return Promise.all(
                cachesToDelete.map((cacheToDelete) => {
                    return caches.delete(cacheToDelete);
                })
            );
        })
        .then(() => self.clients.claim())
    );
console.log('Service Worker Activated')
});

// Fetch
self.addEventListener('fetch', (event) => {
    if (
        event.request.method !== 'GET' ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        event.respondWith(fetch(event.request));
        return;
    }


    if (event.request.url.includes('/api/')) {
    // make network request and fallback to cache if network request fails (offline)
        event.respondWith(
            caches
            .open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request)
            .then(response => {
                cache.put(event.request, response.clone());
                return response;
            })
            .catch(() => caches.match(event.request));
            })
        );
        return;
    }

// use cache first for all other requests for performance
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

        // If request is not in cache then make network request and cache the response
            return caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});







//         caches.match(event.request).then((cachedResponse) => {
//           if (cachedResponse) {
//             return cachedResponse;
//           }
  
//           return caches.open(RUNTIME).then((cache) => {
//             return fetch(event.request).then((response) => {
//               return cache.put(event.request, response.clone()).then(() => {
//                 return response;
//               });
//             });
//           });
//         })
//       );
//     }
//   });
  