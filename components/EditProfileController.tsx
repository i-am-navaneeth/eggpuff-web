'use client'

import EditProfileScreen from './EditProfileScreen'

type Props = {
  scrollContainer?: React.RefObject<HTMLDivElement | null>
}

export default function EditProfileController({
  scrollContainer,
}: Props) {
  return (
    <EditProfileScreen
      scrollContainer={scrollContainer}
    />
  )
}