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
import { getSeen } from '@/lib/seen'

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
  type?: 'normal' | 'bubble' // 🔥 ADD THIS
  category_id: string | null
  approved_answer_id?: string | null
  categories?: { label: string }[]
  category_label?: string
  is_verified?: boolean
}

type Question = {
  user_id: string
  created_at: string
  batch_year?: string
  category_id?: string
  categories?: { label: string }[]
}

type Profile = {
  user_id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  college_id?: string
  is_verified?: boolean
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

// 🔥 ADD THIS HERE
const createProfileIfNotExists = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: profile } = await supabase
  .from('profiles')
  .select('user_id, name, username, avatar_url')
  .eq('user_id', user?.id)
  .maybeSingle()

  if (profile) return

}
  /* -------------------- LOAD DATA -------------------- */

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)

       await createProfileIfNotExists()

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
  .eq('user_id', user?.id)
  .single();

  // 🔥 STEP 1: get promotions
const { data: promoData } = await supabase
  .from('pyp_promotions')
  .select('link, user_id')
  .gt('expires_at', now)
  .order('started_at', { ascending: false })

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
let query = supabase
  .from('questions')
  .select(`
    id,
    text,
    created_at,
    expires_at,
    type,
    category_id,
    approved_answer_id,
    categories(label),
    college_id,
    batch_year,
    user_id
  `)
  .order('created_at', { ascending: false })

// 🔥 APPLY COLLEGE FILTER ONLY IF AVAILABLE
if (profileData?.college_id) {
  query = query.or(
    `college_id.eq.${profileData.college_id},college_id.is.null`
  )
}

const { data: qs, error } = await query

if (error) {
  console.error('❌ FETCH ERROR:', error)
}
console.log('QUESTION USER IDS:', (qs ?? []).map(q => q.user_id))

      if (!mounted) return

      // ✅ STEP 0: questions data
const questionsData: Question[] = (qs ?? []) as Question[]

// 🔥 STEP 1: sort questions
const sortedQuestions = questionsData.sort((a, b) => {
  if (a.batch_year === profileData?.batch_year && b.batch_year !== profileData?.batch_year) {
    return -1
  }
  if (a.batch_year !== profileData?.batch_year && b.batch_year === profileData?.batch_year) {
    return 1
  }
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
})

// 🔥 STEP 2: collect ALL userIds
const userIds: string[] = Array.from(
  new Set(
    sortedQuestions
      .map((q: any) => String(q.user_id))
      .filter((id: string) => id.length > 0)
  )
)


// 🔥 STEP 3: fetch profiles
let profiles: Profile[] = []

if (userIds.length > 0) {
  const { data, error } = await supabase
  .from('profiles')
  .select('user_id, name, username, avatar_url, is_verified')
  .in('user_id', userIds)

  if (error) {
    console.error('profiles fetch error FULL:', JSON.stringify(error, null, 2))
  } else {
    profiles = (data ?? []) as Profile[]
  }
}

console.log('PROFILES:', profiles)
console.log('USER IDS USED FOR FETCH:', userIds)

// ✅ PROFILE MAP (FIXED)
const profileMap: Record<string, Profile> = {}

profiles.forEach((p: Profile) => {
  if (p?.user_id) {
    const key = String(p.user_id).trim()

    profileMap[key] = {
  user_id: key,
  name: p.name,
  username: p.username,
  avatar_url: p.avatar_url,
  is_verified: p.is_verified,
}
  }
})

// ✅ STEP 4: fallback (no crash)
userIds.forEach(id => {
  if (!profileMap[id]) {
    profileMap[id] = {
  user_id: id, // ✅ REQUIRED
  name: 'User',
  username: 'user',
  avatar_url: null,
  college_id: undefined,
}
  }
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

// 🔥 FINAL MAPPING
setQuestions(
  sortedQuestions.map((q: Question) => {
    const profile = profileMap[String(q.user_id)] || null

    return {
      ...q,

      category_label: q.categories?.[0]?.label ?? null,

      user_name: profile?.name || 'User',
      username: profile?.username || 'user',
      avatar_url: profile?.avatar_url || null,
      is_verified: profile?.is_verified ?? false,
    }
  }) as any
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

  const seenIds = getSeen()

const visibleQuestions = questions
  .filter(q => {
    const currentTime = now

    // ❌ remove expired
    if (q.expires_at && new Date(q.expires_at) <= currentTime) {
      return false
    }

    // ✅ category filter
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

    // ✅ answer filter
    if (filter === 'answered') return !!q.approved_answer_id
    if (filter === 'unanswered') return !q.approved_answer_id

    return true
  })
  // 🔥 ALWAYS NEWEST FIRST
  .sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

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