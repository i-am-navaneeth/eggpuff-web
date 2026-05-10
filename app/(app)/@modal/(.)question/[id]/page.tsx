'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import QuestionPage from '@/app/(app)/question/[id]/page'

type Props = {
  params: Promise<{ id: string }>
}

export default function QuestionModal(props: Props) {
  const router = useRouter()

  // 🔥 unwrap params safely
  const params = use(props.params) as { id: string }
  const id = params.id

  // 🔥 disable background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  // 🔥 preload
  useEffect(() => {
    if (id) {
      router.prefetch(`/question/${id}`)
    }
  }, [router, id])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden', // 🔥 prevent parent scroll issues
      }}
    >
      {/* 🔥 SAME TOPBAR AS FEED */}
      <TopBar currentUserId={null} />

      {/* 🔥 CONTENT (SCROLLABLE AREA) */}
      <div
  style={{
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    display: 'flex',
    justifyContent: 'center', // 🔥 center like feed
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: 720, // 🔥 SAME as feed (adjust if needed)
      padding: '16px',
    }}
  >
    <QuestionPage params={props.params} />
  </div>
</div>
    </div>
  )
}