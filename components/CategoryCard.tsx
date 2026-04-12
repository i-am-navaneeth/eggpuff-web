'use client'

type Props = {
  label: string
  onClick: () => void
}

export default function CategoryCard({
  label,
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
    </button>
  )
}
