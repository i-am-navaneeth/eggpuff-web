'use client'

import {
  useEffect,
  useState,
} from 'react'

export function useFeedClock() {
  const [now, setNow] = useState(
    new Date()
  )

  useEffect(() => {
    let interval:
      | ReturnType<
          typeof setInterval
        >
      | null = null

    const start = () => {
      if (interval) return

      interval = setInterval(
        () => {
          setNow(new Date())
        },
        60_000
      )
    }

    const stop = () => {
      if (!interval) return

      clearInterval(interval)
      interval = null
    }

    const onVisibility = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        start()
      } else {
        stop()
      }
    }

    if (
      document.visibilityState ===
      'visible'
    ) {
      start()
    }

    document.addEventListener(
      'visibilitychange',
      onVisibility
    )

    return () => {
      stop()

      document.removeEventListener(
        'visibilitychange',
        onVisibility
      )
    }
  }, [])

  return now
}

export default useFeedClock