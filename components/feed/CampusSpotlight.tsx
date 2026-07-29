'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'

type Props = {
  name: string
  avatar?: string | null
  category: string
  caption: string
  discoveries: number
  onClick: () => void
}

export default function CampusSpotlight({
  name,
  avatar,
  category,
  caption,
  discoveries,
  onClick,
}: Props) {
  return (
    <>
  <div
    style={{
      height: 0,
      background: '#ECECEC',
      margin: '16px 0',
    }}
  />

  <div
    onClick={onClick}
    style={{
      background: '#FFFFFF',
      border: '1px solid #ECECEC',
      borderRadius: 20,
      padding: 16,
      cursor: 'pointer',
      transition: 'all .18s ease',
      boxShadow: '0 8px 24px rgba(17,24,39,.06)',
    }}
  >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#FFF7E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles
            size={18}
            color="#D97706"
          />
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#111827',
            }}
          >
            Campus Spotlight
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Discover creators from your campus
          </div>
        </div>
      </div>

      {/* Creator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F3F4F6',
            }}
          />
        )}

        <div
          style={{
            flex: 1,
          }}
        >
          <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  }}
>
  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: '#111827',
    }}
  >
    {name}
  </div>

  <div
    style={{
      padding: '3px 10px',
      borderRadius: 999,
      background: '#FFF7E8',
      color: '#D97706',
      fontSize: 12,
      fontWeight: 600,
    }}
  >
    🎨 {category.charAt(0).toUpperCase() + category.slice(1)}
  </div>
</div>

          <div
  style={{
    marginTop: 10,
  }}
>
  <div
    style={{
      fontSize: 12,
      color: '#9CA3AF',
      marginBottom: 4,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '.04em',
    }}
  >
    About
  </div>

  <div
    style={{
      color: '#374151',
      fontSize: 14,
      lineHeight: 1.6,
      wordBreak: 'break-word',
    }}
  >
    {caption}
  </div>
</div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            color: '#6B7280',
            fontSize: 13,
          }}
        >
          👀 Seen by {discoveries.toLocaleString()} students
        </div>

        <button
  onClick={(e) => {
    e.stopPropagation()
    onClick()
  }}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    borderRadius: 14,
    background: '#F4B860',
    color: '#111827',
    padding: '10px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  }}
>
  Visit
  <ArrowUpRight size={16} />
</button>
      </div>
      </div>

  <div
  style={{
    height: 1,
    background: '#E5E7EB',
    margin: '16px 0',
  }}
/>
</>
  )
}