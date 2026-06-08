'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import PromoteBanner from '../../../components/PromoteBanner'
import QuestionFilterSheet from '../../../components/QuestionFilterSheet'
import QuestionCard from '../../../components/QuestionCard'
import QuestionCardSkeleton from '@/components/QuestionCardSkeleton'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '../../../components/NotificationProvider'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import IPLScoreCard from '@/components/IPLScoreCard'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Category = {
  id: string
  slug: string
  label: string
}

type CategoryWithCount = Category & {
  activeCount: number
}

type FilterType = 'all' | 'unanswered' | 'answered'

type QuestionRow = {
  id: string

  text: string

  created_at: string

  expires_at?: string

  type?: 'normal' | 'bubble'

  category_id: string | null

  approved_answer_id?: string | null

  answers_count?: number

  helpful_count?: number

  is_helpful?: boolean

  is_saved?: boolean

  categories?: {
    label: string
  }[]

  category_label?: string

  is_verified?: boolean

  _missed?: boolean
}

type Question = {
  id: string
  user_id: string
  created_at: string
  batch_year?: string
  category_id?: string
  categories?: { label: string }[]
  is_trending?: boolean
  streak_count?: number
  answers_count?: number
}

type Profile = {
  user_id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  college_id?: string
  is_verified?: boolean
  streak_count?: number
}

// ─────────────────────────────────────────────
// Cursor type — tracks where the feed is in DB
// ─────────────────────────────────────────────

type FeedCursor = {
  last_created_at: string
  last_id: string
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function FeedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notify } = useNotify()

  const pathname = usePathname()

  // ─── UI state ───────────────────────────────
  const [promoted, setPromoted] = useState<any[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] =
  useState(false)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all')
  const [filter, setFilter] = useState<FilterType>('all')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const isProfileComplete = !!profile?.college_id && !!profile?.batch_year

  const [now, setNow] = useState(new Date())
  const [newQuestions, setNewQuestions] = useState<any[]>([])
  const [showNewBanner, setShowNewBanner] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] =
  useState(true)

  const [userId, setUserId] = useState<string | null>(null)
  const PAGE_SIZE = 6

  const questionsRef =
  useRef<QuestionRow[]>([])

const FEED_OFFSET_KEY =
  'feed_session_offset'

  const FEED_LAST_VISIT_KEY =
  'feed_last_visit_at'

const getFeedOffset = () => {
  try {
    return Number(
      localStorage.getItem(
        FEED_OFFSET_KEY
      ) || '0'
    )
  } catch {
    return 0
  }
}

const saveFeedOffset = (
  offset: number
) => {
  try {
    localStorage.setItem(
      FEED_OFFSET_KEY,
      String(offset)
    )
  } catch {}
}

const getLastVisit = () => {
  try {
    return (
      localStorage.getItem(
        FEED_LAST_VISIT_KEY
      ) || null
    )
  } catch {
    return null
  }
}

const saveLastVisit = () => {
  try {
    localStorage.setItem(
      FEED_LAST_VISIT_KEY,
      new Date().toISOString()
    )
  } catch {}
}

  // ─── Inflight lock ──────────────────────────
  const hardLockRef = useRef(false)

  // ─── IntersectionObserver sentinel ──────────
  const loadMoreRefEl = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  const getUserId = async (): Promise<string | null> => {

    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  }

  const mergeBatch = (batch: QuestionRow[]): number => {
  let added = 0

  setQuestions(prev => {
    const map = new Map<string, QuestionRow>()

    for (const q of prev) map.set(q.id, q)

    for (const q of batch) {
      if (q?.id && !map.has(q.id)) {
        map.set(q.id, q)
        added++
      }
    }

    return Array.from(map.values())
  })

  return added
}

