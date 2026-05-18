'use client'

import { useRouter, usePathname } from 'next/navigation'
import useScrollVisibility from '@/hooks/useScrollVisibility'

export default function FloatingAskButton() {
  const router = useRouter()
  const pathname = usePathname()
  const showUI = useScrollVisibility()

  // Hide FAB when UI (navbar/topbar) is visible
  if (showUI) return null
  if (pathname.startsWith('/u')) return null
  if (pathname.startsWith('/question/')) {
    return null
  }
  if (pathname.startsWith('/communities')) {
    return null
  }
  if (pathname.startsWith('/ask')) {
  return null
}

  return (
    <button
  onClick={() => router.push('/ask', {
  scroll: false,
})}
  className="fixed bottom-4 right-5 z-[1000] h-16 w-16 rounded-full bg-[var(--brand)] text-white border border-black/10 shadow-[0_8px_25px_rgba(0,0,0,0.2)] flex items-center justify-center active:scale-95 transition"
>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
</button>
  )
}