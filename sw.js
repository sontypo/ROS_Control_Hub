const CACHE_NAME = 'ros-control-hub-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './services/rosService.ts',
  './components/ConnectionScreen.tsx',
  './components/DashboardScreen.tsx',
  './components/Header.tsx',
  './components/TeleopControl.tsx',
  './components/TopicCard.tsx',
  './components/PublishTopicForm.tsx',
  './components/icons/RobotIcon.tsx',
  './components/icons/SignalIcon.tsx',
  './components/icons/PlusIcon.tsx',
  './components/icons/ArrowIcons.tsx',
  'https://cdn.tailwindcss.com',
  'https://rsms.me/inter/inter.css',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react-dom@^19.1.1/',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/recharts@^3.1.2',
  'https://esm.sh/@capacitor/app@^7.0.2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
