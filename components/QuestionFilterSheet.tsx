'use client'

import { useEffect } from 'react'

type FilterType = 'all' | 'unanswered' | 'answered'

type Props = {
  value: FilterType
  onChange: (v: FilterType) => void
  onClose: () => void
}

export default function QuestionFilterSheet({
  value,
  onChange,
  onClose,
}: Props) {
  /* 🔒 lock background scroll */
  useEffect(() => {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth

  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollBarWidth}px`

  return () => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}, [])

  const handleSelect = (v: FilterType) => {
    onChange(v)
    onClose()
  }

  const Item = ({
    id,
    label,
  }: {
    id: FilterType
    label: string
  }) => {
    const active = value === id

    return (
      <button
        onClick={() => handleSelect(id)}
        style={{
          width: '100%',
          padding: '14px 16px',
          border: 'none',
          background: 'transparent',
          fontSize: 15,
          fontWeight: active ? 600 : 500,
          color: active ? '#111827' : '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <span>{label}</span>
        {active && <span style={{ fontSize: 14 }}>✓</span>}
      </button>
    )
  }

  return (
    <div
      style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
}}

    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.45)',
}}
      />

      {/* BOTTOM SHEET */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          paddingBottom: 8,
          zIndex: 1,
          animation: 'sheetIn 0.18s ease-out',
          marginTop:"auto",
        }}
      >
        {/* DRAG HANDLE */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: '#E5E7EB',
            margin: '10px auto 6px',
          }}
        />

        <div
          style={{
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          Filter questions
        </div>

        <Item id="all" label="All questions" />
        <Item id="unanswered" label="Unanswered" />
        <Item id="answered" label="Answered" />
      </div>

      <style>{`
        @keyframes sheetIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
