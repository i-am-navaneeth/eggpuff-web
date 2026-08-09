'use client'

import { Send } from 'lucide-react'
import { useState } from 'react'

type Props = {
  loading?: boolean
  onSend: (message: string) => Promise<void>
}

export default function MessageInput({
  loading = false,
  onSend,
}: Props) {
  const [message, setMessage] =
    useState('')

  async function handleSend() {
    const text = message.trim()

    if (!text || loading) return

    setMessage('')

    try {
      await onSend(text)
    } catch {
      setMessage(text)
    }
  }

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault()
      await handleSend()
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid #ECECEC',
        background: '#FFFFFF',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
        }}
      >
        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          maxLength={1000}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: 18,
            padding: '14px 16px',
            fontSize: 15,
            lineHeight: 1.5,
            outline: 'none',
            minHeight: 52,
            maxHeight: 140,
            fontFamily: 'inherit',
          }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={
            loading ||
            !message.trim()
          }
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: 'none',
            background:
              loading ||
              !message.trim()
                ? '#E5E7EB'
                : '#F4B860',
            color: '#111827',
            cursor:
              loading ||
              !message.trim()
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition:
              'all .2s ease',
          }}
        >
          <Send size={20} />
        </button>
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: '#9CA3AF',
          textAlign: 'right',
        }}
      >
        {message.length}/1000
      </div>
    </div>
  )
}