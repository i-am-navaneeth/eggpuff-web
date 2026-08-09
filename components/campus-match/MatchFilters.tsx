'use client'

import { Search } from 'lucide-react'

type Props = {
  activity: string
  mode: string
  search: string

  onActivityChange: (
    value: string
  ) => void

  onModeChange: (
    value: string
  ) => void

  onSearchChange: (
    value: string
  ) => void
}

const ACTIVITIES = [
  '',
  'study',
  'project',
  'placement',
  'interview',
  'tutoring',
  'gaming',
  'hackathon',
  'sports',
  'startup',
  'event',
]

const MODES = [
  '',
  'online',
  'offline',
  'hybrid',
]

export default function MatchFilters({
  activity,
  mode,
  search,
  onActivityChange,
  onModeChange,
  onSearchChange,
}: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 18,
      }}
    >
      {/* Search */}

      <div
        style={{
          position: 'relative',
        }}
      >
        <Search
          size={18}
          color="#9CA3AF"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform:
              'translateY(-50%)',
          }}
        />

        <input
          value={search}
          onChange={(e) =>
            onSearchChange(
              e.target.value
            )
          }
          placeholder="Search Campus Matches..."
          style={{
            width: '100%',
            height: 54,
            borderRadius: 16,
            border:
              '1px solid #E5E7EB',
            paddingLeft: 48,
            paddingRight: 16,
            fontSize: 15,
            outline: 'none',
            background: '#FFFFFF',
          }}
        />
      </div>

      {/* Activity */}

      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {ACTIVITIES.map((item) => {
          const active =
            activity === item

          return (
            <button
              key={item || 'all'}
              type="button"
              onClick={() =>
                onActivityChange(item)
              }
              style={{
                flexShrink: 0,
                borderRadius: 999,
                padding:
                  '10px 18px',
                border: active
                  ? '2px solid #F4B860'
                  : '1px solid #E5E7EB',
                background: active
                  ? '#FFF8EB'
                  : '#FFFFFF',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {item === ''
                ? 'All'
                : item}
            </button>
          )
        })}
      </div>

      {/* Mode */}

      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {MODES.map((item) => {
          const active =
            mode === item

          return (
            <button
              key={item || 'all'}
              type="button"
              onClick={() =>
                onModeChange(item)
              }
              style={{
                flexShrink: 0,
                borderRadius: 999,
                padding:
                  '10px 18px',
                border: active
                  ? '2px solid #F4B860'
                  : '1px solid #E5E7EB',
                background: active
                  ? '#FFF8EB'
                  : '#FFFFFF',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {item === ''
                ? 'All Modes'
                : item.charAt(0).toUpperCase() +
                  item.slice(1)}
            </button>
          )
        })}
      </div>
    </div>
  )
}