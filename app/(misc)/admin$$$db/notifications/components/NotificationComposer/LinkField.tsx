'use client'

import { ChangeEvent } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void

  error?: string
  disabled?: boolean
}

export default function LinkField({
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    onChange(e.target.value)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <label
          htmlFor="notification-link"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          Optional Link
        </label>

        <span
          style={{
            fontSize: 12,
            color: '#9CA3AF',
          }}
        >
          Opens when tapped
        </span>
      </div>

      {/* Input */}
      <input
        id="notification-link"
        type="text"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        placeholder="/communities"
        spellCheck={false}
        autoComplete="off"
        style={{
          width: '100%',

          padding: '13px 16px',

          borderRadius: 14,

          border: error
            ? '1px solid #EF4444'
            : '1px solid #E5E7EB',

          outline: 'none',

          background: disabled
            ? '#F9FAFB'
            : '#FFFFFF',

          color: '#111827',

          fontSize: 15,

          transition:
            'border-color .18s ease, box-shadow .18s ease',

          boxSizing: 'border-box',
        }}
      />

      {/* Helper */}
      {!error && (
        <div
          style={{
            fontSize: 12,
            color: '#6B7280',
            lineHeight: 1.4,
          }}
        >
          Examples:
          <br />
          /feed
          <br />
          /communities
          <br />
          /question/123
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            color: '#DC2626',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}