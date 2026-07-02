'use client'

import { useNotificationCooldown } from '@/hooks/useNotificationCooldown'

export default function CooldownCard() {
  const {
    canSend,
    cooldownRemaining,
    lastSentText,
  } = useNotificationCooldown()

  const queue = 0

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 22,
        padding: 22,
        boxShadow: '0 8px 24px rgba(0,0,0,.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
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
            Cooldown
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginTop: 3,
            }}
          >
            Protects users from notification spam.
          </div>
        </div>

        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: canSend
              ? '#10B981'
              : '#F59E0B',
            transition: 'all .25s ease',
          }}
        />
      </div>

      {/* Timer */}
      <div
        style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 18,
          padding: 20,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 8,
          }}
        >
          {canSend
            ? 'Notifications can be sent'
            : 'Next notification available in'}
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 1,
            color: canSend
              ? '#10B981'
              : '#111827',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {canSend
            ? 'READY'
            : cooldownRemaining}
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <InfoRow
          label="Status"
          value={
            canSend
              ? 'Ready to Send'
              : 'Cooldown Active'
          }
        />

        <InfoRow
          label="Last Notification"
          value={lastSentText}
        />

        <InfoRow
          label="Queue"
          value={`${queue} pending`}
        />

        <InfoRow
          label="Cooldown"
          value="5 minutes"
        />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid #F3F4F6',
          fontSize: 12,
          color: '#9CA3AF',
          lineHeight: 1.6,
        }}
      >
        Notifications are automatically rate-limited
        to prevent accidental duplicate broadcasts.
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          color: '#6B7280',
          fontSize: 14,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: '#111827',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {value}
      </span>
    </div>
  )
}