const appendLoopBatch = (
  batch: QuestionRow[]
) => {

  setQuestions((prev) => {

    // 🔥 recent visible ids
    const recentIds = prev
      .slice(-12)
      .map((q) => q.id)

    // 🔥 prevent nearby duplicates
    const filtered = batch.filter(
      (q) => !recentIds.includes(q.id)
    )

    // 🔥 append naturally
    return [
      ...prev,
      ...filtered,
    ]
  })
}

  const fetchPage = async (
  userId: string,
  offsetOverride?: number
): Promise<QuestionRow[]> => {

  const offset =
    offsetOverride ??
    getFeedOffset()

  const { data, error } =
    await supabase.rpc(
      'get_smart_feed',
      {
        p_user_id: userId,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      }
    )

  if (error) {
    console.warn(
      'RPC error',
      error
    )

    return []
  }

  return (
    data ?? []
  ) as QuestionRow[]
}

  
  // ─────────────────────────────────────────────
  // loadMore — triggered by IntersectionObserver
  // ✅ FIX 2: Guard with !loaded so it never fires
  //    before the initial load completes
  // ─────────────────────────────────────────────

 const loadMore = useCallback(async () => {
  // ✅ block duplicate loads
  // ✅ block before initial load
  // ✅ stop forever when feed ends
  if (
    hardLockRef.current ||
    !loaded ||
    !hasMore
  ) {
    return
  }

  hardLockRef.current = true
  setLoadingMore(true)

  try {
    const userId = await getUserId()

    if (!userId) return

    const batch =
      await fetchPage(userId)

    console.log(
      'BATCH IDS:',
      batch.map(q => q.id)
    )

    // ✅ end of feed
    if (!batch.length) {
      observerRef.current?.disconnect()

      setHasMore(false)

      return
    }

    mergeBatch(batch)

    saveFeedOffset(
      getFeedOffset() +
        batch.length
    )

  } catch (e) {
    console.warn(
      'loadMore error',
      e
    )
  } finally {
    setLoadingMore(false)

    hardLockRef.current = false

    // ✅ don't reattach observer after end
    if (
      hasMore &&
      loadMoreRefEl.current &&
      observerRef.current
    ) {
      observerRef.current.disconnect()

      observerRef.current.observe(
        loadMoreRefEl.current
      )
    }
  }
}, [loaded, hasMore])

// ✅ Stable ref so observer callback
// never captures stale closure
const loadMoreRef =
  useRef(loadMore)

