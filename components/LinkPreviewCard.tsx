'use client'

import { useRouter } from 'next/navigation'

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

  const router = useRouter()

  return (
  <div
    onClick={(e) => {

  e.stopPropagation()

  const encodedUrl =
    encodeURIComponent(url)

  const encodedDomain =
    encodeURIComponent(
      domain || 'Website'
    )

  router.push(
    `/browser?url=${encodedUrl}&domain=${encodedDomain}`,
    {
      scroll: false,
    }
  )
}}
    style={{
      display: 'block',

      marginTop: 14,

      borderRadius: 18,

      overflow: 'hidden',

      border:
        '1px solid rgba(15, 20, 25, 0.12)',

      background: '#fff',

      textDecoration: 'none',

      color: 'inherit',

      cursor: 'pointer',

      transition:
        'transform 0.14s ease, background 0.14s ease',

      WebkitTapHighlightColor:
        'transparent',
    }}
    onTouchStart={(e) => {
      e.currentTarget.style.transform =
        'scale(0.985)'

      e.currentTarget.style.background =
        '#FAFAFA'
    }}
    onTouchEnd={(e) => {
      e.currentTarget.style.transform =
        'scale(1)'

      e.currentTarget.style.background =
        '#fff'
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

          borderBottom:
            '1px solid rgba(15,20,25,0.06)',
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
        padding: '12px 14px 13px',
      }}
    >
      {/* DOMAIN + TYPE */}
      <div
        style={{
          display: 'flex',

          alignItems: 'center',

          gap: 6,

          marginBottom: 7,

          fontSize: 11.5,

          fontWeight: 600,

          color: '#6B7280',

          textTransform: 'capitalize',

          letterSpacing: '-0.1px',
        }}
      >
        <span>
          {type || 'website'}
        </span>

        <span>•</span>

        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {domain}
        </span>
      </div>

      {/* TITLE */}
      <div
        style={{
          fontSize: 15,

          fontWeight: 600,

          lineHeight: 1.45,

          color: '#0F1419',

          marginBottom: description
            ? 5
            : 0,

          letterSpacing: '-0.2px',

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
            fontSize: 13.5,

            lineHeight: 1.45,

            color: '#536471',

            letterSpacing: '-0.08px',

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
  </div>
)
}