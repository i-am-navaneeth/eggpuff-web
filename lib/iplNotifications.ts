export function requestNotificationPermission() {
  if (typeof window === 'undefined') return

  // ✅ Check support
  if (!('Notification' in window)) return

  try {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch (err) {
    console.error('Permission request error:', err)
  }
}

export function sendNotification(title: string, body: string) {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return

  if (Notification.permission !== 'granted') return

  try {
    // ✅ Use Service Worker if available (works even better for PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/eggpuff.favicon.png',
            badge: '/eggpuff.favicon.png',
            data: {
              url: '/', // 👈 open app on click
            },
          })
        })
        .catch(() => {
          // fallback to normal notification
          new Notification(title, {
            body,
            icon: '/eggpuff.favicon.png',
          })
        })
    } else {
      // fallback
      new Notification(title, {
        body,
        icon: '/eggpuff.favicon.png',
      })
    }
  } catch (err) {
    console.error('Notification error:', err)
  }
}

export function isNotificationEnabled() {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem('ipl_notify') === 'true'
  } catch (err) {
    console.error('Read storage error:', err)
    return false
  }
}

export function setNotificationEnabled(value: boolean) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('ipl_notify', value ? 'true' : 'false')
  } catch (err) {
    console.error('Storage error:', err)
  }
}