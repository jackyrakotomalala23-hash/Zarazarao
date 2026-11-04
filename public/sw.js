importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log(`Workbox loaded successfully in service worker 🚀`);

  // Claim clients immediately so the SW takes control without waiting
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Precaching empty array fallback
  workbox.precaching.precacheAndRoute([]);

  // Cache page navigations (HTML) with NetworkFirst strategy for offline resilience
  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'zarazarao-pages-cache',
      networkTimeoutSeconds: 3,
    })
  );

  // Cache CSS, JS, and Worker files with StaleWhileRevalidate
  workbox.routing.registerRoute(
    ({request}) => 
      request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'worker',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'zarazarao-static-resources',
    })
  );

  // Cache Images (donation photos, profile avatars, badges) with CacheFirst strategy
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'zarazarao-images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache Firestore API requests and backend queries for donation list & user profile
  workbox.routing.registerRoute(
    ({url}) => url.origin.includes('firestore.googleapis.com') || url.pathname.includes('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'zarazarao-firestore-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 Hours
        }),
      ],
    })
  );

} else {
  console.log(`Workbox initialization failed.`);
}
