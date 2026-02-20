'use client'

import Link from 'next/link'

type Props = {
  category: string
  label: string
}

export default function CategoryAction({ category, label }: Props) {
  return (
    <div
      style={{
        padding: 20,
        maxWidth: 600,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* CATEGORY TITLE */}
      <h2 style={{ marginBottom: 6 }}>{label}</h2>
      <p style={{ fontSize: 13, opacity: 0.7 }}>
        Ask or answer questions related to {label.toLowerCase()}
      </p>

      {/* ACTION BUTTONS */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* ASK */}
        <Link href={`/ask?category=${category}`}>
          <button
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Ask a question 🥐
          </button>
        </Link>

        {/* FEED */}
        <Link href={`/category/${category}`}>
          <button
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              background: '#f3f4f6',
              border: 'none',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View questions
          </button>
        </Link>

        {/* BACK */}
        <Link href="/feed">
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 14,
              background: 'transparent',
              border: '1px solid #e5e7eb',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </Link>
      </div>
    </div>
  )
}
