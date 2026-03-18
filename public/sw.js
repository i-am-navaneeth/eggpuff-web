self.addEventListener('install', (event) => {
  console.log('Service Worker Installed')

  // Activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker Activated')

  // Take control immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // (kept as is — no caching logic yet)
})

self.addEventListener('push', function (event) {
  let data = {
    title: 'EggPuff',
    body: 'You have a new notification',
  }

  // ✅ Safe parsing (prevents crash)
  if (event.data) {
    try {
      const parsed = event.data.json()
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
      }
    } catch (err) {
      console.error('Push parse error:', err)
    }
  }

  self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app already open → focus it
      for (const client of clientList) {
        if (client.url.includes('/feed') && 'focus' in client) {
          return client.focus()
        }
      }

      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow('/feed')
      }
    })
  )
})

self.addEventListener('push', function (event) {
  let data = {
    title: 'EggPuff',
    body: 'New update',
  }

  if (event.data) {
    data = event.data.json()
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/eggpuff.favicon.png',
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  event.waitUntil(
    clients.openWindow('/feed')
  )
})

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/eggpuff.favicon.png',
  })
})