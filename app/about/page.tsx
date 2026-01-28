'use client'

import { useState } from 'react'
import Link from 'next/link'

type QA = {
  q: string
  a: string
}

const FAQ: QA[] = [
  {
    q: 'What is EggPuff 🥐?',
    a: `EggPuff is a campus Q&A platform.
Ask questions, help others with answers, and earn 🥐 (EggPuffs) for good participation.`,
  },
  {
    q: 'How does asking a question work?',
    a: `Asking a question costs 1 🥐.
Each question can receive up to 2 answers from other users.`,
  },
  {
    q: 'How do answers work?',
    a: `Anyone (except the asker) can answer.
Once two answers are submitted, no more answers are allowed.`,
  },
  {
    q: 'What does “Approve” mean?',
    a: `The person who asked the question can approve ONE correct answer.
That answer is marked as approved and the question is closed.`,
  },
  {
    q: 'How do rewards work?',
    a: `• Approved answerer gets +1 🥐
• Users who supported (👍) the approved answer get +0.5 🥐
• Rewards are given only once and are permanent`,
  },
  {
    q: 'What happens when a question is closed?',
    a: `Once an answer is approved:
• No more answers can be submitted
• Likes are locked
• The approved answer stays highlighted`,
  },
  {
    q: 'Can I buy 🥐?',
    a: `Yes.
Tap your 🥐 balance on the top bar to buy EggPuffs using UPI.`,
  },
]

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 6 }}>About EggPuff 🥐</h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Everything you need to know, explained simply.
        </p>
      </div>

      {/* FAQ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQ.map((item, i) => {
          const open = openIndex === i

          return (
            <div
              key={i}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* QUESTION */}
              <button
                onClick={() =>
                  setOpenIndex(open ? null : i)
                }
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 14,
                  background: '#f9fafb',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <span>{item.q}</span>
                <span
                  style={{
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  ▾
                </span>
              </button>

              {/* ANSWER */}
              {open && (
                <div
                  style={{
                    padding: 14,
                    background: '#fff',
                    fontSize: 14,
                    color: '#374151',
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: 32 }}>
        <Link href="/feed">
          <button>← Back to feed</button>
        </Link>
      </div>
    </div>
  )
}
