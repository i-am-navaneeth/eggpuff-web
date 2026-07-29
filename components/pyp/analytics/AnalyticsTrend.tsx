'use client'

import { TrendingUp } from 'lucide-react'

type Props = {
  spotlight: any
}

export default function AnalyticsTrend({
  spotlight,
}: Props) {
  const discoveries =
    spotlight?.discoveries_delivered ?? 0

  // Temporary demo data.
  // Replace with Supabase daily analytics later.
  const trend = [
    Math.max(1, discoveries - 8),
    Math.max(2, discoveries - 6),
    Math.max(3, discoveries - 5),
    Math.max(4, discoveries - 3),
    Math.max(5, discoveries - 2),
    Math.max(6, discoveries - 1),
    discoveries,
  ]

  const labels = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ]

  const max = Math.max(...trend, 1)

  const total = trend.reduce(
    (a, b) => a + b,
    0
  )

  const best = Math.max(...trend)

  const bestDay =
    labels[trend.indexOf(best)]

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              7-Day Trend
            </h3>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Daily discoveries
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {total}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            This Week
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          height: 180,
        }}
      >
        {trend.map((value, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection:
                'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight:
                  index === trend.length - 1
                    ? 700
                    : 500,
                marginBottom: 8,
                color:
                  index === trend.length - 1
                    ? '#111827'
                    : '#6B7280',
              }}
            >
              {value}
            </div>

            <div
              style={{
                width: '100%',
                height: `${
                  (value / max) * 130
                }px`,
                borderRadius:
                  '14px 14px 6px 6px',
                background:
                  index === trend.length - 1
                    ? 'linear-gradient(180deg,#F4B860,#E9A73E)'
                    : '#F4D8A5',
                transition:
                  'height .35s ease',
              }}
            />

            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color:
                  index === trend.length - 1
                    ? '#111827'
                    : '#6B7280',
                fontWeight:
                  index === trend.length - 1
                    ? 700
                    : 500,
              }}
            >
              {labels[index]}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 16,
          background: '#F9FAFB',
          border: '1px solid #ECECEC',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            Best Day
          </div>

          <div
            style={{
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {bestDay}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            Peak Discoveries
          </div>

          <div
            style={{
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {best}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            Weekly Total
          </div>

          <div
            style={{
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {total}
          </div>
        </div>
      </div>
    </section>
  )
}