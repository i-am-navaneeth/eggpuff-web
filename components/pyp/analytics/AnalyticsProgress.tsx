'use client'

import { TrendingUp } from 'lucide-react'

type Props = {
  spotlight: any
}

export default function AnalyticsProgress({
  spotlight,
}: Props) {
  const visits = spotlight?.click_count ?? 0

  const discoveries =
    spotlight?.discoveries_delivered ?? 0

  const discoveryRate =
    visits > 0
      ? Math.round(
          (discoveries / visits) * 100
        )
      : 0

  const health =
    discoveryRate >= 85
      ? 100
      : Math.round(
          (discoveryRate / 85) * 100
        )

  const metrics = [
    {
      label: 'Discovery Rate',
      value: discoveryRate,
      suffix: '%',
      color:
        'linear-gradient(90deg,#22C55E,#16A34A)',
      description:
        'Visitors who explored your profile.',
    },
    {
      label: 'Spotlight Health',
      value: health,
      suffix: '%',
      color:
        'linear-gradient(90deg,#F4B860,#E9A73E)',
      description:
        health >= 90
          ? 'Excellent'
          : health >= 70
          ? 'Good'
          : 'Needs Improvement',
    },
  ]

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 18,
        }}
      >
        <TrendingUp
          size={20}
          color="#16A34A"
        />

        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          Performance
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 22,
        }}
      >
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                {metric.label}
              </span>

              <strong>
                {metric.value}
                {metric.suffix}
              </strong>
            </div>

            <div
              style={{
                height: 12,
                borderRadius: 999,
                background: '#F3F4F6',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    metric.value,
                    100
                  )}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: metric.color,
                  transition:
                    'width .4s ease',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: '#6B7280',
              }}
            >
              {metric.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}