'use client'

import React from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmationSheet({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#DC2626',
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.38)',
          zIndex: 9998,
        }}
      />

      {/* SHEET */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '16px 20px calc(env(safe-area-inset-bottom) + 22px)',
          boxShadow: '0 -12px 40px rgba(0,0,0,.15)',
          zIndex: 9999,
          animation: 'confirmationSheetUp .22s ease',
        }}
      >
        {/* HANDLE */}
        <div
          style={{
            width: 42,
            height: 5,
            borderRadius: 999,
            background: '#D1D5DB',
            margin: '0 auto 18px',
          }}
        />

        {/* TITLE */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'center',
            color: '#111827',
          }}
        >
          {title}
        </div>

        {/* DESCRIPTION */}
        {description && (
          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              color: '#6B7280',
              lineHeight: 1.55,
              textAlign: 'center',
            }}
          >
            {description}
          </div>
        )}

        {/* BUTTONS */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 26,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: '1px solid #E5E7EB',
              background: '#FFF',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: confirmColor,
              color: '#FFF',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confirmationSheetUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}