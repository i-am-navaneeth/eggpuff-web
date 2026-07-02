import AppLayout from '@/components/AppLayout'
import { NavigationProvider } from '@/components/navigation/NavigationProvider'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </NavigationProvider>
  )
}