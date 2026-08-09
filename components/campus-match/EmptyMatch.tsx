'use client'

import { SearchX } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EmptyMatch() {
  const router = useRouter()

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: '#FFF7E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchX
          size={34}
          color="#D97706"
        />
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          color: '#111827',
        }}
      >
        Match Not Found
      </h1>

      <p
        style={{
          marginTop: 14,
          color: '#6B7280',
          lineHeight: 1.7,
          fontSize: 16,
        }}
      >
        This Campus Match doesn't exist anymore,
        has ended, or has been removed.
      </p>

      <button
        onClick={() =>
          router.push('/campus-match')
        }
        style={{
          marginTop: 28,
          width: '100%',
          maxWidth: 320,
          height: 56,
          border: 'none',
          borderRadius: 18,
          background: '#F4B860',
          color: '#111827',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Browse Campus Matches
      </button>
    </main>
  )
}