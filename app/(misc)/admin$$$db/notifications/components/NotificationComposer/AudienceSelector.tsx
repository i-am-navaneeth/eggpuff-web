'use client'

type Audience =
  | 'everyone'
  | 'college'
  | 'community'
  | 'users'

type Props = {
  value: Audience
  onChange: (value: Audience) => void
  disabled?: boolean
}

const options = [
  {
    id: 'everyone',
    label: 'Everyone',
    description: 'All EggPuff users',
    emoji: '🌎',
    enabled: true,
  },
  {
    id: 'college',
    label: 'College',
    description: 'Specific college',
    emoji: '🎓',
    enabled: false,
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Specific community',
    emoji: '👥',
    enabled: false,
  },
  {
    id: 'users',
    label: 'Selected Users',
    description: 'Choose individual users',
    emoji: '✨',
    enabled: false,
  },
] as const

export default function AudienceSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#111827',
          }}
        >
          Audience
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          Choose who should receive this notification.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {options.map((option) => {
          const selected =
            value === option.id

          const unavailable =
            !option.enabled

          return (
            <button
              key={option.id}
              type="button"
              disabled={
                disabled ||
                unavailable
              }
              onClick={() =>
                onChange(
                  option.id as Audience
                )
              }
              style={{
                width: '100%',

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'space-between',

                padding: '15px 18px',

                borderRadius: 16,

                border: selected
                  ? '2px solid #F4B860'
                  : '1px solid #E5E7EB',

                background: selected
                  ? '#FFF8EC'
                  : '#FFFFFF',

                cursor:
                  unavailable ||
                  disabled
                    ? 'not-allowed'
                    : 'pointer',

                opacity: unavailable
                  ? 0.55
                  : 1,

                transition:
                  'all .18s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,

                    borderRadius: 12,

                    background:
                      '#F9FAFB',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent:
                      'center',

                    fontSize: 22,
                  }}
                >
                  {option.emoji}
                </div>

                <div
                  style={{
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#111827',
                    }}
                  >
                    {option.label}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 13,
                      color: '#6B7280',
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              </div>

              {option.enabled ? (
                <div
                  style={{
                    width: 22,
                    height: 22,

                    borderRadius: '50%',

                    border: selected
                      ? '6px solid #F4B860'
                      : '2px solid #D1D5DB',

                    transition:
                      '.18s ease',
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6B7280',
                    padding:
                      '5px 9px',
                    borderRadius: 999,
                    background:
                      '#F3F4F6',
                  }}
                >
                  Soon
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}