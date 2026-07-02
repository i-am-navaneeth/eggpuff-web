'use client'

import FeedContent from './feed/FeedContent'

type Props = {
  active?: boolean
}

export default function FeedHost({
  active = true,
}: Props) {
  return (
    <div
      style={{
        display: active ? 'block' : 'none',
      }}
    >
      <FeedContent />
    </div>
  )
}