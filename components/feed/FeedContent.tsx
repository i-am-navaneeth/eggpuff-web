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

import ExploreIntro from './ExploreIntro'

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
const isProfileComplete =
  !!profile?.college_id && !!profile?.batch_year

// ─── Approved college discovery ───────────────
const [approvedCollege, setApprovedCollege] = useState<any>(null)
const [showCollegeBanner, setShowCollegeBanner] = useState(false)
const [joiningCollege, setJoiningCollege] = useState(false)

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

  const feedSnapshotRef =
  useRef<string | null>(null)

const cursorScoreRef =
  useRef<number | null>(null)

const cursorIdRef =
  useRef<string | null>(null)

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
  observerRef,

  feedSnapshotRef,
  cursorScoreRef,
  cursorIdRef,
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

  feedSnapshotRef,
  cursorScoreRef,
  cursorIdRef,
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
    }),
  [visibleQuestions, promoted]
)

const showExploreMode =
  !profileLoading &&
  !profile?.college_id

// ─────────────────────────────────────────────
// Approved College Discovery
// ─────────────────────────────────────────────

useEffect(() => {
  if (profileLoading || !profile || profile.college_id || !userId) {
    setShowCollegeBanner(false)
    return
  }

  const checkApprovedCollege = async () => {
    try {
      // Find this user's approved college request
      const { data: request, error: requestError } =
        await supabase
          .from('college_requests')
          .select('id, name, status')
          .eq('requested_by', userId)
          .eq('status', 'approved')
          .order('created_at', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle()

      if (requestError) {
        console.error(
          'APPROVED COLLEGE REQUEST ERROR:',
          requestError
        )
        return
      }

      if (!request) {
        setShowCollegeBanner(false)
        return
      }

      // Find the actual college that admin created
      const { data: college, error: collegeError } =
        await supabase
          .from('colleges')
          .select('id, name')
          .eq('name', request.name)
          .maybeSingle()

      if (collegeError) {
        console.error(
          'APPROVED COLLEGE LOOKUP ERROR:',
          collegeError
        )
        return
      }

      if (!college) {
        setShowCollegeBanner(false)
        return
      }

      setApprovedCollege(college)
      setShowCollegeBanner(true)
    } catch (error) {
      console.error(
        'CHECK APPROVED COLLEGE ERROR:',
        error
      )
    }
  }

  checkApprovedCollege()

}, [profileLoading, profile, userId])

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────

const handleNotThisCollege = () => {
  setShowCollegeBanner(false)

  // Tell the profile page where to scroll
  sessionStorage.setItem(
    'eggpuff_scroll_to_college',
    'true'
  )

  notify(
    '✏️ Let’s update your college name.'
  )

  router.push('/profile')
}

 const joinApprovedCollege = async () => {
  if (
    !userId ||
    !approvedCollege ||
    joiningCollege
  ) {
    return
  }

  setJoiningCollege(true)

  try {
    // 1. Attach the user to the new college
    const { error } = await supabase
      .from('profiles')
      .update({
        college_id: approvedCollege.id,
      })
      .eq('user_id', userId)

    if (error) {
      console.error(
        'JOIN COLLEGE ERROR:',
        error
      )
      notify('❌ Failed to join college')
      setJoiningCollege(false)
      return
    }

    // 2. Clear stale local feed/profile setup data
    // so the feed rebuilds for the newly joined college.
    try {
      localStorage.removeItem(`feed_cache_${userId}`)
      localStorage.removeItem(`feed_launch_cache_${userId}`)
      localStorage.removeItem('eggpuff_profile_setup_completed')
    } catch (error) {
      console.warn(
        'Failed to clear local feed cache:',
        error
      )
    }

    // 3. Update local profile immediately
    setProfile((prev: any) => ({
      ...prev,
      college_id: approvedCollege.id,
    }))

    // 4. Hide the discovery banner
    setShowCollegeBanner(false)

    notify(
      `🎉 Welcome to ${approvedCollege.name}!`
    )

    // 5. Reload the feed so the newly joined
    // college's questions appear immediately.
    window.location.reload()

  } catch (error) {
    console.error(
      'JOIN COLLEGE ERROR:',
      error
    )

    notify('❌ Failed to join college')
  } finally {
    setJoiningCollege(false)
  }
}

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

          {/* 🎓 APPROVED COLLEGE DISCOVERY */}
{showCollegeBanner && approvedCollege && (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 18,
      padding: '22px 20px',
      borderRadius: 20,
      background:
        'linear-gradient(135deg, #FFF8E8 0%, #FFFDF7 100%)',
      border: '1px solid rgba(244,184,96,0.35)',
      boxShadow:
        '0 8px 30px rgba(244,184,96,0.12)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -30,
        right: -20,
        fontSize: 100,
        opacity: 0.08,
        pointerEvents: 'none',
      }}
    >
      🎓
    </div>

    <div
      style={{
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#B7791F',
          marginBottom: 6,
          letterSpacing: 0.2,
        }}
      >
        🎉 GOOD NEWS
      </div>

      <div
        style={{
          fontSize: 21,
          fontWeight: 800,
          color: '#111827',
          marginBottom: 5,
        }}
      >
        Your college is here!
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          color: '#6B7280',
          marginBottom: 16,
        }}
      >
        {approvedCollege.name} is now live on EggPuff.
      </div>

            <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={joinApprovedCollege}
          disabled={joiningCollege}
          style={{
            border: 'none',
            borderRadius: 999,
            padding: '11px 20px',
            background: joiningCollege
              ? '#E5E7EB'
              : '#F4B860',
            color: '#111827',
            fontSize: 14,
            fontWeight: 800,
            cursor: joiningCollege
              ? 'default'
              : 'pointer',
            transition:
              'transform 0.15s ease, opacity 0.15s ease',
            opacity: joiningCollege ? 0.7 : 1,
          }}
        >
          {joiningCollege
            ? 'Joining…'
            : 'Join now →'}
        </button>

        <button
          onClick={handleNotThisCollege}
          disabled={joiningCollege}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '8px 4px',
            color: '#6B7280',
            fontSize: 13,
            fontWeight: 600,
            cursor: joiningCollege
              ? 'default'
              : 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            opacity: joiningCollege ? 0.5 : 1,
          }}
        >
          Not my college
        </button>
      </div>
    </div>
  </div>
)}

