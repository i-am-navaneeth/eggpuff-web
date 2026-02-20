'use client'

type Props = {
  label: string
  activeCount?: number
  onClick: () => void
}

export default function CategoryCard({
  label,
  activeCount = 0,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '16px 18px',
        borderRadius: 999, // pill style
        border: '1px solid #FED7AA',
        background: '#FFF7ED', // soft yellow
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
        fontWeight: 600,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow =
          '0 6px 14px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* LABEL */}
      <span>{label}</span>

      {/* ACTIVE COUNT */}
      {activeCount > 0 && (
        <span
          style={{
            minWidth: 22,
            height: 22,
            padding: '0 6px',
            borderRadius: 999,
            background: '#EF4444',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {activeCount}
        </span>
      )}
    </button>
  )
}
