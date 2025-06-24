// Service Worker for Cache Management
// Version: 1.1.0 - Fixed fetch error handling

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

// Fetch event - network first strategy for critical files with proper error handling
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
        return;
    }
    
    // Check if this is a critical file that should always be fresh
    const isCriticalFile = CRITICAL_FILES.some(file => url.pathname.endsWith(file)) ||
                          url.pathname.includes('script.js');
    
    if (isCriticalFile) {
        // Network first strategy for critical files with proper error handling
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    console.log('[SW] Fetched fresh version of:', url.pathname);
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    }).catch((cacheError) => {
                        console.warn('[SW] Failed to cache response:', cacheError);
                    });
                    
                    return response;
                })
                .catch((networkError) => {
                    console.log('[SW] Network failed, trying cache for:', url.pathname, networkError);
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[SW] Serving from cache:', url.pathname);
                                return cachedResponse;
                            }
                            // Return a basic error response if no cache available
                            console.error('[SW] No cache available for:', url.pathname);
                            return new Response(
                                'Service Unavailable - No cached version available',
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'text/plain' }
                                }
                            );
                        })
                        .catch((cacheError) => {
                            console.error('[SW] Cache lookup failed:', cacheError);
                            return new Response(
                                'Service Error',
                                {
                                    status: 500,
                                    statusText: 'Service Error',
                                    headers: { 'Content-Type': 'text/plain' }
                                }
                            );
                        });
                })
        );
    } else {
        // Cache first strategy for other files with proper error handling
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // If not in cache, try network
                    return fetch(event.request)
                        .catch((networkError) => {
                            console.warn('[SW] Network failed for:', url.pathname, networkError);
                            // Return a minimal error response
                            return new Response(
                                'Network Error',
                                {
                                    status: 408,
                                    statusText: 'Network Timeout',
                                    headers: { 'Content-Type': 'text/plain' }
                                }
                            );
                        });
                })
                .catch((error) => {
                    console.error('[SW] Cache and network both failed:', error);
                    return new Response(
                        'Service Error',
                        {
                            status: 500,
                            statusText: 'Service Error',
                            headers: { 'Content-Type': 'text/plain' }
                        }
                    );
                })
        );
    }
}); 