'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { useShellLayout } from '@/components/ShellLayoutContext'
import PublicTopBar from '@/components/PublicTopBar'

type Resource = {
  id: string

  title: string

  description: string | null

  file_name?: string

  file_size?: number

  downloads_count?: number

  created_at: string

  user_id: string

  author_name?: string | null
}

export default function ResourcesPage() {
  const router = useRouter()
  const { setTopBar } =
    useShellLayout()

 useLayoutEffect(() => {
  setTopBar({
    title: 'Resources',
    showBack: true,

    onBack: () => {
      /*
       * Resources → Feed is ALWAYS the destination.
       *
       * Direct Resource/Reader entry:
       *   direct URL
       *      ↓
       *   Reader
       *      ↓
       *   Resource
       *      ↓
       *   Resources
       *      ↓
       *   Feed + FULL REFRESH
       *
       * Normal EggPuff navigation:
       *   Feed
       *      ↓
       *   Resources
       *      ↓
       *   ...
       *      ↓
       *   Resources
       *      ↓
       *   Feed + SMOOTH NAVIGATION
       */

      if (typeof window === 'undefined') {
        return
      }

      const directEntry =
        sessionStorage.getItem(
          'eggpuff_direct_resource_entry'
        ) === 'true'

      if (directEntry) {
        /*
         * Consume the flag before leaving Resources.
         */
        sessionStorage.removeItem(
          'eggpuff_direct_resource_entry'
        )

        /*
         * Full page navigation.
         * This forces Feed to refresh from scratch.
         */
        window.location.assign('/feed')
        return
      }

      /*
       * Normal navigation.
       * Keep Feed alive and navigate smoothly.
       */
      router.push('/feed')
    },
  })

  return () => {
    setTopBar({})
  }
}, [router, setTopBar])

  const [resources, setResources] =
    useState<Resource[]>([])

  const [loading, setLoading] =
  useState(true)

const [cacheChecked, setCacheChecked] =
  useState(false)

  const [loadingMore, setLoadingMore] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [hasMore, setHasMore] =
    useState(true)

  const [searching, setSearching] =
    useState(false)

  const searchTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestId =
    useRef(0)

  const cursor =
    useRef<{
      created_at: string
      id: string
    } | null>(null)

  const PAGE_SIZE = 20

  const CACHE_TIME = 5 * 60 * 1000

  const CACHE_KEY =
    'eggpuff_resources_cache_v1'

  /* ================= LOAD RESOURCES ================= */

  const loadResources = async (
    searchTerm = '',
    reset = false
  ) => {
    const currentRequest =
      ++requestId.current

    if (reset) {
      cursor.current = null
      setHasMore(true)

      if (searchTerm) {
        setSearching(true)
      } else {
        setLoading(true)
      }
    } else {
      setLoadingMore(true)
    }

    try {
      let query =
        supabase
          .from('resources')
          .select(`
            id,
            title,
            description,
            file_name,
            file_size,
            downloads_count,
            created_at,
            user_id
          `)
          .order(
            'created_at',
            {
              ascending: false,
            }
          )
          .order(
            'id',
            {
              ascending: false,
            }
          )
          .limit(PAGE_SIZE)

      /* ================= SEARCH ================= */

      const cleanSearch =
        searchTerm.trim()

      if (cleanSearch) {
        const safeSearch =
          cleanSearch
            .replace(/[%_]/g, '\\$&')
            .replace(/,/g, ' ')

        query = query.or(
          `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
        )
      }

      /* ================= CURSOR ================= */

      if (
        !reset &&
        cursor.current
      ) {
        const currentCursor =
          cursor.current

        query = query.or(
          `created_at.lt.${currentCursor.created_at},and(created_at.eq.${currentCursor.created_at},id.lt.${currentCursor.id})`
        )
      }

      const {
        data: resourceData,
        error: resourceError,
      } = await query

      if (
        currentRequest !==
        requestId.current
      ) {
        return
      }

      if (resourceError) {
        console.error(
          'Failed to load resources:',
          resourceError
        )

        if (reset) {
          setResources([])
        }

        return
      }

      const resourcesList =
        resourceData || []

      /* ================= LOAD AUTHORS ================= */

      const userIds =
        Array.from(
          new Set(
            resourcesList
              .map(
                (resource) =>
                  resource.user_id
              )
              .filter(
                (
                  id
                ): id is string =>
                  Boolean(id)
              )
          )
        )

      const authorMap =
        new Map<string, string>()

      if (
        userIds.length > 0
      ) {
        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            'id, name'
          )
          .in(
            'id',
            userIds
          )

        if (profileError) {
          console.error(
            'Failed to load authors:',
            profileError
          )
        } else {
          ;(profiles || []).forEach(
            (profile) => {
              if (profile.id) {
                authorMap.set(
                  profile.id,
                  profile.name ||
                    'EggPuff student'
                )
              }
            }
          )
        }
      }

      const finalResources =
        resourcesList.map(
          (resource) => ({
            ...resource,

            author_name:
              resource.user_id
                ? authorMap.get(
                    resource.user_id
                  ) ||
                  'EggPuff student'
                : 'EggPuff student',
          })
        )

      /* ================= UPDATE CURSOR ================= */

      if (
        resourcesList.length > 0
      ) {
        const lastResource =
          resourcesList[
            resourcesList.length - 1
          ]

        cursor.current = {
          created_at:
            lastResource.created_at,
          id:
            lastResource.id,
        }
      }

      setHasMore(
        resourcesList.length ===
          PAGE_SIZE
      )

      /* ================= UPDATE LIST ================= */

      setResources(
        (current) =>
          reset
            ? finalResources
            : [
                ...current,
                ...finalResources,
              ]
      )

      /* ================= CACHE FIRST PAGE ================= */

      if (
        reset &&
        !cleanSearch
      ) {
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp:
                Date.now(),

              resources:
                finalResources,

              cursor:
                resourcesList.length >
                0
                  ? {
                      created_at:
                        resourcesList[
                          resourcesList.length -
                            1
                        ].created_at,

                      id:
                        resourcesList[
                          resourcesList.length -
                            1
                        ].id,
                    }
                  : null,

              hasMore:
                resourcesList.length ===
                PAGE_SIZE,
            })
          )
        } catch {
          // Cache failure should never break Resources.
        }
      }
    } finally {
      if (
        currentRequest ===
        requestId.current
      ) {
        setLoading(false)
        setLoadingMore(false)
        setSearching(false)
      }
    }
  }

   /* ================= CACHE-FIRST INITIAL LOAD ================= */

useLayoutEffect(() => {
  let usedCache = false

  try {
    const cached =
      localStorage.getItem(
        CACHE_KEY
      )

    if (cached) {
      const parsed =
        JSON.parse(cached)

      const cacheAge =
        Date.now() -
        Number(
          parsed.timestamp || 0
        )

      const isFresh =
        cacheAge < CACHE_TIME

      if (
        isFresh &&
        Array.isArray(
          parsed.resources
        )
      ) {
        setResources(
          parsed.resources
        )

        cursor.current =
          parsed.cursor ||
          null

        setHasMore(
          parsed.hasMore ??
            true
        )

        setLoading(false)

        usedCache = true
      }
    }
  } catch {
    // Ignore invalid cache.
  }

  /*
   * Cache decision is complete.
   * This prevents the loading state from
   * appearing before cache/Supabase is decided.
   */
  setCacheChecked(true)

  /*
   * Only use Supabase when there is no
   * fresh cache available.
   */
  if (!usedCache) {
    loadResources(
      '',
      true
    )
  }
}, [])

  /* ================= DEBOUNCED SUPABASE SEARCH ================= */

  useEffect(() => {
    if (
      searchTimer.current
    ) {
      clearTimeout(
        searchTimer.current
      )
    }

    const trimmed =
      search.trim()

    /*
     * Empty search returns to
     * the normal resource list.
     */
    if (!trimmed) {
      if (resources.length === 0) {
        loadResources(
          '',
          true
        )
      }

      return
    }

    searchTimer.current =
      setTimeout(() => {
        loadResources(
          trimmed,
          true
        )
      }, 300)

    return () => {
      if (
        searchTimer.current
      ) {
        clearTimeout(
          searchTimer.current
        )
      }
    }
  }, [search])

  /* ================= INFINITE SCROLL ================= */

  const loadMoreRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(() => {
    const element =
      loadMoreRef.current

    if (!element) return

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0]

          if (
            !entry.isIntersecting ||
            loading ||
            loadingMore ||
            searching ||
            !hasMore
          ) {
            return
          }

          loadResources(
            search.trim(),
            false
          )
        },
        {
          rootMargin:
            '500px',
        }
      )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [
    hasMore,
    loading,
    loadingMore,
    searching,
    search,
    resources.length,
  ])

if (!cacheChecked || loading) {
  return (
    <>
      <PublicTopBar />

      <main
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding:
            '79px 20px 24px',
          minHeight: '100vh',
        }}
      >

        {/* ================= SEARCH SKELETON ================= */}

        <div
          style={{
            width: '100%',
            height: 54,
            borderRadius: 17,
            background:
              'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
            backgroundSize:
              '200% 100%',
            animation:
              'resourceSkeleton 1.4s ease-in-out infinite',
            marginBottom: 24,
          }}
        />

        {/* ================= RESOURCE CARD SKELETONS ================= */}

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            style={{
              border:
                '1px solid #E2E8F0',

              borderRadius: 18,

              padding: 18,

              background: '#FFFFFF',

              marginBottom: 12,
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: 'flex',
                alignItems:
                  'flex-start',
                gap: 12,
              }}
            >

              {/* ICON */}

              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 12,

                  background:
                    'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'resourceSkeleton 1.4s ease-in-out infinite',
                }}
              />

              {/* TITLE */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width:
                      item === 2
                        ? '82%'
                        : '72%',

                    height: 20,

                    borderRadius: 7,

                    background:
                      'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                    backgroundSize:
                      '200% 100%',

                    animation:
                      'resourceSkeleton 1.4s ease-in-out infinite',
                  }}
                />

                {item !== 1 && (
                  <div
                    style={{
                      width: '58%',
                      height: 20,
                      borderRadius: 7,

                      background:
                        'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                      backgroundSize:
                        '200% 100%',

                      animation:
                        'resourceSkeleton 1.4s ease-in-out infinite',

                      marginTop: 7,
                    }}
                  />
                )}
              </div>

              {/* VIEW BUTTON */}

              <div
                style={{
                  width: 76,
                  height: 36,
                  flexShrink: 0,

                  borderRadius: 11,

                  background:
                    'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'resourceSkeleton 1.4s ease-in-out infinite',
                }}
              />

            </div>

            {/* DESCRIPTION */}

            <div
              style={{
                marginTop: 16,
              }}
            >
              <div
                style={{
                  width: '92%',
                  height: 15,
                  borderRadius: 6,

                  background:
                    'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'resourceSkeleton 1.4s ease-in-out infinite',
                }}
              />

              <div
                style={{
                  width: '72%',
                  height: 15,
                  borderRadius: 6,

                  background:
                    'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                  backgroundSize:
                    '200% 100%',

                  animation:
                    'resourceSkeleton 1.4s ease-in-out infinite',

                  marginTop: 8,
                }}
              />
            </div>

            {/* AUTHOR */}

            <div
              style={{
                width: '38%',
                height: 13,
                borderRadius: 6,

                background:
                  'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',

                backgroundSize:
                  '200% 100%',

                animation:
                  'resourceSkeleton 1.4s ease-in-out infinite',

                marginTop: 16,
              }}
            />

          </div>
        ))}

        {/* ================= SKELETON ANIMATION ================= */}

        <style jsx>{`
          @keyframes resourceSkeleton {
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

return (
  <>
    <PublicTopBar />

    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '79px 20px 24px',
        minHeight: '100vh',
      }}
    >

      {/* ================= SEARCH ================= */}

      <div
        style={{
          position: 'relative',
          marginBottom: 24,
        }}
      >
        {/* Search icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx="11"
            cy="11"
            r="6.5"
            stroke="#64748B"
            strokeWidth="1.8"
          />

          <path
            d="M16 16L20.2 20.2"
            stroke="#64748B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search resources..."
          style={{
            width: '100%',
            height: 54,

            boxSizing: 'border-box',

            padding: '0 48px 0 48px',

            border: '1px solid #E2E8F0',

            borderRadius: 17,

            background: '#FFFFFF',

            color: '#111827',

            fontSize: 16,

            outline: 'none',

            boxShadow:
              '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: 13,
              top: '50%',
              transform:
                'translateY(-50%)',

              width: 30,
              height: 30,

              border: 'none',
              borderRadius: '50%',

              background: '#F1F5F9',
              color: '#475569',

              fontSize: 18,

              cursor: 'pointer',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ================= RESULTS ================= */}

      {resources.length === 0 ? (

        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          {search.trim()
            ? 'No resources found.'
            : 'No resources yet.'}
        </div>

      ) : (

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >

          {resources.map(
            (resource) => (

              <div
                key={resource.id}
                role="link"
                tabIndex={0}

                onClick={() => {
  /*
   * This is a NORMAL EggPuff navigation:
   *
   * /resources → /resource/[id]
   *
   * Therefore it must NEVER be treated as
   * a direct Resource entry.
   */
  sessionStorage.removeItem(
    'eggpuff_direct_resource_entry'
  )

  sessionStorage.setItem(
    'eggpuff_resource_from_resources',
    'true'
  )

  router.push(
    `/resource/${resource.id}`
  )
}}

                onKeyDown={(e) => {
  if (
    e.key === 'Enter' ||
    e.key === ' '
  ) {
    e.preventDefault()

    sessionStorage.removeItem(
      'eggpuff_direct_resource_entry'
    )

    sessionStorage.setItem(
      'eggpuff_resource_from_resources',
      'true'
    )

    router.push(
      `/resource/${resource.id}`
    )
  }
}}

                style={{
                  border:
                    '1px solid #E2E8F0',

                  borderRadius: 18,

                  padding: 18,

                  background: '#FFFFFF',

                  boxShadow:
                    '0 2px 8px rgba(15, 23, 42, 0.025)',

                  cursor: 'pointer',

                  transition:
                    'transform 0.12s ease, box-shadow 0.12s ease',
                }}

                onMouseDown={(e) => {
                  e.currentTarget.style.transform =
                    'scale(0.99)'
                }}

                onMouseUp={(e) => {
                  e.currentTarget.style.transform =
                    'scale(1)'
                }}

                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    'scale(1)'
                }}
              >

                {/* ================= CARD HEADER ================= */}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >

                  {/* PDF ICON */}

                  <div
                    style={{
                      width: 40,
                      height: 40,

                      flexShrink: 0,

                      borderRadius: 12,

                      background: '#F8FAFC',

                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 3.5H14L18 7.5V20.5H6V3.5Z"
                        stroke="#64748B"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M14 3.5V7.5H18"
                        stroke="#64748B"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M8.5 11H15.5"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />

                      <path
                        d="M8.5 14H15.5"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TITLE */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 750,
                        lineHeight: 1.35,

                        color: '#111827',

                        display:
                          '-webkit-box',

                        WebkitLineClamp: 2,
                        WebkitBoxOrient:
                          'vertical',

                        overflow: 'hidden',
                      }}
                    >
                      {resource.title}
                    </div>
                  </div>

                  {/* ================= VIEW BUTTON ================= */}

                  <button
                    type="button"

                    onClick={(e) => {
  e.stopPropagation()

  /*
   * Reader was opened from the Resources list.
   * Do NOT set reader_back_url here because that
   * URL is reserved for /resource/[id] → /reader/[id].
   */
  sessionStorage.removeItem(
    'eggpuff_reader_back_url'
  )

  sessionStorage.setItem(
    'eggpuff_reader_from_resources',
    'true'
  )

  router.push(
    `/reader/${resource.id}`
  )
}}

                    style={{
                      flexShrink: 0,

                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',

                      height: 36,

                      padding:
                        '0 13px',

                      border: 'none',

                      borderRadius: 11,

                      background: '#111827',

                      color: '#FFFFFF',

                      fontSize: 14,
                      fontWeight: 700,

                      whiteSpace:
                        'nowrap',

                      cursor: 'pointer',

                      transition:
                        'transform 0.1s ease, background-color 0.15s ease',
                    }}

                    onMouseDown={(e) => {
                      e.currentTarget.style.transform =
                        'scale(0.96)'
                    }}

                    onMouseUp={(e) => {
                      e.currentTarget.style.transform =
                        'scale(1)'
                    }}

                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'scale(1)'
                    }}
                  >
                    View
                  </button>

                </div>

                {/* ================= DESCRIPTION ================= */}

                {resource.description && (
                  <div
                    style={{
                      marginTop: 12,

                      color: '#64748B',

                      fontSize: 15,
                      lineHeight: 1.55,

                      display:
                        '-webkit-box',

                      WebkitLineClamp: 2,
                      WebkitBoxOrient:
                        'vertical',

                      overflow: 'hidden',
                    }}
                  >
                    {resource.description}
                  </div>
                )}

                {/* ================= AUTHOR ================= */}

                <div
                  style={{
                    marginTop: 14,

                    fontSize: 13,

                    color: '#94A3B8',

                    fontWeight: 600,

                    whiteSpace:
                      'nowrap',

                    overflow: 'hidden',

                    textOverflow:
                      'ellipsis',
                  }}
                >
                  Published by{' '}

                  <span
                    style={{
                      color: '#64748B',
                      fontWeight: 700,
                    }}
                  >
                    {resource.author_name ||
                      'EggPuff student'}
                  </span>
                </div>

              </div>
            )
          )}

          {/* ================= INFINITE SCROLL ================= */}

          {hasMore && (
            <div
              ref={loadMoreRef}
              style={{
                height: 60,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                color: '#94A3B8',

                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {loadingMore
                ? 'Loading more resources...'
                : ''}
            </div>
          )}

        </div>
      )}

    </main>
  </>
)}