{/* Mobile top actions temporarily hidden */}

          {/* IPL SCOREBOARD */}
          {/* <IPLScoreCard /> */}

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

       {!loading && !profileLoading && (
  <div
    style={{
      position: 'relative',
      width: '100%',
    }}
  >
    {/* =========================================================
        EXPLORE MODE

        Only users WITHOUT a college see Explore.

        Users with a college go directly to the normal feed.
       ========================================================= */}

    {showExploreMode && (
  <div
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 3,
      width: '100%',
      height: '80svh',
      pointerEvents: 'auto',
    }}
  >
    <ExploreIntro />
  </div>
)}

    {/* =========================================================
        NORMAL FEED
       ========================================================= */}

    <div
      className="space-y-3"
      style={{
        position: 'relative',
        zIndex: 2,

        /*
         * Only create the Explore overlap when
         * the user has NO college.
         *
         * College users get a completely normal feed.
         */
        marginTop:
          showExploreMode
            ? '-80svh'
            : 0,

        paddingTop:
          showExploreMode
            ? '80svh'
            : 0,
      }}
    >
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
                console.log(
                  'Promotion:',
                  item.promotion
                )

                openExternal(
  item.promotion.id,
  item.promotion.link,
  notify
)
              }}
            />
          )
        }

        const q = item.question

        return (
          <div
            key={`${q.id}-${q._missed ? 'missed' : 'normal'}`}
          >
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
                    const deletedIds =
                      JSON.parse(
                        localStorage.getItem(
                          'deleted_questions'
                        ) || '[]'
                      )

                    if (
                      !deletedIds.includes(id)
                    ) {
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
                    const updated =
                      prev.filter(
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