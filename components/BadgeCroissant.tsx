type Props = {
  value: 0.5 | 1
}

export default function BadgeCroissant({ value }: Props) {
  return (
    <div
      style={{
        fontSize: '28px',
        position: 'relative',
        width: '32px',
        height: '32px',
      }}
    >
      {/* Base outline */}
      <span style={{ opacity: 0.25 }}>🥐</span>

      {/* Fill */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: value === 1 ? '100%' : '50%',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
        }}
      >
        🥐
      </span>
    </div>
  )
}
