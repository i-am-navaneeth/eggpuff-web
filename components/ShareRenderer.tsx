'use client'

import {
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'

import { shareQuestionImage }
  from '@/lib/shareQuestionImage'

import {
  useShare,
} from '@/contexts/ShareContext'

import QuestionShareCard
  from './share/QuestionShareCard'

export type ShareRendererHandle = {
  captureShare: () => Promise<void>
}

const ShareRenderer = forwardRef<
  ShareRendererHandle,
  {}
>((props, ref) => {

  const { shareData } = useShare()

  const shareCardRef =
    useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    async captureShare() {
      if (!shareCardRef.current) return

      await shareQuestionImage(
        shareCardRef.current
      )
    },
  }))

  if (!shareData)
    return null

  return (
    <div
      id="global-share-card"
      style={{
        position: 'fixed',
        left: '-99999px',
        top: 0,
        pointerEvents: 'none',
      }}
    >
      <QuestionShareCard
        ref={shareCardRef}
        {...shareData}
      />
    </div>
  )
})

ShareRenderer.displayName =
  'ShareRenderer'

export default ShareRenderer