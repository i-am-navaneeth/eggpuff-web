'use client'

import {
  Activity,
  MousePointerClick,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

type Props = {
  spotlight: any
}

export default function AnalyticsStatGrid({
  spotlight,
}: Props) {
  const visits = spotlight?.click_count ?? 0

  const discoveries =
    spotlight?.discoveries_delivered ?? 0

  const rewards = discoveries

  const discoveryRate =
    visits > 0
      ? Math.round(
          (discoveries / visits) * 100
        )
      : 0

  const stats = [
    {
      title: 'Visits',
      value: visits,
      icon: (
        <MousePointerClick
          size={18}
          color="#2563EB"
        />
      ),
    },
    {
      title: 'Discoveries',
      value: discoveries,
      icon: (
        <Sparkles
          size={18}
          color="#16A34A"
        />
      ),
    },
    {
      title: 'EP Earned',
      value: rewards,
      icon: (
        <Activity
          size={18}
          color="#D97706"
        />
      ),
    },
    {
      title: 'Discovery Rate',
      value: `${discoveryRate}%`,
      icon: (
        <TrendingUp
          size={18}
          color="#9333EA"
        />
      ),
    },
  ]

  return (
    <section>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2,minmax(0,1fr))',
          gap: 14,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.title}
            style={{
              background: '#fff',
              border: '1px solid #ECECEC',
              borderRadius: 18,
              padding: 18,
              transition: 'all .2s ease',
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
              {stat.icon}

              <span
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                  fontWeight: 500,
                }}
              >
                {stat.title}
              </span>
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}