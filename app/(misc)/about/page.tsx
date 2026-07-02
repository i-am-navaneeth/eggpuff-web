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
    a: `EggPuff is a campus Q&A platform. Ask questions, help others with answers, and earn 🥐 (EggPuffs) for good participation.

EggPuffs are internal points used only inside the app — for things like PYP (Promote Your Profile: Instagram, YouTube, etc.). They have no real-world cash value.`,
  },
  {
    q: 'How does asking a question work?',
    a: `Asking a question costs 1 🥐.
Each question can receive up to 2 answers from other users.`,
  },
  {
    q: 'What is PYP?',
    a: `PYP (Promote Your Profile) is a feature in EggPuff that lets you promote your social media profile
across the platform.
When you use PYP, it helps you grow your reach, views, and engagement within the campus community.`,
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
    <>
      <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              marginBottom: 6,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            About EggPuff 🥐
          </h2>
          <p
            style={{
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            Everything you need to know, explained simply.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQ.map((item, i) => {
            const open = openIndex === i

            return (
              <div
                key={i}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  transition: 'box-shadow 0.15s ease',
                  boxShadow: open
                    ? '0 2px 8px rgba(0,0,0,0.04)'
                    : '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                {/* QUESTION */}
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 16,
                    background: open ? '#F9FAFB' : '#F9FAFB',
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
                      transform: open
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      fontSize: 12,
                      opacity: 0.7,
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* ANSWER (Smooth Animation) */}
                <div
                  style={{
                    maxHeight: open ? 300 : 0,
                    overflow: 'hidden',
                    transition:
                      'max-height 0.25s ease, opacity 0.2s ease',
                    opacity: open ? 1 : 0,
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* BACK BUTTON */}
        <div style={{ marginTop: 36 }}>
          <Link href="/feed">
            <button
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ← Back to feed
            </button>
          </Link>
        </div>

        {/* SUPPORT FOOTER */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: '1px solid rgba(0,0,0,0.06)',
            textAlign: 'center',
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          Need help or feedback? Contact us 📩{' '}
          <a
            href="mailto:support@eggpuff.in"
            style={{
              color: '#111827',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            support@eggpuff.in
          </a>
        </div>
      </div>
    </>
  )
}
