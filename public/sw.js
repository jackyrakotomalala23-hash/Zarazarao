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

  // Explicitly bypass Service Worker for Firebase Auth (/__/*), API routes, and Google APIs
  workbox.routing.registerRoute(
    ({url, request}) => 
      url.pathname.startsWith('/__/') || 
      url.pathname.startsWith('/api/') || 
      url.origin.includes('googleapis.com') || 
      url.origin.includes('firebase') ||
      request.method !== 'GET',
    new workbox.strategies.NetworkOnly()
  );

} else {
  console.log(`Workbox initialization failed.`);
}
