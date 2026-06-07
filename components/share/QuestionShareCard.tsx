'use client'

import React, {
forwardRef,
} from 'react'

type Props = {
question: string
creator: string
username: string
helpfulCount: number
answersCount: number
}

const QuestionShareCard =
forwardRef<
HTMLDivElement,
Props

> (
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
 return (
 <div
 ref={ref}
 style={{
 width: 1080,
height: 1080,


        background:
          'linear-gradient(180deg,#FFFFFF 0%,#FFFDF9 100%)',

        display: 'flex',

        flexDirection:
          'column',

        padding: 70,

        borderRadius: 40,

        boxSizing:
          'border-box',

        fontFamily:
          'Inter, system-ui, sans-serif',

        position:
          'relative',

        overflow:
          'hidden',
      }}
    >
      {/* BRAND */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
        }}
      >
        <img
          src="/eggpuff.favicon.png"
          alt="EggPuff"
          width={40}
          height={40}
        />

        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          EggPuff
        </span>
      </div>

      {/* FLOATING QUESTION CARD */}
      <div
        style={{
          flex: 1,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',

            background:
              'rgba(255,255,255,0.88)',

            backdropFilter:
              'blur(10px)',

            border:
              '1px solid rgba(15,23,42,0.06)',

            borderRadius: 36,

            padding:
              '60px 56px',

            boxShadow:
              '0 20px 60px rgba(15,23,42,0.10)',
          }}
        >
          <div
            style={{
              fontSize: 68,

              lineHeight: 1.22,

              fontWeight: 800,

              color: '#0F172A',

              letterSpacing:
                '-1.8px',

              wordBreak:
                'break-word',

              whiteSpace:
                'pre-wrap',
            }}
          >
            {
              question.length > 180
                ? question.slice(0, 180) + '...'
                : question
            }
          </div>
        </div>
      </div>

      {/* CREATOR */}
      <div
        style={{
          marginTop: 34,
        }}
      >
        <div
          style={{
            fontSize: 18,

            color: '#64748B',

            fontWeight: 700,

            marginBottom: 8,

            textTransform:
              'uppercase',

            letterSpacing:
              '1px',
          }}
        >
          Asked by
        </div>

        <div
          style={{
            fontSize: 38,

            fontWeight: 700,

            color: '#111827',
          }}
        >
          {creator}
        </div>

        <div
          style={{
            marginTop: 6,

            fontSize: 26,

            color: '#64748B',
          }}
        >
          @{username}
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: 'flex',

          gap: 24,

          alignItems: 'center',

          marginTop: 22,
        }}
      >
        {helpfulCount > 0 && (
          <div
            style={{
              fontSize: 28,

              color: '#475569',

              fontWeight: 600,
            }}
          >
            ❤️ {helpfulCount}
          </div>
        )}

        {answersCount > 0 ? (
          <div
            style={{
              fontSize: 28,

              color: '#475569',

              fontWeight: 600,
            }}
          >
            💬 {answersCount} Answers
          </div>
        ) : (
          <div
            style={{
              fontSize: 28,

              color: '#475569',

              fontWeight: 600,
            }}
          >
            💬 Be the first to answer
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 30,

          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'center',
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

      {/* TOP RIGHT GLOW */}
      <div
        style={{
          position: 'absolute',

          top: -140,

          right: -140,

          width: 420,

          height: 420,

          borderRadius: '50%',

          background:
            'rgba(255,190,92,0.12)',

          filter:
            'blur(90px)',
        }}
      />

      {/* BOTTOM LEFT GLOW */}
      <div
        style={{
          position: 'absolute',

          bottom: -140,

          left: -140,

          width: 420,

          height: 420,

          borderRadius: '50%',

          background:
            'rgba(255,190,92,0.10)',

          filter:
            'blur(90px)',
        }}
      />
    </div>
  )
}

)

QuestionShareCard.displayName =
'QuestionShareCard'

export default QuestionShareCard
