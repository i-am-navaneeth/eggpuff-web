'use client'

type Props = {
  url?: string | null
  title?: string | null
  description?: string | null
  image?: string | null
  domain?: string | null
  type?: string | null
}

export default function LinkPreviewCard({
  url,
  title,
  description,
  image,
  domain,
  type,
}: Props) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'block',
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        background: '#fff',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* IMAGE */}
      {image && (
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            background: '#F3F4F6',
          }}
        >
          <img
  src={image}
  alt={title || 'Preview'}
  loading="lazy"
  decoding="async"
  referrerPolicy="no-referrer"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',

    background: '#F3F4F6',
  }}
/>
        </div>
      )}

      {/* CONTENT */}
      <div
        style={{
          padding: 12,
        }}
      >
        {/* DOMAIN + TYPE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'capitalize',
          }}
        >
          <span>
            {type || 'website'}
          </span>

          <span>•</span>

          <span>
            {domain}
          </span>
        </div>

        {/* TITLE */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#111827',
            marginBottom: description
              ? 6
              : 0,

            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title || url}
        </div>

        {/* DESCRIPTION */}
        {description && (
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#6B7280',

              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </a>
  )
}