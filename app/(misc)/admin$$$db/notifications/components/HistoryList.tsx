'use client'

import { useNotificationHistory } from '@/hooks/useNotificationHistory'

export default function HistoryList() {
  const {
    history,
    historyCount,
    loading,
    deleteHistory,
  } = useNotificationHistory()

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #ECECEC',
        boxShadow: '0 8px 24px rgba(0,0,0,.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Notification History
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Recently delivered notifications
          </div>
        </div>

        <div
          style={{
            padding: '5px 12px',
            background: '#F9FAFB',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: '#6B7280',
          }}
        >
          {historyCount}
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#6B7280',
          }}
        >
          Loading history...
        </div>
      )}

      {/* Empty */}

      {!loading && historyCount === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 46 }}>📭</div>

          <div
            style={{
              marginTop: 12,
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            Nothing sent yet
          </div>

          <div
            style={{
              marginTop: 6,
              color: '#6B7280',
            }}
          >
            Your notification history will appear here.
          </div>
        </div>
      )}

      {/* History */}

      {!loading &&
        history.map(item => (
          <div
            key={item.id}
            style={{
              padding: 20,
              borderBottom: '1px solid #F5F5F5',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    {item.title}
                  </div>

                  <StatusBadge
                    status={item.status}
                  />
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: '#6B7280',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {item.body}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 18,
                    flexWrap: 'wrap',
                    marginTop: 14,
                    fontSize: 13,
                    color: '#6B7280',
                  }}
                >
                  <span>
                    👥 {item.audience}
                  </span>

                  <span>
                    📨{' '}
                    {item.recipientCount.toLocaleString()}
                  </span>

                  <span>
                    🕒{' '}
                    {new Date(
                      item.sentAt
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (
                    confirm(
                      'Delete this history item?'
                    )
                  ) {
                    deleteHistory(item.id)
                  }
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: '#F9FAFB',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#6B7280',
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

      <div
        style={{
          padding: 18,
          background: '#FAFAFA',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 999,
            padding: '10px 18px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          View All History
        </button>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const config =
    {
      sent: {
        bg: '#DCFCE7',
        color: '#166534',
        label: 'Sent',
      },
      sending: {
        bg: '#FEF3C7',
        color: '#92400E',
        label: 'Sending',
      },
      failed: {
        bg: '#FEE2E2',
        color: '#991B1B',
        label: 'Failed',
      },
      scheduled: {
        bg: '#DBEAFE',
        color: '#1D4ED8',
        label: 'Scheduled',
      },
    }[
      status as
        | 'sent'
        | 'sending'
        | 'failed'
        | 'scheduled'
    ] ??
    {
      bg: '#F3F4F6',
      color: '#374151',
      label: status,
    }

  return (
    <div
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        background: config.bg,
        color: config.color,
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {config.label}
    </div>
  )
}