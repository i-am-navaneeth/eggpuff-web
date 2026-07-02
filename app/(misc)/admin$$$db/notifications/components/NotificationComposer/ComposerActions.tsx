'use client'

type Props = {
  loading?: boolean

  canSend?: boolean
  canSaveDraft?: boolean
  canSchedule?: boolean

  onSend: () => void
  onSaveDraft: () => void
  onSchedule: () => void
}

export default function ComposerActions({
  loading = false,

  canSend = true,
  canSaveDraft = true,
  canSchedule = true,

  onSend,
  onSaveDraft,
  onSchedule,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-end',
      }}
    >
      {/* Draft */}
      <button
        disabled={!canSaveDraft || loading}
        onClick={onSaveDraft}
        style={{
          padding: '12px 18px',

          borderRadius: 14,

          border: '1px solid #E5E7EB',

          background: '#FFFFFF',

          color: '#374151',

          fontWeight: 700,

          fontSize: 14,

          cursor:
            loading || !canSaveDraft
              ? 'not-allowed'
              : 'pointer',

          opacity:
            loading || !canSaveDraft
              ? 0.55
              : 1,

          transition:
            'all .18s ease',
        }}
      >
        💾 Save Draft
      </button>

      {/* Schedule */}
      <button
        disabled={!canSchedule || loading}
        onClick={onSchedule}
        style={{
          padding: '12px 18px',

          borderRadius: 14,

          border: '1px solid #E5E7EB',

          background: '#F9FAFB',

          color: '#111827',

          fontWeight: 700,

          fontSize: 14,

          cursor:
            loading || !canSchedule
              ? 'not-allowed'
              : 'pointer',

          opacity:
            loading || !canSchedule
              ? 0.55
              : 1,

          transition:
            'all .18s ease',
        }}
      >
        ⏰ Schedule
      </button>

      {/* Send */}
      <button
        disabled={!canSend || loading}
        onClick={onSend}
        style={{
          minWidth: 150,

          padding: '12px 22px',

          border: 'none',

          borderRadius: 14,

          background: '#F4B860',

          color: '#111827',

          fontWeight: 800,

          fontSize: 15,

          cursor:
            loading || !canSend
              ? 'not-allowed'
              : 'pointer',

          opacity:
            loading || !canSend
              ? 0.6
              : 1,

          transition:
            'all .18s ease',

          boxShadow:
            loading
              ? 'none'
              : '0 8px 20px rgba(244,184,96,.28)',
        }}
      >
        {loading
          ? 'Sending...'
          : '🚀 Send Notification'}
      </button>
    </div>
  )
}