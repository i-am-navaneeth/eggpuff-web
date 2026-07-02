'use client'

type Props = {
  current: number
  max: number

  warningAt?: number

  align?: 'left' | 'right'

  showRemaining?: boolean
}

export default function CharacterCounter({
  current,
  max,
  warningAt = 0.8,
  align = 'right',
  showRemaining = false,
}: Props) {
  const ratio = current / max

  const color =
    ratio >= 1
      ? '#DC2626'
      : ratio >= warningAt
      ? '#D97706'
      : '#6B7280'

  const remaining = max - current

  return (
    <div
      style={{
        display: 'flex',
        justifyContent:
          align === 'left'
            ? 'flex-start'
            : 'flex-end',

        alignItems: 'center',

        marginTop: 6,

        fontSize: 12,

        fontWeight: 600,

        color,
      }}
    >
      {showRemaining ? (
        <span>
          {remaining >= 0
            ? `${remaining} remaining`
            : `${Math.abs(
                remaining
              )} over limit`}
        </span>
      ) : (
        <span>
          {current}/{max}
        </span>
      )}
    </div>
  )
}