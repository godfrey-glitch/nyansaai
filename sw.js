// Nyansa AI — Service Worker v4 (with push notifications)
const CACHE = 'nyansa-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './reminder.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Ghana-themed motivational quotes
const QUOTES = [
  { title: '📚 Time to study!', body: 'Open Nyansa AI and keep learning today! 🇬🇭' },
  { title: '🌟 Akwaaba, Champion!', body: 'A little study every day builds great knowledge. Let\'s go!' },
  { title: '🏆 Future is yours!', body: 'Every Ghanaian student who studies today leads tomorrow.' },
  { title: '📖 Study time!', body: 'Nyansa means wisdom — come get yours today! 💡' },
  { title: '🌍 Keep going!', body: 'Great things take time. Your education is your future. 🇬🇭' },
  { title: '⭐ You\'ve got this!', body: 'Even Kofi Annan started with the basics. Study today!' },
  { title: '🎯 Stay focused!', body: 'Your WASSCE/BECE success starts with today\'s study session.' },
  { title: '💪 Rise & Learn!', body: 'Ghana needs bright minds like yours. Open Nyansa AI now!' },
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).catch(function(err) {
      console.warn('[SW] Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;
  if (event.request.url.includes('.netlify/functions/')) return;

  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com') ||
      event.request.url.includes('fonts.cdnfonts.com')) {
    event.respondWith(
      caches.open(CACHE).then(function(cache) {
        return fetch(event.request).then(function(response) {
          if (response && response.status === 200) cache.put(event.request, response.clone());
          return response;
        }).catch(function() { return caches.match(event.request); });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          caches.open(CACHE).then(function(cache) { cache.put(event.request, response.clone()); });
        }
        return response;
      }).catch(function() { return cached; });
      return cached || networkFetch;
    }).catch(function() {
      if (event.request.destination === 'document') return caches.match('./index.html');
    })
  );
});

// ── Handle scheduled reminder alarm ──────────────────────────────────────────
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    // Store reminder time in SW scope
    self.reminderTime = event.data.time; // "HH:MM"
    self.lastSubject = event.data.lastSubject || null;
    console.log('[SW] Reminder scheduled for', event.data.time);
  }

  if (event.data && event.data.type === 'TRIGGER_REMINDER') {
    showReminder(event.data.lastSubject || null);
  }
});

// ── Show the notification ─────────────────────────────────────────────────────
function showReminder(lastSubject) {
  var quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Smart: override with last subject if available
  var title = quote.title;
  var body = quote.body;

  if (lastSubject) {
    // 1 in 3 chance to show smart subject reminder
    if (Math.random() < 0.33) {
      title = '📖 Continue learning!';
      body = 'You were studying ' + lastSubject + ' last time. Pick up where you left off! 🇬🇭';
    }
  }

  self.registration.showNotification(title, {
    body: body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'nyansa-daily-reminder',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: 'https://nyansaai.netlify.app' }
  });
}

// ── Handle notification click ─────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('nyansaai') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://nyansaai.netlify.app');
      }
    })
  );
});