useEffect(() => {
  loadMoreRef.current =
    loadMore
})
  // ─────────────────────────────────────────────
  // IntersectionObserver
  // ✅ FIX 4: depends on [loaded] so it re-attaches
  //    after initial load completes
  // ─────────────────────────────────────────────

  useEffect(() => {
    const el = loadMoreRefEl.current
    if (!el) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
  const entry = entries[0]

  if (
  entry.isIntersecting &&
  !hardLockRef.current &&
  !loadingMore
) {
    observerRef.current?.unobserve(
      entry.target
    )

    loadMoreRef.current()
  }
},
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0,
      }
    )

    observerRef.current.observe(el)
    return () => observerRef.current?.disconnect()
  }, [loaded]) // ✅ FIX 4: was [loadMoreRefEl.current], now [loaded]

  // ─────────────────────────────────────────────
  // Category param sync
  // ─────────────────────────────────────────────

  useEffect(() => {
    const param = searchParams.get('category') || 'all'
    setActiveCategorySlug(param)
  }, [searchParams.toString()])

  // ─────────────────────────────────────────────
  // Clock tick — only while tab visible
  // ─────────────────────────────────────────────

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (interval) return
      interval = setInterval(() => setNow(new Date()), 60_000)
    }

    const stop = () => {
      if (interval) { clearInterval(interval); interval = null }
    }

    const onVisibility = () => {
      document.visibilityState === 'visible' ? start() : stop()
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // ─────────────────────────────────────────────
  // Profile safe-check
  // ─────────────────────────────────────────────

  const createProfileIfNotExists = async () => {
    try {
      const userId = await getUserId()
      if (!userId) return

      const { data: profileRow, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) console.warn('profile fetch error', error)
    } catch (e) {
      console.warn('profile check failed', e)
    }
  }

  // ─────────────────────────────────────────────
  // Cache warm (instant paint)
  // ─────────────────────────────────────────────

  useEffect(() => {
  try {
    const cached =
      localStorage.getItem('feed_cache')

    if (!cached) return

    const parsed = JSON.parse(cached)

    if (!Array.isArray(parsed)) return

    // 🔥 remove locally deleted questions
    const deletedIds = JSON.parse(
      localStorage.getItem(
        'deleted_questions'
      ) || '[]'
    )

    const cleaned = parsed.filter(
      (q: any) =>
        !deletedIds.includes(q.id)
    )

    setQuestions(cleaned)
    setLoading(false)
  } catch (e) {
    console.warn(
      'cache parse failed',
      e
    )
  }
}, [])
  // ─────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!questions.length && !loaded) setLoading(true)

      createProfileIfNotExists()

      const sessionRes = await supabase.auth.getSession()
      const user = sessionRes.data?.session?.user

      setUserId(user?.id ?? null)

      const lastVisit =
  getLastVisit()

const freshQuestionsPromise =
  supabase.rpc(
    'get_smart_feed',
    {
      p_user_id: user?.id,

      p_limit: 3,

      p_offset: 0,
    }
  )

const feedPromise =
  supabase.rpc(
    'get_smart_feed',
    {
      p_user_id: user?.id,
      p_limit: 6,
      p_offset:
        getFeedOffset(),
    }
  )

const [
  freshRes,
  feedRes,
  catsRes,
  promoRes,
  profileRes,
] = await Promise.all([
  freshQuestionsPromise,

  feedPromise,

  supabase
    .from('categories')
    .select(
      'id, slug, label'
    )
    .order('created_at', {
      ascending: true,
    }),

  supabase
    .from('pyp_promotions')
    .select(
      'link, user_id'
    )
    .gt(
      'expires_at',
      new Date().toISOString()
    )
    .order('started_at', {
      ascending: false,
    }),

  supabase
    .from('profiles')
    .select(
      'college_id, batch_year'
    )
    .eq(
      'user_id',
      user?.id
    )
    .single(),
])

      if (!mounted) return

      const freshQuestions =
  (freshRes.data ??
    []) as QuestionRow[]

const normalFeed =
  (feedRes.data ??
    []) as QuestionRow[]

const map = new Map()

for (const q of freshQuestions) {
  map.set(q.id, q)
}

for (const q of normalFeed) {
  map.set(q.id, q)
}

const questionsData =
  Array.from(
    map.values()
  ) as QuestionRow[]

      mergeBatch(questionsData)

      saveFeedOffset(
  getFeedOffset() +
    normalFeed.length
)
setTimeout(() => {
  saveLastVisit()
}, 500)

      // ✅ FIX 2: Set loaded=true AFTER data is in state
      //    This unblocks loadMore and re-triggers the observer
      setLoaded(true)

      setTimeout(() => {
        if (!mounted) return

        const nowTime = Date.now()

        const profileMap: Record<string, any> = {}
        questionsData.forEach(q => {
          const row = q as any
          profileMap[row.user_id] = {
  user_id: row.user_id,
  name: row.user_name,
  username: row.username,
  avatar_url: row.avatar_url,
  is_verified: row.is_verified,
  streak_count:
    row.streak_count ?? 0,

  college_id:
    row.college_id ?? null,
}
        })

        const promoItems =
          (promoRes.data ?? [])
            .map((p: any) => ({
              link: p.link,
              creator: profileMap[p.user_id],
            }))
            .filter(p => p.creator?.college_id === profileRes.data?.college_id) || []

        setPromoted(promoItems)

        const catsData = (catsRes.data ?? []) as Category[]
        const countsMap: Record<string, number> = {}
        let generalCount = 0

        questionsData.forEach((q: any) => {
          if (!q?.category_id) generalCount++
          else countsMap[q.category_id] = (countsMap[q.category_id] ?? 0) + 1
        })

        const categoriesWithCount: CategoryWithCount[] = catsData.map(cat => ({
          ...cat,
          activeCount: countsMap[cat.id] ?? 0,
        }))

        categoriesWithCount.unshift({
          id: 'general',
          slug: 'general',
          label: 'General',
          activeCount: generalCount,
        })

        setCategories(categoriesWithCount)

        setQuestions(prev => {
          const map = new Map<string, QuestionRow>()
          for (const q of prev) map.set(q.id, q)

          for (const q of questionsData) {
            const row = q as any
            map.set(q.id, {
              ...q,
              answers_count: row.answers_count ?? 0,
              is_trending:
                row.answers_count >= 3 &&
                row.answers_count <= 20 &&
                nowTime - +new Date(q.created_at) < 12 * 60 * 60 * 1000,
            } as any)
          }

          return Array.from(map.values())
        })

        setLoading(false)
        setProfile(profileRes.data)
        setProfileLoading(false)

        setTimeout(() => {
  try {
    const deletedIds = JSON.parse(
      localStorage.getItem(
        'deleted_questions'
      ) || '[]'
    )

    const cleaned =
      questionsData.filter(
        (q: any) =>
          !deletedIds.includes(q.id)
      )

    localStorage.setItem(
      'feed_cache',
      JSON.stringify(
        cleaned.slice(0, 10)
      )
    )
  } catch {}
}, 1000)

}, 0)
    }

    
    const channel = supabase
  .channel('questions-feed')

  // 🔥 INSERT QUESTION
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'questions',
    },
    (payload) => {
      const incoming =
        payload.new as QuestionRow

      setNewQuestions((prev) => {
        // 🔥 prevent duplicate realtime inserts
        if (
          prev.some(
            (q) => q.id === incoming.id
          )
        ) {
          return prev
        }

        // 🔥 prevent deleted/re-existing questions
        if (
          questionsRef.current.some(
  (q) => q.id === incoming.id
)
        ) {
          return prev
        }

        return [incoming, ...prev]
      })

      ;(async () => {
        const { data: profileRow } =
  await supabase
    .from('profiles')
    .select(`
      name,
      username,
      avatar_url,
      is_verified,
      streak_count
    `)
            .eq(
              'user_id',
              (incoming as any).user_id
            )
            .maybeSingle()

        setNewQuestions((prev) =>
          prev.map((q: any) =>
            q.id === incoming.id
              ? {
                  ...q,

                  user_name:
                    profileRow?.name ||
                    'User',

                  username:
                    profileRow?.username ||
                    'user',

                  avatar_url:
                    profileRow?.avatar_url ||
                    null,

                  is_verified:
                    profileRow?.is_verified ??
                    false,
                  
                  streak_count:
                   profileRow?.streak_count ?? 0,
                }
              : q
          )
        )
      })()

      setShowNewBanner(true)
    }
  )

  // 🔥 DELETE QUESTION
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'questions',
    },
    (payload) => {
      const deletedId =
        payload.old.id as string

      // 🔥 instantly remove from feed
      setQuestions((prev) =>
        prev.filter(
          (q) => q.id !== deletedId
        )
      )

      // 🔥 remove from realtime queue
      setNewQuestions((prev) =>
        prev.filter(
          (q) => q.id !== deletedId
        )
      )

      // 🔥 sync cache
      try {
        const cached = JSON.parse(
          localStorage.getItem(
            'feed_cache'
          ) || '[]'
        )

        const cleaned =
          cached.filter(
            (q: any) =>
              q.id !== deletedId
          )

        localStorage.setItem(
          'feed_cache',
          JSON.stringify(cleaned)
        )
      } catch {}
    }
  )

  .subscribe()

    load()

    return () => {
      supabase.removeChannel(channel)
      mounted = false
      sessionStorage.setItem('feed_scroll', String(window.scrollY))
    }
  }, [])
  
