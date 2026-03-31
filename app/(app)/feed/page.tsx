'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import PromoteBanner from '../../../components/PromoteBanner'
import QuestionFilterSheet from '../../../components/QuestionFilterSheet'
import QuestionCard from '../../../components/QuestionCard'
import QuestionCardSkeleton from '@/components/QuestionCardSkeleton'
import Skeleton from '@/components/Skeleton'
import { useNotify } from '../../../components/NotificationProvider'

import IPLScoreCard from '@/components/IPLScoreCard'

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
  category_id: string | null
  approved_answer_id?: string | null
  categories?: { label: string }[]
  category_label?: string
}

export default function FeedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notify } = useNotify()

  /* -------------------- STATE -------------------- */

  const [promoted, setPromoted] = useState<any[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [loading, setLoading] = useState(true)

  const [activeCategorySlug, setActiveCategorySlug] =
    useState<string>('all')

  const [filter, setFilter] = useState<FilterType>('all')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  
  const [profile, setProfile] = useState<any>(null);
  const isProfileComplete = !!profile?.college_id && !!profile?.batch_year;

  const [now, setNow] = useState(new Date())
  /* ---------------- SYNC CATEGORY FROM URL ---------------- */

  useEffect(() => {
    const param = searchParams.get('category')

    if (!param) {
      setActiveCategorySlug('all')
      return
    }

    setActiveCategorySlug(param)
  }, [searchParams])
  
useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date())
  }, 60000) // every 1 min

  return () => clearInterval(interval)
}, [])
  /* -------------------- LOAD DATA -------------------- */

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)

      const now = new Date().toISOString()

      const { data: cats } = await supabase
        .from('categories')
        .select('id, slug, label')
        .order('created_at', { ascending: true })

      // 🧠 Get current user profile
const {
  data: { user },
} = await supabase.auth.getUser()

const { data: profileData } = await supabase
  .from('profiles')
  .select('college_id, batch_year')
  .eq('id', user?.id)
  .single();

  // 🔥 STEP 1: get promotions
const { data: promoData } = await supabase
  .from('pyp_promotions')
  .select('link, user_id')
  .gt('expires_at', now)
  .order('started_at', { ascending: false })

// 🔥 STEP 2: get all user_ids
const userIds = promoData?.map(p => p.user_id) || []

// 🔥 STEP 3: fetch profiles separately
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, name, username, avatar_url, college_id')
  .in('id', userIds)

// 🔥 STEP 4: map profiles
const profileMap: Record<string, any> = {}
profiles?.forEach(p => {
  profileMap[p.id] = p
})

// 🔥 STEP 5: filter + merge
const promoItems =
  promoData
    ?.map(p => ({
      link: p.link,
      creator: profileMap[p.user_id],
    }))
    .filter(p =>
      p.creator?.college_id === profileData?.college_id
    ) || []

setProfile(profileData);

// 🚀 Fetch questions (same college only)
const { data: qs } = await supabase
  .from('questions')
  .select(`
    id,
    text,
    created_at,
    expires_at,
    category_id,
    approved_answer_id,
    categories(label),
    college_id,
    batch_year
  `)
  .eq('college_id', profileData?.college_id)
  .gt('expires_at', now)
  .order('created_at', { ascending: false })

      if (!mounted) return

      const questionsData = qs || []
      // 🔥 Batch priority boost
