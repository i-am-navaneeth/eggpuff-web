'use client'

type Props = {
  title: string
  body: string
  link?: string
}

export default function PreviewCard({
  title,
  body,
  link,
}: Props) {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 20,
        background: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Live Preview
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            This is how users will receive the notification.
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: 999,
            background: '#FEF3C7',
            color: '#92400E',
          }}
        >
          Preview
        </span>
      </div>

      {/* Phone */}
      <div
        style={{
          padding: 24,
          display: 'flex',
          justifyContent: 'center',
          background: '#F9FAFB',
        }}
      >
        <div
          style={{
            width: 330,
            maxWidth: '100%',
            borderRadius: 28,
            background: '#0F172A',
            padding: 18,
            boxShadow:
              '0 18px 45px rgba(0,0,0,.15)',
          }}
        >
          {/* Notification */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: 16,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#F4B860',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 24,
              }}
            >
              🥚
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#111827',
                  }}
                >
                  EggPuff
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#9CA3AF',
                  }}
                >
                  now
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#111827',
                  wordBreak: 'break-word',
                }}
              >
                {title.trim() || 'Notification title'}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#4B5563',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {body.trim() ||
                  'Your notification body will appear here.'}
              </div>

              {link && (
                <div
                  style={{
                    marginTop: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#EEF2FF',
                    color: '#4338CA',
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  🔗 {link}
                </div>
              )}
            </div>
          </div>

          {/* Lock Screen */}
          <div
            style={{
              marginTop: 20,
              textAlign: 'center',
              color: 'rgba(255,255,255,.65)',
              fontSize: 12,
            }}
          >
            Lock screen notification preview
          </div>
        </div>
      </div>
    </div>
  )
}