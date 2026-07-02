'use client'

function CardSkeleton() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECEC',
        borderRadius: 20,
        padding: 20,
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',
      }}
    >
      <Skeleton width="45%" height={22} />

      <div style={{ height: 18 }} />

      <Skeleton width="100%" height={16} />

      <div style={{ height: 12 }} />

      <Skeleton width="82%" height={16} />

      <div style={{ height: 24 }} />

      <Skeleton width="100%" height={46} />

      <div style={{ height: 12 }} />

      <Skeleton width="100%" height={120} />

      <div style={{ height: 24 }} />

      <Skeleton width="100%" height={46} />
    </div>
  )
}

function StatSkeleton() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECEC',
        borderRadius: 20,
        padding: 20,
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',
      }}
    >
      <Skeleton width="45%" height={14} />

      <div style={{ height: 14 }} />

      <Skeleton width="40%" height={36} />
    </div>
  )
}

function SideCardSkeleton() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECEC',
        borderRadius: 20,
        padding: 18,
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',
      }}
    >
      <Skeleton width="55%" height={18} />

      <div style={{ height: 18 }} />

      <Skeleton width="100%" height={16} />

      <div style={{ height: 10 }} />

      <Skeleton width="85%" height={16} />

      <div style={{ height: 10 }} />

      <Skeleton width="60%" height={16} />
    </div>
  )
}

function Skeleton({
  width,
  height,
}: {
  width: string | number
  height: number
}) {
  return (
    <>
      <div
        style={{
          width,
          height,
          borderRadius: 8,
          background:
            'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 37%,#F3F4F6 63%)',
          backgroundSize: '400% 100%',
          animation:
            'ep-admin-skeleton 1.4s ease infinite',
        }}
      />

      <style jsx global>{`
        @keyframes ep-admin-skeleton {
          0% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </>
  )
}

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F5',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 20px 80px',
        }}
      >
        {/* Header */}
        <Skeleton
          width={320}
          height={36}
        />

        <div style={{ height: 10 }} />

        <Skeleton
          width={260}
          height={18}
        />

        <div style={{ height: 28 }} />

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap: 18,
            marginBottom: 24,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <StatSkeleton key={i} />
          ))}
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <CardSkeleton />

            <CardSkeleton />
          </div>

          {/* Right */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <SideCardSkeleton />

            <SideCardSkeleton />

            <SideCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}