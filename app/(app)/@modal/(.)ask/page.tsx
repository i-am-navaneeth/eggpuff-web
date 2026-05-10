'use client'

import AskPage from '@/app/(app)/ask/page'
import { useRouter } from 'next/navigation'

export default function AskModal() {
  const router = useRouter()

  return (
    <div
      onClick={() => router.back()}
      style={{
        position: 'fixed',

        inset: 0,

        zIndex: 200,

        background:
          'rgba(0,0,0,0.32)',

        backdropFilter: 'blur(6px)',

        WebkitBackdropFilter:
          'blur(6px)',

        display: 'flex',

        justifyContent: 'center',

        alignItems: 'flex-end',
      }}
    >
      {/* MODAL SHEET */}
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          width: '100%',

          maxWidth: 720,

          height: '100%',

          overflowY: 'auto',

          background: '#F5F5F5',

          borderTopLeftRadius: 28,

          borderTopRightRadius: 28,

          boxShadow:
            '0 -10px 40px rgba(0,0,0,0.12)',

          animation:
            'slideUp 0.22s ease-out',
        }}
      >
        <AskPage />
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform:
              translateY(100%);
          }

          to {
            transform:
              translateY(0);
          }
        }
      `}</style>
    </div>
  )
}