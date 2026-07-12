import Skeleton from '@/components/Skeleton'

export default function LoadingAsk() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        background: '#fff',
        minHeight: '100vh',
      }}
    >
      {/* Header */}

      <div
        style={{
          position: 'sticky',
          top: 0,

          background: '#fff',

          borderBottom: '1px solid #F3F4F6',

          padding: '14px 18px',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Skeleton
          width={22}
          height={22}
          radius={999}
        />

        <Skeleton
          width={150}
          height={24}
          radius={8}
        />

        <div style={{ width: 22 }} />
      </div>

      {/* Body */}

      <div
        style={{
          padding: '22px 18px 170px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          {/* Avatar */}

          <Skeleton
            width={48}
            height={48}
            radius={999}
          />

          <div style={{ flex: 1 }}>
            {/* Username + Category */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Skeleton
                width={82}
                height={18}
                radius={8}
              />

              <Skeleton
                width={86}
                height={30}
                radius={999}
              />
            </div>

            {/* Composer */}

            <div
              style={{
                marginTop: 22,
              }}
            >
              <Skeleton
                width="92%"
                height={20}
                radius={8}
              />

              <div style={{ marginTop: 14 }}>
                <Skeleton
                  width="76%"
                  height={20}
                  radius={8}
                />
              </div>

              <div style={{ marginTop: 14 }}>
                <Skeleton
                  width="58%"
                  height={20}
                  radius={8}
                />
              </div>
            </div>

            {/* Resource */}

            <div
              style={{
                marginTop: 26,
              }}
            >
              <Skeleton
                width={42}
                height={42}
                radius={14}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}

      <div
        style={{
          position: 'fixed',

          left: 0,
          right: 0,
          bottom: 0,

          background: '#fff',

          borderTop: '1px solid #F3F4F6',

          padding: '12px 18px calc(env(safe-area-inset-bottom) + 12px)',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',

            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton
            width={66}
            height={36}
            radius={999}
          />

          <Skeleton
            width={84}
            height={44}
            radius={999}
          />
        </div>
      </div>
    </div>
  )
}