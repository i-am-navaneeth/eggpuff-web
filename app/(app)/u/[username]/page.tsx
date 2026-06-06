import type { Metadata } from 'next'
import ProfileView from '@/components/ProfileView'

type Props = {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { username } = await params

  return {
    title: `@${username} | EggPuff`,
    description: `View ${username}'s profile on EggPuff.`,
    openGraph: {
      title: `@${username} | EggPuff`,
      description: `View ${username}'s profile on EggPuff.`,
    },
    twitter: {
      title: `@${username} | EggPuff`,
      description: `View ${username}'s profile on EggPuff.`,
    },
  }
}

export default function Page() {
  return <ProfileView />
}