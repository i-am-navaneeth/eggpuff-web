'use client'

type Props = {
  title: string
  body: string
  link?: string
}

export default function NotificationPreview({
  title,
  body,
  link,
}: Props) {
  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 18,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #F3F4F6',
          fontWeight: 700,
          fontSize: 15,
          color: '#111827',
          background: '#FAFAFA',
        }}
      >
        Live Preview
      </div>

      {/* Phone Mockup */}
      <div
        style={{
          padding: 28,
          display: 'flex',
          justifyContent: 'center',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: 340,
            borderRadius: 24,
            background: '#111827',
            padding: 18,
            boxShadow:
              '0 20px 50px rgba(0,0,0,.18)',
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
            {/* Logo */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#fff',
              }}
            >
              <img
                src="/icon-512.png"
                alt="EggPuff"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* App */}
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#111827',
                  }}
                >
                  EggPuff
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: '#9CA3AF',
                  }}
                >
                  now
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#111827',
                  marginBottom: 6,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                }}
              >
                {title || 'Notification title'}
              </div>

              {/* Body */}
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#4B5563',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {body ||
                  'Your notification message will appear here.'}
              </div>

              {/* Link */}
              {link && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: '#FFF7ED',
                    color: '#C2410C',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  🔗 {link}
                </div>
              )}
            </div>
          </div>

          {/* Small note */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 14,
              color: '#94A3B8',
              fontSize: 12,
            }}
          >
            Push notification preview
          </div>
        </div>
      </div>
    </div>
  )
}