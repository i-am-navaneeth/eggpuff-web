export default function QuestionCardSkeleton() {
  const Line = ({
    width,
    height = 14,
  }: {
    width: string | number
    height?: number
  }) => (
    <div
      style={{
        width,
        height,
        borderRadius: 999,
        background:
          'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-loading 1.4s ease infinite',
      }}
    />
  )

  return (
    <div
      style={{
        padding: '14px 0 0',
      }}
    >
      {/* QUESTION USER HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            flexShrink: 0,
            background:
              'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)',
            backgroundSize: '400% 100%',
            animation: 'skeleton-loading 1.4s ease infinite',
          }}
        />

        {/* Name + username */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Line width={135} height={15} />
          <Line width={95} height={13} />
        </div>

        {/* More options intentionally empty */}
      </div>

      {/* QUESTION TEXT */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
          marginBottom: 12,
        }}
      >
        <Line width="78%" height={16} />
        <Line width="58%" height={16} />
      </div>

      {/* INVISIBLE ACTION BAR SPACE
          Kept intentionally small so the
          divider sits naturally below the text. */}
      <div
        style={{
          height: 24,
          marginBottom: 8,
        }}
      />

      {/* DIVIDER */}
      <div
        style={{
          height: 1,
          background: '#E5E7EB',
        }}
      />

      <style jsx>{`
        @keyframes skeleton-loading {
          0% {
            background-position: 100% 0;
          }

          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  )
}