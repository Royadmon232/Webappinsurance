// Service Worker for Cache Management
// Version: 1.0.0

const CACHE_NAME = 'insurance-app-v1';
const CRITICAL_FILES = [
    '/script.js',
    '/style.css',
    '/index.html'
];

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    self.skipWaiting();
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - network first strategy for critical files
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Check if this is a critical file that should always be fresh
    const isCriticalFile = CRITICAL_FILES.some(file => url.pathname.endsWith(file)) ||
                          url.pathname.includes('script.js');
    
    if (isCriticalFile) {
        // Network first strategy for critical files
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    console.log('[SW] Fetched fresh version of:', url.pathname);
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                })
                .catch(() => {
                    console.log('[SW] Network failed, trying cache for:', url.pathname);
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache first strategy for other files
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    return response || fetch(event.request);
                })
        );
    }
}); 