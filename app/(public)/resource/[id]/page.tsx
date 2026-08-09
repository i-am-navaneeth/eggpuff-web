'use client'

import {
  use,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'
import { useShellLayout } from '@/components/ShellLayoutContext'
import { supabase } from '@/lib/supabase'
import { useNotify } from '@/components/NotificationProvider'
import { downloadResource } from '@/lib/resources/downloadResource'

type Resource = {
  id: string
  title: string
  description: string | null

  file_url: string

  file_name?: string
  file_size?: number

  downloads_count?: number
  saves_count?: number

  created_at: string

  user_id: string
}

export default function ResourcePage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = use(params)
  
  const { notify } = useNotify()

  const router = useRouter()
const { setTopBar } = useShellLayout()

useLayoutEffect(() => {
  if (typeof window !== 'undefined') {
    /*
     * If Resource was opened from the Resources list,
     * mark that this is a normal internal navigation.
     *
     * Resources page must set this marker before
     * navigating to /resource/[id].
     */
    const fromResources =
      sessionStorage.getItem(
        'eggpuff_resource_from_resources'
      ) === 'true'

    if (fromResources) {
      sessionStorage.removeItem(
        'eggpuff_resource_from_resources'
      )
    } else {
      /*
       * If there is no internal Resources marker and
       * the page was opened from outside EggPuff,
       * remember that this flow started directly.
       */
      const referrer =
        document.referrer

      const isInternalReferrer =
        referrer.startsWith(
          window.location.origin
        )

      if (!isInternalReferrer) {
        sessionStorage.setItem(
          'eggpuff_direct_resource_entry',
          'true'
        )
      }
    }
  }

  setTopBar({
    title: 'Resource',
    showBack: true,

    onBack: () => {
      /*
       * IMPORTANT:
       *
       * Use replace instead of push.
       *
       * push creates:
       *
       * Resource → Resources → Resource
       *
       * in browser history.
       *
       * replace removes the current Resource entry
       * and changes it to Resources.
       *
       * Therefore:
       *
       * Resources
       *   ↓
       * Resource
       *   ↓ Back
       * Resources
       *
       * and pressing Back on Resources can correctly
       * continue toward Feed.
       */
      router.replace('/resources')
    },
  })

  return () => {
    setTopBar({})
  }
}, [router, setTopBar])

  const [resource, setResource] =
    useState<Resource | null>(
      null
    )

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data,
        error,
      } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error(error)
      }

      setResource(data)

      setLoading(false)
    }

    load()
  }, [id])

  const shareResource =
    async () => {

      const url =
        window.location.href

      try {

        if (
          navigator.share
        ) {

          await navigator.share({
            title:
              resource?.title,

            text:
              resource?.description ??
              '',

            url,
          })

        } else {

          await navigator.clipboard.writeText(
  url
)

notify('✅ Link copied to clipboard')
        }

      } catch {}
    }

const handleDownload = async () => {
  if (!resource) return

  // Update the UI immediately
  setResource((current) => {
    if (!current) return current

    return {
      ...current,
      downloads_count:
        (current.downloads_count ?? 0) + 1,
    }
  })

  try {
    await downloadResource(
      resource.id,
      resource.file_url,
      resource.file_name
    )
  } catch (error) {
    console.error('Download failed:', error)

    // Roll back the optimistic update
    setResource((current) => {
      if (!current) return current

      return {
        ...current,
        downloads_count:
          Math.max(
            0,
            (current.downloads_count ?? 1) - 1
          ),
      }
    })

    notify(
      '❌ Failed to download resource. Please try again.'
    )
  }
}

