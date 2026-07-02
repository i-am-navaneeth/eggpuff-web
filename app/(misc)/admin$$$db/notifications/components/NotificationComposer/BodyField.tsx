'use client'

import { useEffect, useRef } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void

  placeholder?: string

  maxLength?: number

  autoFocus?: boolean

  disabled?: boolean

  error?: string
}

export default function BodyField({
  value,
  onChange,

  placeholder = 'Write your notification...',

  maxLength = 240,

  autoFocus = false,

  disabled = false,

  error,
}: Props) {
  const textareaRef =
    useRef<HTMLTextAreaElement>(null)

  // Auto Grow
  useEffect(() => {
    const el = textareaRef.current

    if (!el) return

    el.style.height = '0px'
    el.style.height =
      `${el.scrollHeight}px`
  }, [value])

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
        Body
      </label>

      {/* Textarea */}

      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        disabled={disabled}
        spellCheck={false}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={{
          width: '100%',

          minHeight: 160,

          resize: 'none',

          overflow: 'hidden',

          padding: '18px 20px',

          borderRadius: 18,

          border: error
            ? '1.5px solid #EF4444'
            : '1px solid #E5E7EB',

          outline: 'none',

          background: disabled
            ? '#F9FAFB'
            : '#FFFFFF',

          color: '#111827',

          fontSize: 15,

          lineHeight: '26px',

          fontFamily:
            'Inter, system-ui, sans-serif',

          transition:
            'border-color .18s ease, box-shadow .18s ease',

          boxShadow: error
            ? '0 0 0 3px rgba(239,68,68,.08)'
            : '0 2px 8px rgba(0,0,0,.03)',

          boxSizing: 'border-box',
        }}
      />

      {/* Bottom Row */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: '#EF4444',
            minHeight: 18,
          }}
        >
          {error}
        </div>

        <div
          style={{
            fontSize: 12,
            color:
              value.length >
              maxLength * 0.9
                ? '#F59E0B'
                : '#9CA3AF',

            fontWeight: 600,
          }}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  )
}