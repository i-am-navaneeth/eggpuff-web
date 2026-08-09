'use client'

type Props = {
  message: any
  currentUserId: string
}

export default function MessageBubble({
  message,
  currentUserId,
}: Props) {

  const mine =
    message.user_id === currentUserId

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: mine
          ? 'flex-end'
          : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
        }}
      >
        {!mine && (
          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
              marginBottom: 6,
              marginLeft: 4,
              fontWeight: 600,
            }}
          >
            {message.sender_name ??
              'Student'}
          </div>
        )}

        <div
          style={{
            padding: '12px 16px',
            borderRadius: mine
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            background: mine
              ? '#F4B860'
              : '#FFFFFF',
            border: mine
              ? 'none'
              : '1px solid #ECECEC',
            color: '#111827',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            boxShadow: mine
              ? '0 8px 18px rgba(244,184,96,.28)'
              : '0 2px 10px rgba(0,0,0,.04)',
          }}
        >
          {message.message}
        </div>

        <div
          style={{
            marginTop: 6,
            paddingInline: 4,
            textAlign: mine
              ? 'right'
              : 'left',
            fontSize: 11,
            color: '#9CA3AF',
          }}
        >
          {message.created_at
            ? new Date(
                message.created_at
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </div>
      </div>
    </div>
  )
}