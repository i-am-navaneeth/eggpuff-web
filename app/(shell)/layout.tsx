import AppLayout from '@/components/AppLayout'
import { NavigationProvider } from '@/components/navigation/NavigationProvider'

import NotificationManager from '@/components/notifications/NotificationManager'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <NavigationProvider>

      <AppLayout>

        {children}

        <NotificationManager />

      </AppLayout>

    </NavigationProvider>
  )
}