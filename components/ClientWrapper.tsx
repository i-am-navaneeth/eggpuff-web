'use client'

import { usePathname } from 'next/navigation'

import UserProvider from '../components/UserProvider'
import { NotificationProvider } from '../components/NotificationProvider'

import TopBar from '@/components/TopBar'
import PWARegister from '@/components/PWARegister'
import PWAInstall from '@/components/PWAInstall'
import AuthProvider from '@/components/AuthProvider'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isPublicPage =
  pathname === '/' ||
  pathname.startsWith('/login') ||
  pathname.startsWith('/resource/')

  return (
    <NotificationProvider>
      <AuthProvider skipRedirect={isPublicPage}>
        <UserProvider>

          {/* PWA Setup */}
          <PWARegister />
          <PWAInstall />

          {/* App Content */}
          {children}

        </UserProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}