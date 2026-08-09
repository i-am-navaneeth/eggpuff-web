'use client'

import type { MatchDraft } from '../CreateMatch'

type Props = {
  draft: MatchDraft
  updateDraft: (
    values: Partial<MatchDraft>
  ) => void
}

const PEOPLE_OPTIONS = [
  1,
  2,
  3,
  4,
  5,
]

const WHEN_OPTIONS = [
  'now',
  'today',
  'tomorrow',
  'custom',
] as const

const DURATION_OPTIONS = [
  '30 mins',
  '1 hour',
  '2 hours',
  'custom',
] as const

const MODE_OPTIONS = [
  'online',
  'offline',
  'hybrid',
] as const

export default function StepDetails({
  draft,
  updateDraft,
}: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 28,
      }}
    >
      {/* People Needed */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          People Needed
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {PEOPLE_OPTIONS.map((item) => {
            const active =
  draft.peopleNeeded === item

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  updateDraft({
  peopleNeeded: item,
})
                }
                style={{
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: active
                    ? '2px solid #F4B860'
                    : '1px solid #E5E7EB',
                  background: active
                    ? '#FFF8EB'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>
      </section>

      {/* When */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          When?
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {WHEN_OPTIONS.map((item) => {
            const active =
              draft.when === item

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  updateDraft({
                    when: item,
                  })
                }
                style={{
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: active
                    ? '2px solid #F4B860'
                    : '1px solid #E5E7EB',
                  background: active
                    ? '#FFF8EB'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>

        {draft.when === 'custom' && (
          <input
  type="datetime-local"
  value={draft.customDate ?? ''}
  onChange={(e) =>
    updateDraft({
      customDate: e.target.value,
    })
  }
            style={{
              marginTop: 16,
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border:
                '1px solid #E5E7EB',
            }}
          />
        )}
      </section>

      {/* Duration */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Duration
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {DURATION_OPTIONS.map(
            (item) => {
              const active =
                draft.duration ===
                item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    updateDraft({
                      duration:
                        item,
                    })
                  }
                  style={{
                    padding:
                      '12px 18px',
                    borderRadius:
                      999,
                    border: active
                      ? '2px solid #F4B860'
                      : '1px solid #E5E7EB',
                    background:
                      active
                        ? '#FFF8EB'
                        : '#FFFFFF',
                    cursor:
                      'pointer',
                    fontWeight:
                      600,
                  }}
                >
                  {item}
                </button>
              )
            }
          )}
        </div>

        {draft.duration ===
  'custom' && (
          <input
  value={draft.customDuration ?? ''}
  onChange={(e) =>
    updateDraft({
      customDuration:
        e.target.value,
    })
  }
            placeholder="Example: 3 hours"
            style={{
              marginTop: 16,
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border:
                '1px solid #E5E7EB',
            }}
          />
        )}
      </section>

      {/* Mode */}

      <section>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Mode
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {MODE_OPTIONS.map((item) => {
            const active =
  draft.mode === item

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  updateDraft({
                    mode: item,
                  })
                }
                style={{
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: active
                    ? '2px solid #F4B860'
                    : '1px solid #E5E7EB',
                  background: active
                    ? '#FFF8EB'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {item}
              </button>
            )
          })}
        </div>
      </section>

      {(draft.mode === 'offline' ||
 draft.mode === 'hybrid') && (
        <section>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Location
          </h2>

          <input
            value={draft.location ?? ''}
            onChange={(e) =>
              updateDraft({
                location:
                  e.target.value,
              })
            }
            placeholder="Library, Classroom, Ground..."
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border:
                '1px solid #E5E7EB',
            }}
          />
        </section>
      )}
    </div>
  )
}