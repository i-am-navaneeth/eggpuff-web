import './globals.css'
import UserProvider from '../components/UserProvider'
import { NotificationProvider } from '../components/NotificationProvider'
import type { Metadata } from 'next'
import TopBar from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'EggPuff',
  icons: {
    icon: '/eggpuff.favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <NotificationProvider>
          <UserProvider>
              {children}
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
