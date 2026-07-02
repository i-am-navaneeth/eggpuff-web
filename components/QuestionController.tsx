'use client'

import QuestionScreen from '@/components/QuestionScreen'

type Props = {
  questionId: string
  scrollContainer?: React.RefObject<HTMLDivElement | null>
}

export default function QuestionController({
  questionId,
  scrollContainer,
}: Props) {
  return (
    <QuestionScreen
      questionId={questionId}
      scrollContainer={scrollContainer}
    />
  )
}