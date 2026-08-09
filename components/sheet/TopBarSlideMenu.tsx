'use client'

import {
  ReactNode,
  useEffect,
} from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean

  title: React.ReactNode

  onClose: () => void

  children: ReactNode

  width?: number
}

export default function TopBarSlideMenu({
  open,
  title,
  onClose,
  children,
  width = 280,
}: Props) {
  useEffect(() => {
    if (!open) return

    const previous =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        previous
    }
  }, [open])

return createPortal(
  <>
    {/* BACKDROP */}
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,.03)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .25s ease',
        zIndex: 5000,
      }}
    />

    {/* PANEL */}
    <aside
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width,
        background: '#fff',
        boxShadow:
          '-10px 0 35px rgba(0,0,0,.08)',
        transform: open
          ? 'translateX(0)'
          : 'translateX(100%)',
        transition:
          'transform .28s cubic-bezier(.22,.8,.28,1)',
        zIndex: 5001,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #F1F1F1',
          flexShrink: 0,
          background: '#fff',
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          {title}
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            border: 'none',
            borderRadius: 999,
            background: '#F8F8F8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18"
              stroke="#111827"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#111827"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 14,
        }}
      >
        {children}
      </div>
    </aside>
  </>,
  document.body
)}