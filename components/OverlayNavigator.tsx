'use client'

import { useRouter } from 'next/navigation'
import { useNavigation } from '@/components/navigation/useNavigation'

export function useOverlayNavigator() {
  const router = useRouter()

const {
  open,
  close,
  currentRoute,
} = useNavigation()

  const openRoute = (route: string) => {
    router.push(route)
    open(route)
  }

  return {
    openRoute,
  }
}