'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useNavigation } from '@/components/navigation/NavigationProvider'

export default function RouteOverlaySync() {
  const pathname = usePathname()

  const {
    open,
    currentRoute,
  } = useNavigation()

  const previousPath = useRef('')

  useEffect(() => {
    // Prevent duplicate updates
    if (previousPath.current === pathname) return

    previousPath.current = pathname

    // Current overlay route (if any)
    const activeRoute = currentRoute

    // Already showing this route
    if (activeRoute === pathname) return

    // If another overlay is open, close it first
// Do nothing here.
// The browser already changed history.
// We only need to synchronize the overlay.

    // ================= PROFILE =================
    if (pathname.startsWith('/u/')) {
      open(pathname)
      return
    }

    // ================= EDIT PROFILE =================
    if (pathname === '/profile') {
      open(pathname)
      return
    }

    // ================= QUESTION =================
    if (pathname.startsWith('/question/')) {
      open(pathname)
      return
    }
  }, [
    pathname,
    currentRoute,
    open,
  ])

  return null
}