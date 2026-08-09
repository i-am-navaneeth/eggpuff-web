'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

import { useRouter } from 'next/navigation'

import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import MessageInput from './chat/MessageInput'

import { getMatch } from '@/lib/campus-match/getMatch'
import { getMessages } from '@/lib/campus-match/getMessages'
import { sendMessage } from '@/lib/campus-match/sendMessage'

type Props = {
  matchId: string
}

export default function MatchRoom({
  matchId,
}: Props) {
  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [match, setMatch] =
    useState<any>(null)

  const [messages, setMessages] =
    useState<any[]>([])

  const [currentUserId, setCurrentUserId] =
  useState('')

  useEffect(() => {
  async function init() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession()

    setCurrentUserId(
      session?.user.id ?? ''
    )

    await loadRoom()
  }

  init()

  const interval =
    setInterval(() => {
      loadMessages()
    }, 5000)

  return () =>
    clearInterval(interval)
}, [])

  async function loadRoom() {
    setLoading(true)

    try {
      const data =
        await getMatch(matchId)

      if (!data) {
        router.replace(
          '/campus-match'
        )
        return
      }

      if (!data.joined) {
        router.replace(
          `/campus-match/${matchId}`
        )
        return
      }

      setMatch(data)

      await loadMessages()
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages() {
    const data =
      await getMessages(matchId)

    setMessages(data)
  }

  async function handleSend(
    text: string
  ) {
    if (!text.trim()) return

    try {
      setSending(true)

      await sendMessage(
        matchId,
        text
      )

      await loadMessages()
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '60px 24px',
          textAlign: 'center',
          color: '#6B7280',
        }}
      >
        Loading Match...
      </main>
    )
  }

  if (!match) return null

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: '#FFFFFF',
      }}
    >
      <ChatHeader
        match={match}
      />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 18px',
          background:
            '#F8FAFC',
        }}
      >
        <MessageList
  messages={messages}
  currentUserId={
    currentUserId
  }
/>
      </div>

      <MessageInput
        loading={sending}
        onSend={handleSend}
      />
    </main>
  )
}