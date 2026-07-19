'use client'

import { useState } from 'react'
import Link from 'next/link'

type QA = {
  q: string
  a: string
}

const FAQ: QA[] = [
  {
    q: 'Welcome to EggPuff',
    a: `EggPuff is your college's private student community.

Ask questions.

Help classmates.

Join communities.

Earn EggPuff Points by contributing.

Everything happens inside your own campus.`,
  },

  {
    q: 'How do I ask a question?',
    a: `Tap the Ask button from the feed, write your question, choose the most relevant community, and post it.

Your question becomes visible to students in your college community, where others can answer and help you.`,
  },

  {
    q: 'How do answers work?',
    a: `Students from your college can answer your question.

Read every answer carefully before choosing the one that helped you the most.

Good answers help everyone in the community learn together.`,
  },

  {
    q: 'What is an Approved Answer?',
    a: `When your question is solved, you can approve one answer.

The approved answer is highlighted so future students can quickly find the best solution.`,
  },

  {
    q: 'Why can`t I answer some questions?',
    a: `Some questions may already be closed, have reached their answer limit, or belong to communities where replying is no longer available.

If replying isn't available, you'll still be able to read the discussion.`,
  },

  {
    q: 'How do EggPuff Points work?',
    a: `EggPuff Points are earned by making positive contributions to your campus community.

Examples include writing helpful answers, participating in community activities, and other future features.

Reward values may evolve as EggPuff grows.`,
  },

  {
    q: 'What are EggPuff Points used for?',
    a: `EggPuff Points unlock features inside EggPuff.

One example is Promote Your Profile (PYP), where you can showcase your Instagram, YouTube channel, portfolio, startup, website, and more.

New uses for EggPuff Points will continue to be introduced over time.`,
  },

  {
    q: 'Do EggPuff Points have real-world value?',
    a: `No.

EggPuff Points are virtual points used only inside EggPuff.

They cannot be exchanged for cash or transferred outside the platform.`,
  },

  {
    q: 'What is Promote Your Profile (PYP)?',
    a: `Promote Your Profile (PYP) lets you use EggPuff Points to showcase your public profiles to more students on your campus.

This can include your Instagram, YouTube channel, GitHub, portfolio, startup, website, or other creator profiles.`,
  },

  {
    q: 'Can students from other colleges see my posts?',
    a: `No.

EggPuff is designed around college communities.

Your questions, answers, communities, and interactions stay within your own campus unless a future feature clearly states otherwise.`,
  },

  {
    q: 'How do Communities work?',
    a: `Communities help organize discussions around interests such as coding, placements, startups, gaming, clubs, academics, sports, and more.

Join communities that match your interests to discover more relevant conversations.`,
  },

  {
    q: 'How do I report inappropriate content?',
    a: `If you find spam, harassment, fake accounts, or content that violates our Community Guidelines, please report it.

Reports help keep EggPuff safe and welcoming for every student.`,
  },
]

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '32px 20px 80px',
      }}
    >
      {/* Header */}

      <div
        style={{
          marginBottom: 34,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.8px',
            color: '#111827',
            marginBottom: 10,
          }}
        >
          Help & FAQ
        </h1>

        <p
          style={{
            color: '#6B7280',
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          Learn how EggPuff works, discover helpful tips,
          and find answers to common questions.
        </p>
      </div>

      {/* FAQ */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {FAQ.map((item, i) => {
          const open = openIndex === i

          return (
            <div
              key={i}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 18,
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: open
                  ? '0 6px 18px rgba(0,0,0,.05)'
                  : '0 1px 3px rgba(0,0,0,.03)',
                transition: 'all .2s ease',
              }}
            >
              {/* Question */}

              <button
                onClick={() =>
                  setOpenIndex(open ? null : i)
                }
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#FFFFFF',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  {item.q}
                </span>

                <span
                  style={{
                    fontSize: 18,
                    color: '#9CA3AF',
                    transform: open
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: '.2s',
                    userSelect: 'none',
                  }}
                >
                  ▾
                </span>
              </button>

              <div
                style={{
                  maxHeight: open ? 500 : 0,
                  overflow: 'hidden',
                  transition:
                    'max-height .25s ease, opacity .2s ease',
                  opacity: open ? 1 : 0,
                }}
              >
                <div
                  style={{
                    padding: '0 20px 20px',
                    color: '#4B5563',
                    fontSize: 15,
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {item.a}
                </div>
              </div>
            </div>
          )
        })}
      </div>

            {/* Need More Help */}

      <div
        style={{
          marginTop: 44,
          padding: 24,
          borderRadius: 18,
          background: '#FFF8ED',
          border: '1px solid #FDE7B0',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 12,
          }}
        >
          Need more help?
        </h2>

        <p
          style={{
            color: '#4B5563',
            lineHeight: 1.8,
            fontSize: 15,
          }}
        >
          Can't find what you're looking for?
          <br />
          Send us an email and we'll be happy to help.
        </p>

        <a
          href="mailto:support@eggpuff.in"
          style={{
            display: 'inline-block',
            marginTop: 18,
            color: '#D97706',
            fontWeight: 700,
            fontSize: 17,
            textDecoration: 'none',
          }}
        >
          support@eggpuff.in
        </a>

        <p
          style={{
            marginTop: 14,
            fontSize: 14,
            color: '#6B7280',
          }}
        >
          We usually respond within <strong>24–48 hours.</strong>
        </p>
      </div>

      {/* Back */}

      <div
        style={{
          marginTop: 36,
        }}
      >
        <Link href="/feed">
          <button
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
              transition: '.15s',
            }}
          >
            Back
          </button>
        </Link>
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: 48,
          paddingTop: 22,
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#6B7280',
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          We're constantly improving EggPuff.
          <br />
          Every question, bug report, and suggestion helps us build a better
          campus experience.
        </p>

        <p
          style={{
            marginTop: 14,
            color: '#9CA3AF',
            fontSize: 13,
          }}
        >
          Thank you for being part of EggPuff ❤️
        </p>
      </div>
    </div>
  )
}