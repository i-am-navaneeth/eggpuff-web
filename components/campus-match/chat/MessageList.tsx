'use client'

import MessageBubble from './MessageBubble'

type Props = {
  messages: any[]
  currentUserId: string
}

export default function MessageList({
  messages,
  currentUserId,
}: Props) {
  if (messages.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '60px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 320,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            💬
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Conversation starts here
          </h2>

          <p
            style={{
              marginTop: 12,
              color: '#6B7280',
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            Say hello to everyone in this Campus Match.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {messages.map((message) => (
  <MessageBubble
    key={message.id}
    message={message}
    currentUserId={currentUserId}
  />
))}
    </div>
  )
}