'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function useScrollVisibility() {
  const [showUI, setShowUI] = useState(true)

  const pathname = usePathname()

const disableAutoHide =
  pathname.startsWith('/pyp') ||
  pathname.startsWith('/campus-match') ||
  pathname.startsWith('/match-room/')

useEffect(() => {
  if (disableAutoHide) {
    setShowUI(true)
    return
  }

  let lastScrollY = window.scrollY
  let ticking = false

  const update = () => {
    const currentScrollY = window.scrollY

    if (currentScrollY < 20) {
      setShowUI(true)
    } else if (currentScrollY > lastScrollY) {
      setTimeout(() => setShowUI(false), 50)
    } else {
      setShowUI(true)
    }

    lastScrollY = currentScrollY
    ticking = false
  }

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update)
      ticking = true
    }
  }

  window.addEventListener('scroll', onScroll)

  return () => {
    window.removeEventListener('scroll', onScroll)
  }
}, [disableAutoHide])

  return showUI
}