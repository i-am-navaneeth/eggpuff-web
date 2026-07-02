'use client'

import { usePathname } from 'next/navigation'

import ProfileOverlay from './overlays/ProfileOverlay'
import QuestionOverlay from './overlays/QuestionOverlay'
import EditProfileOverlay from './overlays/EditProfileOverlay'

export default function OverlayRoot() {
  const pathname = usePathname()

  if (pathname.startsWith('/u/')) {
    return (
      <ProfileOverlay
        username={pathname.replace('/u/', '')}
      />
    )
  }

  if (pathname === '/profile') {
    return <EditProfileOverlay />
  }

  if (pathname.startsWith('/question/')) {
    return (
      <QuestionOverlay
        questionId={pathname.replace('/question/', '')}
      />
    )
  }

  return null
}