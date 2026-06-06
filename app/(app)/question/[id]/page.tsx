import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: question } = await supabase
    .from('questions')
    .select('text')
    .eq('id', id)
    .single()

  const title = question?.text
    ? `${question.text.slice(0, 60)} | EggPuff`
    : 'Question | EggPuff'

  return {
    title,
    description:
      question?.text ??
      'View this question on EggPuff.',

    openGraph: {
      title,
      description:
        question?.text ??
        'View this question on EggPuff.',
    },

    twitter: {
      title,
      description:
        question?.text ??
        'View this question on EggPuff.',
    },
  }
}

export default async function Page({
  params,
}: Props) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: question } = await supabase
    .from('questions')
    .select('text')
    .eq('id', id)
    .single()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question?.text ?? 'Question',
      text: question?.text ?? 'Question',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <QuestionIdPage params={params} />
    </>
  )
}