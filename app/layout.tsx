import './globals.css'
import UserProvider from '../components/UserProvider'
import type { Metadata } from 'next'

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
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