useEffect(() => {
  questionsRef.current =
    questions
}, [questions])

  // ─────────────────────────────────────────────
  // Sorted + filtered memos
  // ─────────────────────────────────────────────

  const visibleQuestions: QuestionRow[] = useMemo(() => {
    return questions.filter((q: QuestionRow) => {
      if (q.expires_at && new Date(q.expires_at) <= now) return false

      if (activeCategorySlug === 'general') {
        if (q.category_id !== null) return false
      } else if (activeCategorySlug !== 'all') {
        const cat = categories.find((c) => c.slug === activeCategorySlug)
        if (!cat || q.category_id !== cat.id) return false
      }

      if (filter === 'answered') return !!q.approved_answer_id
      if (filter === 'unanswered') return !q.approved_answer_id

      return true
    })
  }, [questions, now, activeCategorySlug, filter, categories])

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────

  const handleCategoryClick = (slug: string) => {
    setActiveCategorySlug(slug)
    router.push(`/feed?category=${slug}`)
  }

  const openFilterSheet = () => setFilterSheetOpen(true)
  const closeFilterSheet = () => setFilterSheetOpen(false)

  const handleCreateCategory = () => {
    notify('🚧 Category creation coming soon!')
  }

  const filterLabel =
    filter === 'all' ? 'Filter' : filter === 'unanswered' ? 'Unanswered' : 'Answered'

    const refreshFeed = async () => {
  if (refreshing) return

  setRefreshing(true)

  try {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    const userId = await getUserId()

    // 🔥 reset smart feed memory
saveFeedOffset(0)

    const { data } = await supabase.rpc(
      'get_smart_feed',
      {
        p_user_id: userId,
        p_limit: 6,
      }
    )

    const fresh =
      (data ?? []) as QuestionRow[]

    setQuestions((prev) => {
      const map = new Map()

      for (const q of prev) {
        map.set(q.id, q)
      }

      for (const q of fresh) {
        map.set(q.id, q)
      }

      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )
    })

    try {
      localStorage.setItem(
        'feed_cache',
        JSON.stringify(fresh.slice(0, 10))
      )
    } catch {}

  } catch (e) {
    console.warn(
      'refreshFeed error',
      e
    )
  } finally {
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }
}

