'use client'

import { useRouter, usePathname } from 'next/navigation'
import useScrollVisibility from '@/hooks/useScrollVisibility'

export default function FloatingAskButton() {
  const router = useRouter()
  const pathname = usePathname()

  const showUI = useScrollVisibility()

  if (pathname.startsWith('/u')) return null
  if (pathname.startsWith('/question/')) return null
  if (pathname.startsWith('/communities')) return null
  if (pathname.startsWith('/ask')) return null
  if (pathname.startsWith('/notifications')) return null
  if (pathname.startsWith('/search')) return null
  if (pathname.startsWith('/profile')) return null

  return (
    <button
      onClick={() =>
        router.push('/ask', {
          scroll: false,
        })
      }
      aria-label="Ask"

      className="
        fixed
        right-5
        z-[1000]

        flex
        items-center
        justify-center

        rounded-full

        border
        border-black/10

        text-white

        active:scale-95
      "

      style={{
        width: 56,
        height: 56,

        background: 'var(--brand)',

        bottom: 'calc(env(safe-area-inset-bottom) + 72px)',

        opacity: showUI ? 1 : 0,

        transform: showUI
          ? 'translateY(0) scale(1)'
          : 'translateY(18px) scale(.94)',

        pointerEvents: showUI ? 'auto' : 'none',

        boxShadow:
          '0 10px 28px rgba(0,0,0,.18)',

        transition: `
          opacity .22s ease,
          transform .22s cubic-bezier(.22,1,.36,1)
        `,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
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