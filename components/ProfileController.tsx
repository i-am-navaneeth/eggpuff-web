'use client'

import ProfileScreen from './ProfileScreen'

type Props = {
  username: string
  scrollContainer?: React.RefObject<HTMLDivElement | null>
}

export default function ProfileController({
  username,
  scrollContainer,
}: Props) {
  return (
    <ProfileScreen
      username={username}
      scrollContainer={scrollContainer}
    />
  )
}