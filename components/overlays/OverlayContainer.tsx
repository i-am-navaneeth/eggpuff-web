'use client'

import {
  ReactNode,
  useEffect,
  useRef,
} from 'react'
import { useShellLayout } from '@/components/ShellLayoutContext'

type Props = {
  onClose?: () => void

  fullScreen?: boolean

  children: (
    scrollRef: React.RefObject<HTMLDivElement | null>
  ) => ReactNode
}

export default function OverlayContainer({
  children,
  onClose,
  fullScreen = false,
}: Props) {
  const scrollRef =
    useRef<HTMLDivElement>(null)

  const {
  topInset,
  bottomInset,
} = useShellLayout()
  // ===========================
  // Lock background scrolling
  // ===========================
  useEffect(() => {
    const previous =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        previous
    }
  }, [])

  // ===========================
  // ESC closes overlay
  // ===========================
  useEffect(() => {
    if (!onClose) return

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
  }, [onClose])
  console.log({
  topInset,
  bottomInset,
})

  return (
    <div
      style={{
  position: 'fixed',

top: fullScreen ? 0 : topInset,
left: 0,
right: 0,
bottom: fullScreen ? 0 : bottomInset,

  zIndex: 1000,

  background:
    'rgba(0,0,0,0.25)',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'stretch',

  animation:
    'epOverlayFade 180ms ease',
}}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}}
      />

      {/* Content */}
      <div
        ref={scrollRef}
        style={{
          position: 'relative',

          width: '100%',
          maxWidth: 1140,

          height: '100%',

          paddingBottom: bottomInset,
          boxSizing: 'border-box',

          background: '#f5f5f5',

          overflowY: 'auto',

          WebkitOverflowScrolling:
            'touch',

          animation:
            'epOverlaySlide 220ms ease',
        }}
      >
        {children(scrollRef)}
      </div>

      <style jsx global>{`
        @keyframes epOverlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes epOverlaySlide {
          from {
            transform: translateY(24px);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}