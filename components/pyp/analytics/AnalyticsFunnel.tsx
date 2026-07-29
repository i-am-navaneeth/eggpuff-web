'use client'

import { ChevronDown } from 'lucide-react'

type Props = {
  spotlight: any
}

export default function AnalyticsFunnel({
  spotlight,
}: Props) {
  const visits = spotlight?.click_count ?? 0

  const discoveries =
    spotlight?.discoveries_delivered ?? 0

  const rewards = discoveries

  const stages = [
    {
      label: 'Visits',
      value: visits,
      color: '#F4B860',
    },
    {
      label: 'Discoveries',
      value: discoveries,
      color: '#34D399',
    },
    {
      label: 'Rewards',
      value: rewards,
      color: '#8B5CF6',
    },
  ]

  const max = Math.max(
    ...stages.map((s) => s.value),
    1
  )

  return (
    <section>
      <h3
        style={{
          margin: 0,
          marginBottom: 18,
          fontSize: 18,
          fontWeight: 700,
          color: '#111827',
        }}
      >
        Performance Funnel
      </h3>

      <div
        style={{
          display: 'grid',
          gap: 10,
        }}
      >
        {stages.map((stage, index) => {
          const width = Math.max(
            25,
            (stage.value / max) * 100
          )

          return (
            <div key={stage.label}>
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
                  {stage.label}
                </span>

                <strong>
                  {stage.value}
                </strong>
              </div>

              <div
                style={{
                  height: 18,
                  borderRadius: 999,
                  background: '#F3F4F6',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: stage.color,
                    transition:
                      'width .35s ease',
                  }}
                />
              </div>

              {index <
                stages.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'center',
                    margin: '8px 0',
                    color: '#9CA3AF',
                  }}
                >
                  <ChevronDown
                    size={18}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}