if (loading) {
  return (
    <>

      <main
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '79px 24px 24px',
          minHeight: '100vh',
        }}
      >
        {/* ================= TITLE SKELETON ================= */}

        <div
          style={{
            width: '82%',
            height: 38,
            borderRadius: 9,
            marginBottom: 22,

            background:
              'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

            backgroundSize: '200% 100%',

            animation:
              'resourceDetailSkeleton 1.4s ease-in-out infinite',
          }}
        />

        {/* ================= DESCRIPTION SKELETON ================= */}

        <div
          style={{
            marginBottom: 26,
          }}
        >
          {[1, 2, 3, 4].map((line) => (
            <div
              key={line}
              style={{
                width:
                  line === 4
                    ? '68%'
                    : '100%',

                height: 17,

                borderRadius: 6,

                marginBottom:
                  line === 4
                    ? 0
                    : 12,

                background:
                  'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                backgroundSize:
                  '200% 100%',

                animation:
                  'resourceDetailSkeleton 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>

        {/* ================= META SKELETON ================= */}

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 36,
            flexWrap: 'wrap',
          }}
        >
          {[90, 90, 155].map(
            (width, index) => (
              <div
                key={index}
                style={{
                  width,
                  height: 50,

                  borderRadius: 14,

                  background:
                    'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'resourceDetailSkeleton 1.4s ease-in-out infinite',
                }}
              />
            )
          )}
        </div>

        {/* ================= READ IN EGGPuff SKELETON ================= */}

        <div
          style={{
            border:
              '1px solid #E2E8F0',

            borderRadius: 28,

            padding: 30,

            background: '#FFFFFF',

            marginBottom: 24,
          }}
        >
          {/* SMALL HEADING */}

          <div
            style={{
              width: 150,
              height: 15,

              borderRadius: 6,

              marginBottom: 18,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />

          {/* DESCRIPTION */}

          <div
            style={{
              width: '88%',
              height: 17,

              borderRadius: 6,

              marginBottom: 12,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />

          <div
            style={{
              width: '62%',
              height: 17,

              borderRadius: 6,

              marginBottom: 28,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />

          {/* OPEN RESOURCE BUTTON */}

          <div
            style={{
              width: '100%',
              height: 64,

              borderRadius: 17,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* ================= BOTTOM ACTIONS ================= */}

        <div
          style={{
            display: 'flex',
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 64,

              borderRadius: 17,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />

          <div
            style={{
              flex: 1,
              height: 64,

              borderRadius: 17,

              background:
                'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

              backgroundSize:
                '200% 100%',

              animation:
                'resourceDetailSkeleton 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* ================= SKELETON ANIMATION ================= */}

        <style jsx>{`
          @keyframes resourceDetailSkeleton {
            0% {
              background-position: 200% 0;
            }

            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </main>
    </>
  )
}

  if (!resource) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
        }}
      >
        Resource not found
      </div>
    )
  }

  const isPdf =
    resource.file_url
      ?.toLowerCase()
      .includes('.pdf')

  const formatFileSize = (
    bytes?: number
  ) => {

    if (!bytes)
      return null

    const mb =
      bytes /
      1024 /
      1024

    return `${mb.toFixed(
      1
    )} MB`
  }

return (
  <main
    style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '28px 18px 110px',
      color: '#0F172A',
    }}
  >
    {/* ================= RESOURCE HEADER ================= */}

    <section
      style={{
        marginBottom: 24,
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(30px, 6vw, 44px)',
          lineHeight: 1.12,
          fontWeight: 800,
          letterSpacing: '-0.8px',
          margin: 0,
          color: '#0F172A',
        }}
      >
        {resource.title}
      </h1>

      {resource.description && (
        <p
          style={{
            marginTop: 16,
            marginBottom: 0,
            color: '#64748B',
            fontSize: 17,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            maxWidth: 720,
          }}
        >
          {resource.description}
        </p>
      )}
    </section>

    {/* ================= RESOURCE META ================= */}

    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '9px 13px',
          borderRadius: 12,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          color: '#475569',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        📄{' '}
        {resource.file_name
          ?.split('.')
          .pop()
          ?.toUpperCase() || 'FILE'}
      </div>

      {resource.file_size && (
        <div
          style={{
            padding: '9px 13px',
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            color: '#475569',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {formatFileSize(resource.file_size)}
        </div>
      )}

      {(resource.downloads_count ?? 0) > 0 && (
        <div
          style={{
            padding: '9px 13px',
            borderRadius: 12,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            color: '#475569',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ↓ {resource.downloads_count} downloads
        </div>
      )}
    </div>

    {/* ================= OPEN READER ================= */}

    {isPdf && (
      <section
        style={{
          padding: '24px',
          borderRadius: 24,
          background:
            'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
          border: '1px solid #F4B860',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#9A5B00',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Read in EggPuff
        </div>

        <p
          style={{
            marginTop: 8,
            marginBottom: 20,
            color: '#64748B',
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          View this resource directly in EggPuff with a
          focused reading experience.
        </p>

<button
      type="button"
     onClick={(e) => {
  e.stopPropagation()

  /*
   * Reader was opened from /resource/[id].
   *
   * Reader Back:
   *   Reader → Resource
   *
   * Keep the Resource URL in history so the Reader
   * can return to the exact Resource page.
   */
  sessionStorage.setItem(
    'eggpuff_reader_back_url',
    `/resource/${resource.id}`
  )

  /*
   * This Reader was NOT opened directly from
   * the Resources list.
   */
  sessionStorage.removeItem(
    'eggpuff_reader_from_resources'
  )

  /*
   * Tell ClientWrapper to open the Reader with
   * the correct transition.
   */
  window.dispatchEvent(
    new CustomEvent(
      'ep-open-reader',
      {
        detail: {
          resourceId:
            resource.id,

          title:
            resource.title,
        },
      }
    )
  )
}}
      style={{
        width: '100%',
        height: 52,
        padding: '0 20px',

        border: 'none',
        borderRadius: 14,

        background: '#111827',
        color: '#FFFFFF',

        fontSize: 16,
        fontWeight: 700,

        cursor: 'pointer',

        transition:
          'transform 0.12s ease, background-color 0.12s ease',

        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform =
          'scale(0.985)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform =
          'scale(0.985)'
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform =
          'scale(1)'
      }}
    >
      Open Resource
    </button>
      </section>
    )}

    {/* ================= ACTIONS ================= */}

    <div
      style={{
        display: 'flex',
        gap: 10,
        marginBottom: 24,
      }}
    >
      {/* SHARE — TERTIARY */}
  <button
    type="button"
    onClick={shareResource}
    style={{
      flex: 1,
      height: 50,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      padding: '0 18px',

      borderRadius: 14,
      border: '1px solid #E5E7EB',

      background: '#FFFFFF',
      color: '#475569',

      fontSize: 15,
      fontWeight: 600,

      cursor: 'pointer',

      transition:
        'background-color 0.15s ease, transform 0.1s ease',

      WebkitTapHighlightColor: 'transparent',
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.background =
        '#F8FAFC'
      e.currentTarget.style.transform =
        'scale(0.98)'
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.transform =
        'scale(1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.transform =
        'scale(1)'
    }}
    onTouchStart={(e) => {
      e.currentTarget.style.background =
        '#F8FAFC'
      e.currentTarget.style.transform =
        'scale(0.98)'
    }}
    onTouchEnd={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.transform =
        'scale(1)'
    }}
  >
    Share
  </button>

{/* DOWNLOAD — SECONDARY */}
  <button
    type="button"
    onClick={handleDownload}
    style={{
      flex: 1,
      height: 50,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      padding: '0 18px',

      borderRadius: 14,
      border: '1.5px solid #111827',

      background: '#FFFFFF',
      color: '#111827',

      fontSize: 15,
      fontWeight: 700,

      cursor: 'pointer',

      transition:
        'background-color 0.15s ease, color 0.15s ease, transform 0.1s ease',

      WebkitTapHighlightColor: 'transparent',
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.background =
        '#111827'
      e.currentTarget.style.color =
        '#FFFFFF'
      e.currentTarget.style.transform =
        'scale(0.98)'
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.color =
        '#111827'
      e.currentTarget.style.transform =
        'scale(1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.color =
        '#111827'
      e.currentTarget.style.transform =
        'scale(1)'
    }} 
    onTouchStart={(e) => {
      e.currentTarget.style.background =
        '#111827'
      e.currentTarget.style.color =
        '#FFFFFF'
      e.currentTarget.style.transform =
        'scale(0.98)'
    }}
    onTouchEnd={(e) => {
      e.currentTarget.style.background =
        '#FFFFFF'
      e.currentTarget.style.color =
        '#111827'
      e.currentTarget.style.transform =
        'scale(1)'
    }}
  >
    Download
  </button>
    </div>
  </main>
)}