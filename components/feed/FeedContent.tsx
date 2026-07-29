'use client'

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { openExternal } from '@/lib/openExternal'
import { supabase } from '@/lib/supabase'
import PromoteBanner from '@/components/PromoteBanner'
import QuestionFilterSheet from '@/components/QuestionFilterSheet'
import QuestionCard from '@/components/QuestionCard'
import CampusSpotlight from '@/components/feed/CampusSpotlight'
import QuestionCardSkeleton from '@/components/QuestionCardSkeleton'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '@/components/NotificationProvider'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { useNavigation } from '@/components/navigation/NavigationProvider'
import IPLScoreCard from '@/components/IPLScoreCard'
import type {
  CategoryWithCount,
  FilterType,
  QuestionRow,
} from './types'

import {
  getUserId,
} from './api'

import { useFeedClock } from './hooks/useFeedClock'
import {
  useFeedCache,
} from './hooks/useFeedCache'

import {
  useFeedRealtime,
} from './hooks/useFeedRealtime'

import {
  useFeedPagination,
} from './hooks/useFeedPagination'

import { useFeedInitialLoad } from './hooks/useFeedInitialLoad'
import { useVisibleQuestions } from './hooks/useVisibleQuestions'
import { useFeedRefresh } from './hooks/useFeedRefresh'
import { useInfiniteObserver } from './hooks/useInfiniteObserver'
import { completePypDiscovery } from '@/lib/completePypDiscovery'
import {
  buildFeedItems,
} from './utils/buildFeedItems'

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function FeedContent() {
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

  const now = useFeedClock()
  const [newQuestions, setNewQuestions] = useState<any[]>([])
  const [showNewBanner, setShowNewBanner] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] =
  useState(true)
  const [offset, setOffset] = useState(0)
  useEffect(() => {
  offsetRef.current = offset
}, [offset])

  const {
  openEditProfile,
} = useNavigation()
  const [userId, setUserId] = useState<string | null>(null)

  const questionsRef =
  useRef<QuestionRow[]>([])

  // ─── IntersectionObserver sentinel ──────────
  const loadMoreRefEl = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const offsetRef = useRef(0)

  const {
  hardLockRef,
  loadMoreRef,
  mergeBatch,
} = useFeedPagination({
  questions,
  loaded,
  hasMore,
  setHasMore,
  loadingMore,
  setLoadingMore,
  setQuestions,
  offsetRef,
  observerRef,
  setOffset,
})

useInfiniteObserver({
  loaded,
  loadingMore,
  hasMore,
  loadMoreRefEl,
  observerRef,
  hardLockRef,
  loadMoreRef,
})

  // ─────────────────────────────────────────────
  // Category param sync
  // ─────────────────────────────────────────────

  useEffect(() => {
    const param = searchParams.get('category') || 'all'
    setActiveCategorySlug(param)
  }, [searchParams.toString()])

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

useFeedCache({
  setQuestions,
  setLoading,
})

  // ─────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────

  useFeedInitialLoad({
  questions,
  loaded,

  mergeBatch,

  createProfileIfNotExists,

  setLoading,
  setUserId,
  setOffset,
  setHasMore,
  setLoaded,

  setPromoted,
  setCategories,
  setQuestions,
  setProfile,
  setProfileLoading,
})
  
useEffect(() => {
  questionsRef.current =
    questions
}, [questions])

const visibleQuestions =
  useVisibleQuestions({
    questions,
    now,
    activeCategorySlug,
    filter,
    categories,
  })

const feedItems = useMemo(
  () =>
    buildFeedItems({
      questions: visibleQuestions,
      promotions: promoted,
      interval: 6,
    }),
  [visibleQuestions, promoted]
)

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

useFeedRefresh({
  refreshing,
  setRefreshing,
  setQuestions,
  setOffset,
  setHasMore,
})

useFeedRealtime({
  questionsRef,
  setQuestions,
  setNewQuestions,
  setShowNewBanner,
})

useEffect(() => {
  const handleReturn = () => {
    if (document.visibilityState === 'visible') {
      completePypDiscovery()
    }
  }

  document.addEventListener(
    'visibilitychange',
    handleReturn
  )

  window.addEventListener(
    'focus',
    handleReturn
  )

  // Covers refresh / direct reopen
  completePypDiscovery()

  return () => {
    document.removeEventListener(
      'visibilitychange',
      handleReturn
    )

    window.removeEventListener(
      'focus',
      handleReturn
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
              {/* Filter temporarily hidden */}

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
{/* Categories temporarily hidden */}
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
  top: 72, // Keep it just below the Foundation header
  zIndex: 250, // Above feed, below dialogs/modals
  margin: '10px auto',
  width: 'fit-content',
  padding: '8px 14px',
  borderRadius: 999,
  background: '#111827',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(0,0,0,.18)',
}}
            >
              ↑ {newQuestions.length} new question{newQuestions.length > 1 ? 's' : ''}
            </div>
          )}
{/* Mobile top actions temporarily hidden */}

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
                onClick={() => {
  openEditProfile()
}}
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

          {/* Filter sheet temporarily hidden */}

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
    {feedItems.map((item, index) => {
  if (item.type === 'promotion') {
    return (
      <CampusSpotlight
        key={`promotion-${item.promotion.id}-${index}`}
        name={item.promotion.creator.name}
        avatar={item.promotion.creator.avatar_url}
        category={item.promotion.category}
        caption={item.promotion.caption}
        discoveries={item.promotion.discoveries}
        onClick={() => {
          console.log('Promotion:', item.promotion)

          openExternal(
            item.promotion.id,
            item.promotion.link
          )
        }}
      />
    )
  }

  const q = item.question

  return (
    <div key={`${q.id}-${q._missed ? 'missed' : 'normal'}`}>
      <div
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
                if (userId) {
                  localStorage.setItem(
                    `feed_cache_${userId}`,
                    JSON.stringify(
                      updated.slice(0, 10)
                    )
                  )
                }
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
    </div>
  )
})}
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