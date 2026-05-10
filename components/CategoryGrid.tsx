'use client'

type Category = {
  id: string
  label: string
  activeCount: number
}

type Props = {
  categories: Category[]
  onSelect: (categoryId: string) => void
}

export default function CategoryGrid({
  categories,
  onSelect,
}: Props) {
  if (categories.length === 0) {
    return (
      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          opacity: 0.6,
        }}
      >
        No categories available
      </p>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
      }}
    >
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          style={{
            position: 'relative',
            padding: 16,
            borderRadius: 16,
            border: '1px solid #FED7AA',
            background: '#FFF7ED', // yellow overlay card
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          }}
          onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-1px)'
  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.08)'
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = 'none'
}}
        >
          {/* 🔴 ACTIVE COUNT BADGE */}
          {cat.activeCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                minWidth: 20,
                height: 20,
                padding: '0 6px',
                borderRadius: 999,
                background: '#EF4444',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cat.activeCount}
            </div>
          )}

          {/* LABEL */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {cat.label}
          </div>

          {/* SUBTEXT */}
          <div
            style={{
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            {cat.activeCount} active question
            {cat.activeCount === 1 ? '' : 's'}
          </div>
        </button>
      ))}
    </div>
  )
}
