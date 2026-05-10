'use client'

import { useEffect, useState } from 'react'

export default function useScrollVisibility() {
  const [showUI, setShowUI] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const update = () => {
      const currentScrollY = window.scrollY

      // 👉 Always show UI at top
      if (currentScrollY < 20) {
        setShowUI(true)
      } 
      // 👉 Scrolling DOWN → hide UI
      else if (currentScrollY > lastScrollY) {
       setTimeout(() => setShowUI(false), 50)
      } 
      // 👉 Scrolling UP → show UI
      else {
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
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return showUI
}