const sortedQuestions = questionsData.sort((a, b) => {
  if (a.batch_year === profileData?.batch_year && b.batch_year !== profile?.batch_year) {
    return -1
  }
  if (a.batch_year !== profileData?.batch_year && b.batch_year === profile?.batch_year) {
    return 1
  }
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
})

      const categoriesData = cats || []

      const countsMap: Record<string, number> = {}
      let generalCount = 0

      questionsData.forEach(q => {
        if (!q.category_id) {
          generalCount++
        } else {
          countsMap[q.category_id] =
            (countsMap[q.category_id] || 0) + 1
        }
      })

      const categoriesWithCount: CategoryWithCount[] =
        categoriesData.map(cat => ({
          ...cat,
          activeCount: countsMap[cat.id] || 0,
        }))

      categoriesWithCount.unshift({
        id: 'general',
        slug: 'general',
        label: 'General',
        activeCount: generalCount,
      })

      setPromoted(promoItems)

      setQuestions(
  sortedQuestions.map(q => ({
          ...q,
          category_label: q.categories?.[0]?.label,
        }))
      )

      setCategories(categoriesWithCount)
      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  /* -------------------- DERIVED -------------------- */

  const visibleQuestions = questions.filter(q => {
    const currentTime = now

    if (q.expires_at && new Date(q.expires_at) <= currentTime) {
      return false
    }

    if (activeCategorySlug === 'all') {
    }
    else if (activeCategorySlug === 'general') {
      if (q.category_id !== null) return false
    }
    else {
      const cat = categories.find(
        c => c.slug === activeCategorySlug
      )
      if (!cat || q.category_id !== cat.id) return false
    }

    if (filter === 'answered') return !!q.approved_answer_id
    if (filter === 'unanswered') return !q.approved_answer_id

    return true
  })

  /* -------------------- HANDLERS -------------------- */

  const handleCategoryClick = (slug: string) => {
    setActiveCategorySlug(slug)
    router.push(`/feed?category=${slug}`)
  }

  const handleCreateCategory = () => {
    notify('🚧 Category creation coming soon!')
  }

  const openFilterSheet = () => setFilterSheetOpen(true)
  const closeFilterSheet = () => setFilterSheetOpen(false)

  const filterLabel =
    filter === 'all'
      ? 'Filter'
      : filter === 'unanswered'
      ? 'Unanswered'
      : 'Answered'

  /* -------------------- UI -------------------- */

  return (
    <div className="pt-1">

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_minmax(50px,10fr)_200px] w-full max-w-[1200px] mx-auto pt-0 gap-6">

        {/* LEFT PANEL */}
        <aside className="hidden lg:block sticky top-6 self-start h-fit pr-6 border-r border-gray-200">

          {loading && (
            <div style={{ marginTop: 16  }}>
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
                onClick={() => handleCategoryClick('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border:
                    activeCategorySlug === 'all'
                      ? '1px solid #F4B860'
                      : '1px solid #E5E7EB',
                  background:
                    activeCategorySlug === 'all'
                      ? '#FFF7ED'
                      : '#FFFFFF',
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
                    border:
                      activeCategorySlug === cat.slug
                        ? '1px solid #F4B860'
                        : '1px solid #E5E7EB',
                    background:
                      activeCategorySlug === cat.slug
                        ? '#FFF7ED'
                        : '#FFFFFF',
                    fontSize: 'clamp(13px,0.9vw,15px)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    flexShrink: '0',
                  }}
                >
                  {cat.label}

                  {cat.activeCount > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 12,
                        opacity: 0.6,
                      }}
                    >
                      {cat.activeCount}
                    </span>
                  )}
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
                  onClick={() => handleCategoryClick('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border:
                      activeCategorySlug === 'all'
                        ? '1px solid #F4B860'
                        : '1px solid #E5E7EB',
                    background:
                      activeCategorySlug === 'all'
                        ? '#FFF7ED'
                        : '#FFFFFF',
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
                      border:
                        activeCategorySlug === cat.slug
                          ? '1px solid #F4B860'
                          : '1px solid #E5E7EB',
                      background:
                        activeCategorySlug === cat.slug
                          ? '#FFF7ED'
                          : '#FFFFFF',
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

            {!loading && !isProfileComplete && (
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
    <span>
      Complete your profile to unlock features 🚀
    </span>

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

          {loading &&
            [1,2,3,4,5].map(i => (
              <QuestionCardSkeleton key={i}/>
            ))}

          {!loading && promoted.length > 0 && (
            <PromoteBanner links={promoted}/>
          )}

         

          {filterSheetOpen && (
            <QuestionFilterSheet
              value={filter}
              onChange={val=>{
                setFilter(val)
                setFilterSheetOpen(false)
              }}
              onClose={closeFilterSheet}
            />
          )}

          {!loading && visibleQuestions.length === 0 && (
            <p style={{marginTop:40,textAlign:'center',opacity:0.6}}>
              No questions yet — be the first to ask 👀
            </p>
          )}

          {!loading &&
            visibleQuestions.map(q => (
              <QuestionCard key={q.id} q={q}/>
            ))}

        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden lg:block sticky top-6 self-start pl-6 space-y-4">

          <div
            style={{
              border:'1px solid #E5E7EB',
              borderRadius:12,
              padding:16,
              background:'#FFFFFF',
              boxShadow:'0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{fontSize:'clamp(14px,1vw,16px)',fontWeight:600,marginBottom:8}}>
              EP Stats
            </h3>
            <p style={{fontSize:'clamp(12px,0.9vw,14px)',opacity:0.7}}>
              More stats coming soon.
            </p>
          </div>

          <div
            style={{
              border:'1px solid #E5E7EB',
              borderRadius:12,
              padding:16,
              background:'#FFFFFF',
            }}
          >
            <h3 style={{fontSize:'clamp(14px,1vw,16px)',fontWeight:600,marginBottom:8}}>
              Tips
            </h3>
            <p style={{fontSize:'clamp(12px,0.9vw,14px)',opacity:0.7}}>
              Answer more questions to earn more EP.
            </p>
          </div>

        </aside>

      </div>
    </div>
  )
}