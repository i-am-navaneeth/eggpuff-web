'use client'

import { usePathname } from 'next/navigation'

import PublicTopBar from '@/components/PublicTopBar'
import OverlayRoot from '@/components/OverlayRoot'

import {
  ShellLayoutProvider,
  useShellLayout,
} from '@/components/ShellLayoutContext'

function PublicShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { topBar } = useShellLayout()
  const pathname = usePathname()

  const isReader =
    pathname.startsWith('/reader/')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F5',
      }}
    >
      <PublicTopBar />

      <main
        style={{
          paddingTop: 55,
          minHeight: '100vh',
        }}
      >
        {children}
      </main>

      <OverlayRoot />
    </div>
  )
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellLayoutProvider
      topInset={55}
      bottomInset={0}
    >
      <PublicShell>
        {children}
      </PublicShell>
    </ShellLayoutProvider>
  )
}