useEffect(() => {
  const handleRefresh = () => {
    refreshFeed()
  }

  window.addEventListener(
    'ep-refresh-feed',
    handleRefresh
  )

  return () => {
    window.removeEventListener(
      'ep-refresh-feed',
      handleRefresh
    )
  }
}, [])

  /* -------------------- UI -------------------- */

  return (
    <div className="pt-1">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_minmax(50px,10fr)_200px] w-full max-w-[1200px] mx-auto pt-0 gap-6">

        {/* LEFT PANEL */}
        <aside className="hidden lg:block sticky top-6 self-start h-fit pr-6 border-r border-gray-200">
          {loading && (
            <div style={{ marginTop: 16 }}>
              <Skeleton width={120} height={36} radius={999} />
            </div>
          )}

          {!loading && (
            <div className="space-y-2">
              <button
                onClick={openFilterSheet}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  fontSize: 'clamp(13px,0.9vw,15px)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {filterLabel} ▾
              </button>

<button
  onClick={() => router.push('/resources')}
  style={{
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    fontSize: 'clamp(13px,0.9vw,15px)',
    fontWeight: 500,
    width: '100%',
    textAlign: 'left',
  }}
>
  📄 Resources
</button>

<button
  onClick={() => handleCategoryClick('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: activeCategorySlug === 'all' ? '1px solid #F4B860' : '1px solid #E5E7EB',
                  background: activeCategorySlug === 'all' ? '#FFF7ED' : '#FFFFFF',
                  fontSize: 'clamp(13px,0.9vw,15px)',
                  fontWeight: 500,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                All
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: activeCategorySlug === cat.slug ? '1px solid #F4B860' : '1px solid #E5E7EB',
                    background: activeCategorySlug === cat.slug ? '#FFF7ED' : '#FFFFFF',
                    fontSize: 'clamp(13px,0.9vw,15px)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    flexShrink: '0',
                  }}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={handleCreateCategory}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px dashed #F4B860',
                  background: '#FFFFFF',
                  fontSize: 'clamp(13px,0.9vw,15px)',
                  fontWeight: 500,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                + Create
              </button>
            </div>
          )}
        </aside>

        {/* CENTER FEED */}
        <main className="px-4 lg:px-10 lg:border-r lg:border-gray-300/40 space-y-8">

        {refreshing && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      position: 'sticky',
top: 70,
zIndex: 60,
padding: '4px 0 10px',
pointerEvents: 'none',
    }}
  >
    <div
  style={{
    width: 24,
    height: 24,

    borderRadius: '50%',

    border:
      '2.5px solid rgba(0,0,0,0.08)',

    borderTop:
      '2.5px solid #F4B860',

    animation:
      'ep-spin 0.7s linear infinite',

    willChange: 'transform',

    transform:
      'translateZ(0)',
  }}
