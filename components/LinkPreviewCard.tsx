'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  const router = useRouter()

  const [imageFailed, setImageFailed] =
    useState(false)

  if (!url) return null

  /*
   * --------------------------------------------------
   * CLEAN DOMAIN
   * --------------------------------------------------
   *
   * Never show the complete URL.
   *
   * Example:
   *
   * https://www.instagram.com/p/DcO-5xtgWAg/?something=very-long...
   *
   * becomes:
   *
   * instagram.com
   *
   * We prefer the hostname from the actual URL so that
   * a bad/long `domain` value cannot make the card ugly.
   */
  let cleanDomain = ''

  try {
    cleanDomain = new URL(url)
      .hostname
      .replace(/^www\./i, '')
      .trim()
  } catch {
    cleanDomain =
      domain
        ?.trim()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0]
        .trim() || 'Website'
  }

  if (!cleanDomain) {
    cleanDomain = 'Website'
  }

  /*
   * --------------------------------------------------
   * OPEN LINK
   * --------------------------------------------------
   */
  const openLink = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    const encodedUrl =
      encodeURIComponent(url)

    const encodedDomain =
      encodeURIComponent(cleanDomain)

    router.push(
      `/browser?url=${encodedUrl}&domain=${encodedDomain}`,
      {
        scroll: false,
      }
    )
  }

  /*
   * --------------------------------------------------
   * COMPACT LINK
   * --------------------------------------------------
   *
   * Used when:
   * - no preview image exists
   * - preview image failed to load
   *
   * This keeps the feed clean instead of rendering
   * a giant broken/empty preview.
   */
  const showCompactLink =
    !image || imageFailed

  if (showCompactLink) {
    return (
      <div
        onClick={openLink}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,

          marginTop: 14,

          padding: '12px 14px',

          borderRadius: 14,

          border:
            '1px solid rgba(15, 20, 25, 0.12)',

          background: '#fff',

          color: 'inherit',

          cursor: 'pointer',

          minWidth: 0,

          WebkitTapHighlightColor:
            'transparent',
        }}
      >
        {/* LINK ICON */}
        <div
          style={{
            width: 36,
            height: 36,

            borderRadius: 10,

            background: '#F3F4F6',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            flexShrink: 0,

            color: '#6B7280',
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10.59 13.41a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07l-1.22 1.22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M13.41 10.59a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07l1.22-1.22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* LINK INFO */}
        <div
          style={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontSize: 13.5,

              fontWeight: 600,

              color: '#0F1419',

              whiteSpace: 'nowrap',

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              maxWidth: '100%',
            }}
          >
            {cleanDomain}
          </div>

          <div
            style={{
              marginTop: 2,

              fontSize: 12.5,

              color: '#6B7280',

              whiteSpace: 'nowrap',

              overflow: 'hidden',

              textOverflow: 'ellipsis',
            }}
          >
            Open link
          </div>
        </div>

        {/* ARROW */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            flexShrink: 0,
            color: '#9CA3AF',
          }}
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  /*
   * --------------------------------------------------
   * RICH PREVIEW
   * --------------------------------------------------
   *
   * Only shown when an image exists and loads
   * successfully.
   */
  return (
    <div
      onClick={openLink}
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

        minWidth: 0,

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
          onError={() => {
            setImageFailed(true)
          }}
          style={{
            width: '100%',

            height: '100%',

            objectFit: 'cover',

            display: 'block',

            background: '#F3F4F6',
          }}
        />
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: '12px 14px 13px',

          minWidth: 0,
        }}
      >
        {/* DOMAIN + TYPE */}
        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: 6,

            marginBottom: 7,

            minWidth: 0,

            fontSize: 11.5,

            fontWeight: 600,

            color: '#6B7280',

            textTransform: 'capitalize',

            letterSpacing: '-0.1px',
          }}
        >
          <span
            style={{
              flexShrink: 0,
            }}
          >
            {type || 'website'}
          </span>

          <span
            style={{
              flexShrink: 0,
            }}
          >
            •
          </span>

          <span
            style={{
              minWidth: 0,

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              whiteSpace: 'nowrap',
            }}
          >
            {cleanDomain}
          </span>
        </div>

        {/* TITLE */}
        <div
          style={{
            fontSize: 15,

            fontWeight: 600,

            lineHeight: 1.45,

            color: '#0F1419',

            marginBottom:
              description ? 5 : 0,

            letterSpacing: '-0.2px',

            display: '-webkit-box',

            WebkitLineClamp: 2,

            WebkitBoxOrient: 'vertical',

            overflow: 'hidden',

            wordBreak: 'break-word',
          }}
        >
          {title || cleanDomain}
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

              wordBreak: 'break-word',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  )
}