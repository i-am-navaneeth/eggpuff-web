'use client'

type Props = {
  question: string
  creator: string
  username: string
  helpfulCount: number
  answersCount: number
}

export default function StoryShareCard({
  question,
  creator,
  username,
  helpfulCount,
  answersCount,
}: Props) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,

        background:
          'linear-gradient(180deg,#FFFFFF 0%,#FFFDF9 100%)',

        position: 'relative',

        overflow: 'hidden',

        fontFamily:
          'Inter, system-ui, sans-serif',

        display: 'flex',
        flexDirection: 'column',

        padding: 80,

        boxSizing: 'border-box',
      }}
    >
      {/* LOGO */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <img
          src="/eggpuff.favicon.png"
          width={42}
          height={42}
          alt=""
        />

        <span
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          EggPuff
        </span>
      </div>

      {/* CENTER */}

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

            background: '#FFFFFF',

            borderRadius: 42,

            padding: 60,

            boxShadow:
              '0 20px 60px rgba(0,0,0,0.08)',

            border:
              '1px solid rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              fontSize: 74,

              lineHeight: 1.25,

              fontWeight: 800,

              color: '#0F172A',

              letterSpacing: '-2px',
            }}
          >
            {question.length > 140
              ? question.slice(0, 140) + '...'
              : question}
          </div>
        </div>
      </div>

      {/* USER */}

      <div>
        <div
          style={{
            fontSize: 22,
            color: '#64748B',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Asked by
        </div>

        <div
          style={{
            marginTop: 12,

            fontSize: 50,

            fontWeight: 700,

            color: '#111827',
          }}
        >
          {creator}
        </div>

        <div
          style={{
            marginTop: 8,

            fontSize: 32,

            color: '#64748B',
          }}
        >
          @{username}
        </div>

        <div
          style={{
            marginTop: 24,

            fontSize: 34,

            color: '#475569',

            fontWeight: 600,
          }}
        >
          {answersCount > 0
            ? `💬 ${answersCount} Answers`
            : '💬 Be the first to answer'}
        </div>
      </div>

      {/* FOOTER */}

      <div
        style={{
          marginTop: 60,

          display: 'flex',

          justifyContent:
            'space-between',

          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 26,

            color: '#94A3B8',

            fontWeight: 700,
          }}
        >
          eggpuff.in
        </div>

        <div
          style={{
            fontSize: 26,

            color: '#94A3B8',

            fontWeight: 700,
          }}
        >
          Ask. Answer. Connect.
        </div>
      </div>

      {/* GLOWS */}

      <div
        style={{
          position: 'absolute',

          top: -180,

          right: -180,

          width: 500,

          height: 500,

          borderRadius: '50%',

          background:
            'rgba(255,190,92,0.12)',

          filter: 'blur(100px)',
        }}
      />

      <div
        style={{
          position: 'absolute',

          bottom: -180,

          left: -180,

          width: 500,

          height: 500,

          borderRadius: '50%',

          background:
            'rgba(255,190,92,0.10)',

          filter: 'blur(100px)',
        }}
      />
    </div>
  )
}