/>
  </div>
)}

          {showNewBanner && newQuestions.length > 0 && (
            <div
              onClick={() => {
                setQuestions(prev => [...newQuestions, ...prev])
                setNewQuestions([])
                setShowNewBanner(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              style={{
                position: 'sticky',
                top: 64,
                zIndex: 50,
                margin: '10px auto',
                width: 'fit-content',
                padding: '8px 14px',
                borderRadius: 20,
                background: '#111',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              ↑ {newQuestions.length} new question{newQuestions.length > 1 ? 's' : ''}
            </div>
          )}

          <div className="lg:hidden mb-4">
            {!loading && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  overflowX: 'auto',
                  paddingBottom: 8,
                }}
              >
                <button
                  onClick={openFilterSheet}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filterLabel} ▾
                </button>
     
                <button
  onClick={() => router.push('/resources')}
  style={{
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  }}
>
  📄 Resources
</button>

                <button
                  onClick={() => handleCategoryClick('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: activeCategorySlug === 'all' ? '1px solid #F4B860' : '1px solid #E5E7EB',
                    background: activeCategorySlug === 'all' ? '#FFF7ED' : '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  All
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      border: activeCategorySlug === cat.slug ? '1px solid #F4B860' : '1px solid #E5E7EB',
                      background: activeCategorySlug === cat.slug ? '#FFF7ED' : '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* IPL SCOREBOARD */}
          {/* <IPLScoreCard /> */}

          {!loading && !profileLoading && !isProfileComplete && (
            <div
              style={{
                padding: '12px 14px',
                background: '#FEF3C7',
                borderRadius: 12,
                fontSize: 13,
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>Complete your profile to unlock features 🚀</span>
              <button
                onClick={() => router.push('/profile')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#F4B860',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Complete
              </button>
            </div>
          )}

          {loading && [1, 2, 3, 4, 5].map(i => (
            <QuestionCardSkeleton key={i} />
          ))}

          {!loading && promoted.length > 0 && (
            <PromoteBanner links={promoted} />
          )}

          {filterSheetOpen && (
            <QuestionFilterSheet
              value={filter}
              onChange={val => {
                setFilter(val)
                setFilterSheetOpen(false)
              }}
              onClose={closeFilterSheet}
            />
          )}

          {!loading &&
  visibleQuestions.length === 0 && (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 20px',
      }}
    >
      <div
  style={{
    fontSize: 48,
    marginBottom: 12,
    display: 'inline-block',
    animation: 'eggWiggle 4s ease-in-out infinite',
    transformOrigin: 'bottom center',
  }}
>
  🥚
</div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#111827',
          marginBottom: 4,
        }}
      >
         No questions are here yet
      </div>

      <div
        style={{
          fontSize: 14,
          color: '#6B7280',
          marginBottom: 18,
        }}
      >
        Be the first to ask.
      </div>

      <button
        onClick={() =>
          router.push(
            `/ask?category=${encodeURIComponent(
              activeCategorySlug
            )}`
          )
        }
        style={{
          background: '#F4B860',
          border: 'none',
          borderRadius: 999,
          padding: '14px 24px',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        Ask a Question
      </button>

      <style jsx>{`
  @keyframes eggWiggle {
    0%   { transform: translateY(0) rotate(0deg); }
4%   { transform: translateY(-2px) rotate(-5deg); }
8%   { transform: translateY(0) rotate(5deg); }
12%  { transform: translateY(-1px) rotate(-3deg); }
16%  { transform: translateY(0) rotate(3deg); }
20%  { transform: translateY(0) rotate(0deg); }
100% { transform: translateY(0) rotate(0deg); }
  }
`}</style>
    </div>
)}

          {!loading && (
  <div className="space-y-3">
    {visibleQuestions.map((q: QuestionRow) => (
      <div
        key={`${q.id}-${q._missed ? 'missed' : 'normal'}`}
        data-question-id
        data-id={q.id}
        data-created-at={q.created_at}
      >
      
        <QuestionCard
          q={q}
          currentUserId={userId}
          onDelete={(id: string) => {
            try {
              const deletedIds = JSON.parse(
                localStorage.getItem(
                  'deleted_questions'
                ) || '[]'
              )

              if (!deletedIds.includes(id)) {
                localStorage.setItem(
                  'deleted_questions',
                  JSON.stringify([
                    ...deletedIds,
                    id,
                  ])
                )
              }
            } catch {}

            setQuestions((prev) => {
              const updated = prev.filter(
                (question) =>
                  question.id !== id
              )

              try {
                localStorage.setItem(
                  'feed_cache',
                  JSON.stringify(
                    updated.slice(0, 10)
                  )
                )
              } catch {}

              return updated
            })

            setNewQuestions((prev) =>
              prev.filter(
                (question) =>
                  question.id !== id
              )
            )
          }}
        />
        
      </div>
    ))}
  </div>
)}

          {loadingMore &&
  hasMore &&
  visibleQuestions.length > 0 && (
    <div
      style={{
        textAlign: 'center',
        padding: '16px 0',
        fontSize: 14,
        color: '#9CA3AF',
      }}
    >
      Loading more...
    </div>
)}

          {/* ✅ FIX 1 + FIX 2: Sentinel is inside <main>, after the list.
               No longer in a position:fixed container.
               Only rendered after load completes so observer
               doesn't fire into empty state. */}
         {loaded &&
  hasMore && (
    <div
      ref={loadMoreRefEl}
      style={{ height: 1 }}
    />
)}
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden lg:block sticky top-6 self-start pl-6 space-y-4">
          <div
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 16,
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: 'clamp(14px,1vw,16px)', fontWeight: 600, marginBottom: 8 }}>
              EP Stats
            </h3>
            <p style={{ fontSize: 'clamp(12px,0.9vw,14px)', opacity: 0.7 }}>
              More stats coming soon.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: 16,
              background: '#FFFFFF',
            }}
          >
            <h3 style={{ fontSize: 'clamp(14px,1vw,16px)', fontWeight: 600, marginBottom: 8 }}>
              Tips
            </h3>
            <p style={{ fontSize: 'clamp(12px,0.9vw,14px)', opacity: 0.7 }}>
              Answer more questions to earn more EP.
            </p>
          </div>
        </aside>

      </div>
    </div>
  )
}