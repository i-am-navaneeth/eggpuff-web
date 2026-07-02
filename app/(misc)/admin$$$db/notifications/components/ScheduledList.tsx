'use client'

import { useMemo } from 'react'

import { useScheduledNotifications } from '@/hooks/useScheduledNotifications'

type Props = {
  onEditSchedule?: (id: string) => void
}

export default function ScheduledList({
  onEditSchedule,
}: Props) {
  const {
    scheduled,
    scheduledCount,
    sendNow,
    deleteScheduled,
  } = useScheduledNotifications()

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #ECECEC',
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}

      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Scheduled
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Notifications waiting to be
            sent
          </div>
        </div>

        <div
          style={{
            background: '#EEF2FF',
            color: '#4338CA',
            borderRadius: 999,
            padding: '4px 10px',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {scheduledCount}
        </div>
      </div>

      {/* Empty */}

      {scheduledCount === 0 && (
        <div
          style={{
            padding: 34,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 42,
            }}
          >
            ⏰
          </div>

          <div
            style={{
              marginTop: 10,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Nothing Scheduled
          </div>

          <div
            style={{
              marginTop: 6,
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            Scheduled notifications
            will appear here.
          </div>
        </div>
      )}

      {/* Items */}

      {scheduled.map(item => (
        <ScheduledCard
          key={item.id}
          item={item}
          onEdit={() =>
            onEditSchedule?.(item.id)
          }
          onDelete={() => {
            if (
              confirm(
                'Delete this scheduled notification?'
              )
            ) {
              deleteScheduled(item.id)
            }
          }}
          onSend={() =>
            sendNow(item.id)
          }
        />
      ))}

      <div
        style={{
          background: '#FAFAFA',
          padding: 14,
          textAlign: 'center',
          color: '#6B7280',
          fontSize: 13,
        }}
      >
        Notifications will
        automatically send at the
        scheduled time.
      </div>
    </div>
  )
}

function ScheduledCard({
  item,
  onEdit,
  onDelete,
  onSend,
}: {
  item: any
  onEdit: () => void
  onDelete: () => void
  onSend: () => void
}) {
  const countdown = useMemo(() => {
    const diff =
      new Date(
        item.scheduledFor
      ).getTime() - Date.now()

    if (diff <= 0)
      return 'Ready'

    const hours = Math.floor(
      diff / 1000 / 60 / 60
    )

    const mins = Math.floor(
      (diff / 1000 / 60) % 60
    )

    return `${hours}h ${mins}m`
  }, [item.scheduledFor])

  return (
    <div
      style={{
        padding: 18,
        borderBottom:
          '1px solid #F4F4F5',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          gap: 12,
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
              fontWeight: 700,
              color: '#111827',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow:
                'ellipsis',
            }}
          >
            {item.title}
          </div>

          <div
            style={{
              marginTop: 6,
              color: '#6B7280',
              fontSize: 14,
              display:
                '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient:
                'vertical',
              overflow: 'hidden',
            }}
          >
            {item.body}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 12,
            }}
          >
            <span
              style={{
                background:
                  '#F9FAFB',
                border:
                  '1px solid #E5E7EB',
                borderRadius: 999,
                padding:
                  '5px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              📅{' '}
              {new Date(
                item.scheduledFor
              ).toLocaleString()}
            </span>

            <span
              style={{
                background:
                  '#FEF3C7',
                color: '#92400E',
                borderRadius: 999,
                padding:
                  '5px 10px',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ⏳ {countdown}
            </span>
          </div>
        </div>

        <button
          onClick={onDelete}
          style={{
            width: 36,
            height: 36,
            border: 'none',
            background:
              '#F9FAFB',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          🗑️
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 16,
        }}
      >
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 12,
            border:
              '1px solid #E5E7EB',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Edit
        </button>

        <button
          onClick={onSend}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 12,
            border: 'none',
            background:
              '#F4B860',
            color: '#111827',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Send Now
        </button>
      </div>
    </div>
  )
}