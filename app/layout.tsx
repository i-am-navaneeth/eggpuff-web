import './globals.css'

import type { Metadata, Viewport } from 'next'

import UserProvider from '../components/UserProvider'
import { NotificationProvider } from '../components/NotificationProvider'

import TopBar from '@/components/TopBar'
import PWARegister from '@/components/PWARegister'
import PWAInstall from '@/components/PWAInstall'
import AuthProvider from '@/components/AuthProvider'


/* ========================================
   Metadata
======================================== */
export const metadata: Metadata = {
  title: 'EggPuff',
  icons: {
    icon: '/eggpuff.favicon.png',
  },
  manifest: '/manifest.json',
}


/* ========================================
   Viewport
======================================== */
export const viewport: Viewport = {
  themeColor: '#F4B860',
}


/* ========================================
   Root Layout
======================================== */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>

        <NotificationProvider>
          <AuthProvider>
          <UserProvider>

            {/* PWA Setup */}
            <PWARegister />
            <PWAInstall />

            {/* App Content */}
            {children}

          </UserProvider>
          </AuthProvider>
        </NotificationProvider>

      </body>
    </html>
  )
}