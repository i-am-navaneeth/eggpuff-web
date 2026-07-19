'use client'

import React, { forwardRef } from 'react'

type Props = {
  question: string
  creator: string
  username: string
  helpfulCount: number
  answersCount: number
}

const QuestionShareCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      question,
      creator,
      username,
      helpfulCount,
      answersCount,
    },
    ref
  ) => {
    const fontSize =
  question.length < 40
    ? 72
    : question.length < 80
    ? 64
    : question.length < 120
    ? 56
    : 50

const MAX_CHARS = 90

const isLongQuestion =
  question.length > MAX_CHARS

const displayQuestion = isLongQuestion
  ? question
      .slice(0, MAX_CHARS)
      .trimEnd()
      .replace(/\s+\S*$/, '')
      .replace(/[.,!?;:]+$/, '') + '...'
  : question

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          background:
            'linear-gradient(180deg,#FFFFFF 0%,#FFFDF9 100%)',
          padding: 72,
          boxSizing: 'border-box',
          fontFamily:
            'Inter,system-ui,sans-serif',
          borderRadius: 40,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -180,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'rgba(255,184,96,.14)',
            filter: 'blur(90px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -180,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'rgba(255,184,96,.10)',
            filter: 'blur(90px)',
          }}
        />

        {/* Top Zone */}
<div
  style={{
    height: 90,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    zIndex: 2,
    flexShrink: 0,
  }}
>
          <img
            src="/eggpuff.favicon.png"
            width={40}
            height={40}
            alt=""
          />

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            EggPuff
          </div>
        </div>

       {/* Middle Hero Zone */}
<div
  style={{
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  }}
>
  <div
    style={{
      width: '100%',
      maxWidth: 940,
      height: 340,
      background: '#FFFFFF',
      borderRadius: 34,
      border: '1px solid rgba(15,23,42,.05)',
      boxShadow: '0 18px 48px rgba(15,23,42,.08)',
      padding: '44px 52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: '100%',
        textAlign: 'left',
        fontSize,
        lineHeight: 1.18,
        fontWeight: 800,
        color: '#0F172A',
        letterSpacing: '-2px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {displayQuestion}
    </div>
  </div>
</div>

{/* Bottom Zone */}
<div
  style={{
    flexShrink: 0,
    paddingTop: 12,
    zIndex: 2,
  }}
>

        {/* Author */}
        <div
          style={{
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Asked by
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 38,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            {creator}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 26,
              color: '#64748B',
            }}
          >
            @{username}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            gap: 36,
            color: '#475569',
            fontSize: 28,
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          <div>❤️ {helpfulCount}</div>

          <div>
            💬{' '}
            {answersCount > 0
              ? `${answersCount} Answers`
              : 'Be the first to answer'}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer Divider */}
        <div
          style={{
            height: 1,
            background: '#E5E7EB',
            marginBottom: 26,
            zIndex: 2,
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#94A3B8',
              fontWeight: 700,
            }}
          >
            eggpuff.in
          </div>

          <div
            style={{
              fontSize: 24,
              color: '#94A3B8',
              fontWeight: 700,
            }}
          >
            Ask. Answer. Connect.
          </div>
        </div>
        </div>
      </div>
    )
  }
)

QuestionShareCard.displayName =
  'QuestionShareCard'

export default QuestionShareCard