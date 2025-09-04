/**
 * ODS Shell v9.2.1 - Service Worker
 * Provides offline capability through caching
 * Includes theme resources for complete offline support
 */

const CACHE_NAME = 'ods-shell-v921';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/shell.css',
    '/js/shell.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    // Theme module resources
    '/theme/constants.js',
    '/theme/index.js',
    // Google Fonts CSS (font files may not cache due to CORS)
    'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap'
];

// Install event - cache all shell resources
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching shell assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[ServiceWorker] Install complete');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[ServiceWorker] Install failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(error => {
                console.error('[ServiceWorker] Fetch failed:', error);
            })
    );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old shell caches but keep current one
                    if (cacheName.startsWith('ods-shell-') && cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Activation complete');
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});