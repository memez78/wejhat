const CACHE_NAME = 'wejhati-v1';
const OFFLINE_URL = 'index.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/travel.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching all assets');
      await cache.addAll(ASSETS_TO_CACHE);
    })()
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate the service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  // Remove old caches
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })()
  );
  
  // Claim any clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache if possible
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Try to get the response from the cache
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, try to fetch it
      try {
        const networkResponse = await fetch(event.request);
        
        // Cache the response if it's valid
        if (networkResponse.ok && event.request.method === 'GET') {
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed, try to return offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Wejhati Update',
        body: event.data.text(),
        icon: '/icons/icon-192x192.png'
      };
    }
  }
  
  const title = data.title || 'Wejhati Notification';
  const options = {
    body: data.body || 'Something important happened!',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Trip'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is already open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Periodic sync for checking upcoming trips
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-trips') {
    event.waitUntil(checkUpcomingTrips());
  }
});

// Function to check for upcoming trips and send notifications
async function checkUpcomingTrips() {
  try {
    // This would normally fetch from a server, but since we're client-side only,
    // we'll use the cache to get the current user and trips
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/');
    
    if (!response) return;
    
    // We would normally process the trips here, but since we can't access localStorage
    // directly from the service worker, in a real app we would use the Cache API
    // or IndexedDB to store and retrieve the trips
    
    // For demo purposes, send a notification
    self.registration.showNotification('Wejhati Trip Reminder', {
      body: 'You have an upcoming trip. Tap to view details.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: '/trips'
      },
      actions: [
        {
          action: 'view',
          title: 'View Trip'
        }
      ]
    });
  } catch (error) {
    console.error('Error checking trips:', error);
  }
}