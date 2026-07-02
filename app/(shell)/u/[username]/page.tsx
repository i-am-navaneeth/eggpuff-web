import type { Metadata } from 'next'
import ProfileController from '@/components/ProfileController'

type Props = {
  params: Promise<{
    username: string
  }>
  searchParams: Promise<{
    overlay?: string
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

export default async function Page({
  params,
  searchParams,
}: Props) {
  const { username } = await params
  const { overlay } = await searchParams

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: username,
    alternateName: `@${username}`,
    url: `https://eggpuff.in/u/${username}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Direct visit renders the page. Overlay navigation does not. */}
      {overlay !== '1' && (
        <ProfileController username={username} />
      )}
    </>
  )
}