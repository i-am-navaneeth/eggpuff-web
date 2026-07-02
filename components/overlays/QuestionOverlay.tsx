'use client'

import OverlayContainer from './OverlayContainer'
import QuestionController from '@/components/QuestionController'
import { useNavigation } from '@/components/navigation/NavigationProvider'

type Props = {
  questionId: string
}

export default function QuestionOverlay({
  questionId,
}: Props) {
  const { close } = useNavigation()

  return (
    <OverlayContainer
  onClose={close}
  fullScreen
>
      {(scrollRef) => (
        <QuestionController
          questionId={questionId}
          scrollContainer={scrollRef}
        />
      )}
    </OverlayContainer>
  )
}