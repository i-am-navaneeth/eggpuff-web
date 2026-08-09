'use client'

import type { MatchDraft } from '../CreateMatch'

type Props = {
  draft: MatchDraft
  updateDraft: (
    values: Partial<MatchDraft>
  ) => void
}

const ACTIVITIES = [
  {
    icon: '📚',
    value: 'Study',
  },
  {
    icon: '👨‍💻',
    value: 'Project',
  },
  {
    icon: '💼',
    value: 'Placement Prep',
  },
  {
    icon: '🎤',
    value: 'Interview Practice',
  },
  {
    icon: '🧠',
    value: 'Peer Tutoring',
  },
  {
    icon: '🎮',
    value: 'Gaming',
  },
  {
    icon: '🏆',
    value: 'Hackathon',
  },
  {
    icon: '🏏',
    value: 'Sports',
  },
  {
    icon: '🚀',
    value: 'Startup',
  },
  {
    icon: '🎉',
    value: 'Event',
  },
  {
    icon: '✨',
    value: 'Other',
  },
]

export default function StepBasics({
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
      {/* Activity */}

      <section>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          What do you need people for?
        </div>

        <div
          style={{
            color: '#6B7280',
            marginBottom: 18,
          }}
        >
          Choose the activity that best
          matches your Campus Match.
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(150px,1fr))',
            gap: 12,
          }}
        >
          {ACTIVITIES.map((activity) => {
            const selected =
              draft.activity === activity.value

            return (
              <button
                key={activity.value}
                type="button"
                onClick={() =>
                  updateDraft({
                    activity:
                      activity.value,
                  })
                }
                style={{
                  padding: '16px',
                  borderRadius: 18,
                  border: selected
                    ? '2px solid #F4B860'
                    : '1px solid #E5E7EB',
                  background: selected
                    ? '#FFF8EB'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  transition: '.2s',
                }}
              >
                <div
                  style={{
                    fontSize: 30,
                    marginBottom: 10,
                  }}
                >
                  {activity.icon}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color: '#111827',
                  }}
                >
                  {activity.value}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Title */}

      <section>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Give your Match a title
        </div>

        <div
          style={{
            color: '#6B7280',
            marginBottom: 16,
          }}
        >
          Keep it short and clear.
        </div>

        <input
          value={draft.title}
          onChange={(e) =>
            updateDraft({
              title:
                e.target.value,
            })
          }
          placeholder="Need one study partner for Operating Systems..."
          maxLength={100}
          style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 16,
            border:
              '1px solid #E5E7EB',
            fontSize: 16,
            outline: 'none',
          }}
        />

        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: '#9CA3AF',
            textAlign: 'right',
          }}
        >
          {draft.title.length}/100
        </div>
      </section>

      {/* Description */}

      <section>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Tell others more
        </div>

        <div
          style={{
            color: '#6B7280',
            marginBottom: 16,
          }}
        >
          Explain what you're looking
          for, expectations, or any
          important details.
        </div>

        <textarea
          value={draft.description}
          onChange={(e) =>
            updateDraft({
              description:
                e.target.value,
            })
          }
          placeholder="Need someone preparing for tomorrow's exam..."
          rows={6}
          maxLength={500}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '16px 18px',
            borderRadius: 16,
            border:
              '1px solid #E5E7EB',
            fontSize: 15,
            outline: 'none',
            lineHeight: 1.6,
          }}
        />

        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: '#9CA3AF',
            textAlign: 'right',
          }}
        >
          {draft.description.length}/500
        </div>
      </section>
    </div>
  )
}