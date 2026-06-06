import type { Metadata } from 'next'
import QuestionIdPage from '@/components/QuestionIdPage'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: 'Question | EggPuff',
    description: 'View this question on EggPuff.',
    openGraph: {
      title: 'Question | EggPuff',
      description: 'View this question on EggPuff.',
    },
    twitter: {
      title: 'Question | EggPuff',
      description: 'View this question on EggPuff.',
    },
  }
}

export default async function Page({
  params,
}: Props) {
  return (
    <QuestionIdPage
      params={params}
    />
  )
}