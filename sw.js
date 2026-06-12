/**
 * Kill-switch service worker.
 * The previous site registered a caching service worker; this replacement
 * removes all caches and unregisters itself so returning visitors always
 * receive the current site directly from the network.
 */
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => client.navigate(client.url));
    })());
});
