'use client'

import { useState, useMemo, useEffect } from 'react'
import { useNotify } from './NotificationProvider'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  label: string
  activeCount?: number
}

type Props = {
  categories: Category[]
  onSelect: (categoryId: string | null) => void
  onAsk: (payload: { id: string; label: string }) => void
  onClose: () => void
}

/* 🎨 COLOR PALETTE */
const ICON_COLORS = [
  { bg: '#FDE68A', text: '#78350F' },
  { bg: '#BFDBFE', text: '#1E3A8A' },
  { bg: '#BBF7D0', text: '#14532D' },
  { bg: '#FBCFE8', text: '#831843' },
  { bg: '#DDD6FE', text: '#312E81' },
  { bg: '#FED7AA', text: '#7C2D12' },
]

function getColorById(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length]
}

export default function CategoryOverlay({
  categories,
  onSelect,
  onAsk,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Category | null>(null)
  const { notify } = useNotify()
  const router = useRouter()

  /* ✅ Show overlay only once per session */
  useEffect(() => {
    const seen = sessionStorage.getItem('category_overlay_seen')
    if (!seen) {
      sessionStorage.setItem('category_overlay_seen', 'true')
    }
  }, [])

  /**
   * 🔹 Remove DB "General" category to avoid duplicate with virtual General.
   */
  const filteredCategories = useMemo(() => {
    return categories.filter(
      cat => cat.label.trim().toLowerCase() !== 'general'
    )
  }, [categories])

  const handleFeed = () => {
    if (!selected) return
    onSelect(selected.id)
    onClose()
  }

  const handleAsk = () => {
    if (!selected) return

    try {
      if (onAsk) {
        onAsk({ id: selected.id, label: selected.label })
      }

      if (selected.id === 'general' || selected.id === 'all') {
        router.push('/ask')
      } else {
        router.push(`/ask?category=${selected.id}`)
      }
    } catch (error) {
      console.error('Ask navigation failed:', error)
    }

    onClose()
  }

  const handleCreateCategory = () => {
    notify('🚧 Create category — coming soon')
  }

  const getSelectedColor = () => {
    if (!selected) return { bg: '#F3F4F6', text: '#111827' }

    if (selected.id === 'all') {
      return { bg: '#E5E7EB', text: '#111827' }
    }

    if (selected.id === 'general') {
      return { bg: '#DBEAFE', text: '#1E40AF' }
    }

    return getColorById(selected.id)
  }

  /* ✅ Get activeCount for virtual categories */
  const generalCount =
    categories.find(
      c => c.label.trim().toLowerCase() === 'general'
    )?.activeCount ?? 0

  const allCount =
    categories.reduce(
      (sum, c) => sum + (c.activeCount ?? 0),
      0
    ) ?? 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }}
      />

      {/* CARD */}
      <div
        className="category-overlay-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: 520,
          background: '#FFFFFF',
          borderRadius: 20,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            opacity: 0.6,
          }}
        >
          ×
        </button>

        {!selected && (
          <>
            <h3
              style={{
                margin: '16px 0 4px',
                fontSize: 16,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Choose a category
            </h3>
            <p
              style={{
                fontSize: 12,
                opacity: 0.6,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Questions will be filtered automatically
            </p>
          </>
        )}

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px 16px',
          }}
        >
          {!selected && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 28,
              }}
            >
              {/* ALL */}
<button
  onClick={() => {
    onSelect(null)     // 🔥 instantly apply filter
    onClose()          // 🔥 close overlay immediately
  }}
  style={{
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  }}
>
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: '#E5E7EB',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      fontWeight: 700,
    }}
  >
    ∞
  </div>

  <div style={{ fontSize: 14, fontWeight: 600 }}>
    All
  </div>
</button>

              {/* GENERAL */}
              <button
                onClick={() =>
                  setSelected({ id: 'general', label: 'General' })
                }
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  G
                  {generalCount > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        borderRadius: 999,
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {generalCount}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  General
                </div>
              </button>

              {/* REAL CATEGORIES */}
              {filteredCategories.map(cat => {
                const color = getColorById(cat.id)
                const count = cat.activeCount ?? 0

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelected(cat)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: color.bg,
                        color: color.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                      }}
                    >
                      {cat.label.charAt(0)}
                      {count > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 18,
                            height: 18,
                            padding: '0 5px',
                            borderRadius: 999,
                            background: '#EF4444',
                            color: '#FFFFFF',
                            fontSize: 10,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {count}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {cat.label}
                    </div>
                  </button>
                )
              })}

              {/* CREATE */}
              <button
                onClick={handleCreateCategory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#F3F4F6',
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  +
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  Create
                </div>
              </button>
            </div>
          )}

          {selected && (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: getSelectedColor().bg,
                  color: getSelectedColor().text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {selected.label.charAt(0)}
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {selected.label}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleFeed}>Feed</button>
                {selected.id !== 'all' && (
                  <button onClick={handleAsk}>Ask</button>
                )}
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  opacity: 0.6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ← Back to categories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
