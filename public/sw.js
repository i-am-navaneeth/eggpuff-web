self.addEventListener('install', (event) => {

  self.skipWaiting()
})

self.addEventListener('activate', (event) => {

  event.waitUntil(self.clients.claim()) // 🔥 THIS IS CRITICAL
})

// 🔔 PUSH EVENT
self.addEventListener('push', function (event) {
  let data = {
    title: 'EggPuff',
    body: 'You have a new notification',
    url: '/feed',
  }

  if (event.data) {
    try {
      const parsed = event.data.json()
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        url: parsed.url || data.url,
      }
    } catch (err) {
      console.error('Push parse error:', err)
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/eggpuff.favicon.png',
      data: {
        url: data.url,
      },
    })
  )
})

// 🔔 CLICK EVENT
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/feed'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})