'use client'

import ProfileController from '@/components/ProfileController'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import OverlayContainer from './OverlayContainer'

type Props = {
  username: string
}

export default function ProfileOverlay({
  username,
}: Props) {
  const { close } = useNavigation()

  return (
    <OverlayContainer
  onClose={close}
  fullScreen
>
      {(scrollRef) => (
        <ProfileController
          username={username}
          scrollContainer={scrollRef}
        />
      )}
    </OverlayContainer>
  )
}