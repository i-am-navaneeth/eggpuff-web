'use client'

type Props = {
  link: string
}

function detectPlatform(link: string) {
  const url = link.toLowerCase()

  if (url.includes('instagram.com')) {
    return { icon: '📸', label: 'Instagram' }
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { icon: '▶️', label: 'YouTube' }
  }

  if (url.includes('twitter.com') || url.includes('x.com')) {
    return { icon: '𝕏', label: 'X (Twitter)' }
  }

  return { icon: '🔗', label: 'External profile' }
}

export default function PromoteBanner({ link }: Props) {
  const platform = detectPlatform(link)

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 18,
          background: '#FFF5EE',
          border: '1px solid #FED7AA',
          textAlign: 'center',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          ✨ Promoted
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              fontSize: 11,
              background: '#FFE0B2',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Beta
          </span>
        </div>

        {/* PLATFORM */}
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            opacity: 0.9,
          }}
        >
          <span style={{ fontSize: 18 }}>{platform.icon}</span>
          <span>{platform.label}</span>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            fontWeight: 500,
            color: '#B45309',
          }}
        >
          Tap to view profile →
        </div>

        {/* SAFETY NOTE */}
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            opacity: 0.55,
            lineHeight: 1.4,
          }}
        >
          This content is hosted outside EggPuff.
          <br />
          View responsibly.
        </div>
      </div>
    </a>
  )
}
