'use client'

type FilterType = 'all' | 'unanswered' | 'answered'

type Props = {
  value: FilterType
  onOpenSheet: () => void
}

export default function FeedFilterPills({
  value,
  onOpenSheet,
}: Props) {
  // 🔥 Always show as "Filter" instead of dynamic label
  const filterLabel = 'Filter'

  const Pill = ({
    text,
    onClick,
  }: {
    text: string
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        border: '1px solid #E5E7EB',
        background: '#FFFFFF',
        fontSize: 13,
        fontWeight: 500,
        color: '#111827',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      <span style={{ fontSize: 12, opacity: 0.6 }}>▾</span>
    </button>
  )

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        margin: '12px 0 16px',
        gap: 12,
      }}
    >
      {/* FILTER PILL */}
      <Pill text={filterLabel} onClick={onOpenSheet} />
    </div>
  )
}
