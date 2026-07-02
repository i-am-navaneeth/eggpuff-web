'use client'

import EditProfileController from '@/components/EditProfileController'
import OverlayContainer from './OverlayContainer'
import { useNavigation } from '@/components/navigation/NavigationProvider'

export default function EditProfileOverlay() {
  const { close } = useNavigation()

  return (
    <OverlayContainer
  onClose={close}
  fullScreen
>
      {(scrollRef) => (
        <EditProfileController
          scrollContainer={scrollRef}
        />
      )}
    </OverlayContainer>
  )
}