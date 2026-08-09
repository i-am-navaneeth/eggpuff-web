'use client'

import { useEffect } from 'react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'

import {
  useShellLayout,
} from '@/components/ShellLayoutContext'

export default function CampusMatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const { setTopBar } =
    useShellLayout()

  useEffect(() => {
  let title = 'Campus Match'

  if (pathname === '/campus-match/create') {
    title = 'Create Match'
  } else if (pathname === '/campus-match/requests') {
    title = 'Requests'
  }

  setTopBar({
  title,

  showBack: true,

  hideBalance: true,

  rightSlot:
    pathname === '/campus-match' ? (
      <button
  onClick={() =>
    router.push('/campus-match/create')
  }
  className="
    w-11 h-11
    rounded-full
    flex items-center
    justify-center
    active:scale-95
    transition
  "
  aria-label="Create Match"
>
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="4.25"
      y="4.25"
      width="15.5"
      height="15.5"
      rx="4"
      stroke="currentColor"
      strokeWidth="2.3"
    />

    <path
      d="M12 8V16"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    />

    <path
      d="M8 12H16"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
    />
  </svg>
</button>
    ) : undefined,

  onBack: () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/feed')
    }
  },
})

  return () => {
    setTopBar({})
  }
}, [pathname, router, setTopBar])

  return children
}