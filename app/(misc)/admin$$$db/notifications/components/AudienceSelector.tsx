'use client'

import { useState } from 'react'

export type AudienceType =
  | 'everyone'
  | 'college'
  | 'community'
  | 'users'

type Props = {
  value: AudienceType
  onChange: (value: AudienceType) => void

  college?: string
  onCollegeChange?: (value: string) => void

  community?: string
  onCommunityChange?: (value: string) => void

  users?: string
  onUsersChange?: (value: string) => void
}

const audiences = [
  {
    id: 'everyone',
    label: 'Everyone',
    subtitle: 'Every EggPuff user',
    emoji: '🌍',
  },
  {
    id: 'college',
    label: 'College',
    subtitle: 'Only one college',
    emoji: '🏫',
  },
  {
    id: 'community',
    label: 'Community',
    subtitle: 'One community',
    emoji: '👥',
  },
  {
    id: 'users',
    label: 'Selected Users',
    subtitle: 'Usernames or IDs',
    emoji: '🎯',
  },
] as const

export default function AudienceSelector({
  value,
  onChange,

  college = '',
  onCollegeChange,

  community = '',
  onCommunityChange,

  users = '',
  onUsersChange,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {audiences.map((item) => {
        const active = value === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,

              padding: '16px',

              borderRadius: 16,

              border: active
                ? '2px solid #F4B860'
                : '1px solid #E5E7EB',

              background: active
                ? '#FFF9EC'
                : '#FFFFFF',

              cursor: 'pointer',

              transition: '.18s',

              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,

                borderRadius: 12,

                background: active
                  ? '#FDE7BF'
                  : '#F9FAFB',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                fontSize: 22,

                flexShrink: 0,
              }}
            >
              {item.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#111827',
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                  marginTop: 2,
                }}
              >
                {item.subtitle}
              </div>
            </div>

            <div
              style={{
                width: 22,
                height: 22,

                borderRadius: '50%',

                border: active
                  ? '6px solid #F4B860'
                  : '2px solid #D1D5DB',

                transition: '.15s',
              }}
            />
          </button>
        )
      })}

      {/* College */}

      {value === 'college' && (
        <input
          value={college}
          onChange={(e) =>
            onCollegeChange?.(e.target.value)
          }
          placeholder="College name..."
          style={inputStyle}
        />
      )}

      {/* Community */}

      {value === 'community' && (
        <input
          value={community}
          onChange={(e) =>
            onCommunityChange?.(
              e.target.value
            )
          }
          placeholder="Community slug..."
          style={inputStyle}
        />
      )}

      {/* Users */}

      {value === 'users' && (
        <>
          <textarea
            value={users}
            onChange={(e) =>
              onUsersChange?.(
                e.target.value
              )
            }
            placeholder={`One username per line

surya
john
adminofeggpuff`}
            rows={5}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 120,
              fontFamily: 'inherit',
            }}
          />

          <div
            style={{
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            One username or user id per line.
          </div>
        </>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',

  padding: '14px 16px',

  borderRadius: 14,

  border: '1px solid #E5E7EB',

  background: '#FFFFFF',

  fontSize: 15,

  outline: 'none',

  boxSizing: 'border-box',
}