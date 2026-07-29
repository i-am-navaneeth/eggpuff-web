'use client'

import {
  CalendarDays,
  MousePointerClick,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

type Props = {
  spotlight: any
}

export default function SpotlightAnalytics({
  spotlight,
}: Props) {
  const visits = spotlight?.click_count ?? 0
  const discoveries =
    spotlight?.discoveries_delivered ?? 0

  const startedAt = new Date(
  spotlight?.started_at
)

const liveDays = Math.max(
  1,
  Math.floor(
    (Date.now() - startedAt.getTime()) /
      (1000 * 60 * 60 * 24)
  )
)

const rewardCount = discoveries

  const discoveryRate =
    visits > 0
      ? Math.round(
          (discoveries / visits) * 100
        )
      : 0

  const funnelMax = Math.max(
  visits,
  discoveries,
  rewardCount,
  1
)

  const trend = [4, 7, 5, 9, 8, 12, discoveries]

  return (
    <div
      style={{
        marginTop: 20,
        display: 'grid',
        gap: 24,
      }}
    >
      {/* ========================= */}
      {/* KPI GRID */}
      {/* ========================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2,minmax(0,1fr))',
          gap: 14,
        }}
      >
        {[
          {
            icon: (
              <MousePointerClick
                size={18}
                color="#2563EB"
              />
            ),
            title: 'Visits',
            value: visits,
          },
          {
            icon: (
              <Sparkles
                size={18}
                color="#16A34A"
              />
            ),
            title: 'Discoveries',
            value: discoveries,
          },
          {
  icon: (
    <CalendarDays
      size={18}
      color="#D97706"
    />
  ),
  title: 'Live For',
  value: `${liveDays} ${
    liveDays === 1 ? 'Day' : 'Days'
  }`,
},
          {
            icon: (
              <TrendingUp
                size={18}
                color="#9333EA"
              />
            ),
            title: 'Discovery Rate',
            value: `${discoveryRate}%`,
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              border: '1px solid #ECECEC',
              borderRadius: 18,
              padding: 18,
              background: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
              }}
            >
              {card.icon}

              <div
                style={{
                  color: '#6B7280',
                  fontSize: 13,
                }}
              >
                {card.title}
              </div>
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#111827',
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* PERFORMANCE FUNNEL */}
      {/* ========================= */}

      <section>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 16,
          }}
        >
          Performance Funnel
        </div>

        {[
          {
            label: 'Visits',
            value: visits,
          },
          {
            label: 'Discoveries',
            value: discoveries,
          },
          {
            label: 'Rewards',
            value: rewardCount,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: 8,
              }}
            >
              <span>{item.label}</span>

              <strong>{item.value}</strong>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: '#F3F4F6',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${
                    (item.value /
                      funnelMax) *
                    100
                  }%`,
                  height: '100%',
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg,#F4B860,#F7D58B)',
                }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* ========================= */}
      {/* DISCOVERY RATE */}
      {/* ========================= */}

      <section>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 14,
          }}
        >
          Discovery Rate
        </div>

        <div
          style={{
            height: 14,
            background: '#F3F4F6',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${discoveryRate}%`,
              height: '100%',
              background:
                'linear-gradient(90deg,#22C55E,#16A34A)',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 10,
            color: '#6B7280',
            fontSize: 14,
          }}
        >
          {discoveryRate}% of visitors
          explored your profile.
        </div>
      </section>

      {/* ========================= */}
      {/* DETAILS */}
      {/* ========================= */}

      <section
        style={{
          borderTop:
            '1px solid #ECECEC',
          paddingTop: 20,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          Category
        </div>

        <div
          style={{
            marginTop: 4,
            fontWeight: 700,
          }}
        >
          {spotlight.category}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          Caption
        </div>

        <div
          style={{
            marginTop: 4,
            lineHeight: 1.7,
          }}
        >
          {spotlight.caption}
        </div>
      </section>
    </div>
  )
}