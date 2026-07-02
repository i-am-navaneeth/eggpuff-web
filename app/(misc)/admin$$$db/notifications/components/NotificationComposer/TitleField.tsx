'use client'

import { useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void

  maxLength?: number

  disabled?: boolean

  placeholder?: string

  error?: string
}

export default function TitleField({
  value,
  onChange,

  maxLength = 80,

  disabled = false,

  placeholder = 'Notification title',

  error,
}: Props) {
  const [focused, setFocused] =
    useState(false)

  const remaining =
    maxLength - value.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Label */}
      <label
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#111827',
        }}
      >
        Title
      </label>

      {/* Input */}
      <div
        style={{
          position: 'relative',
        }}
      >
        <input
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) =>
            onChange(e.target.value)
          }
          onFocus={() =>
            setFocused(true)
          }
          onBlur={() =>
            setFocused(false)
          }
          aria-invalid={!!error}
          aria-label="Notification title"
          style={{
            width: '100%',

            height: 56,

            padding: '0 18px',

            borderRadius: 16,

            outline: 'none',

            boxSizing: 'border-box',

            background: '#FFFFFF',

            fontSize: 16,

            fontWeight: 500,

            color: '#111827',

            transition:
              'all .18s ease',

            border: error
              ? '1.5px solid #EF4444'
              : focused
              ? '1.5px solid #F4B860'
              : '1px solid #E5E7EB',

            boxShadow: focused
              ? '0 0 0 4px rgba(244,184,96,.12)'
              : '0 1px 2px rgba(0,0,0,.03)',
          }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          minHeight: 20,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: error
              ? '#DC2626'
              : '#6B7280',
          }}
        >
          {error ||
            'Displayed as the notification title.'}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color:
              remaining <= 10
                ? '#F59E0B'
                : '#9CA3AF',
          }}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  )
}