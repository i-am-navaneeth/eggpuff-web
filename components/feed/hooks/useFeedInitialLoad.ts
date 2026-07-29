'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import type {
  Category,
  CategoryWithCount,
  QuestionRow,
} from '../types'

import { PAGE_SIZE } from '../constants'

import { saveLastVisit } from '../utils'

import { saveLaunchCache } from '../launchCache'

type Props = {
  questions: QuestionRow[]
  loaded: boolean

  mergeBatch: (batch: QuestionRow[]) => void

  createProfileIfNotExists: () => Promise<void>

  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setUserId: React.Dispatch<React.SetStateAction<string | null>>
  setOffset: React.Dispatch<React.SetStateAction<number>>
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>

  setPromoted: React.Dispatch<React.SetStateAction<any[]>>

  setCategories: React.Dispatch<
    React.SetStateAction<CategoryWithCount[]>
  >

  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >

  setProfile: React.Dispatch<any>

  setProfileLoading:
    React.Dispatch<
      React.SetStateAction<boolean>
    >

}

export function useFeedInitialLoad({
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
}: Props) {

  const router = useRouter()

useEffect(() => {

let mounted = true

    const load = async () => {
      
      if (!questions.length && !loaded) setLoading(true)

      createProfileIfNotExists()

      

const sessionRes = await supabase.auth.getSession()


const user = sessionRes.data?.session?.user

setUserId(user?.id ??null)


// 🚀 Fetch everything in parallel


const [
  profileRes,
  feedRes,
  catsRes,
  promoRes,
] = await Promise.all([

  supabase
    .from('profiles')
    .select('college_id, batch_year')
    .eq('user_id', user?.id)
    .single(),

  supabase.rpc('get_smart_feed', {
    p_user_id: user?.id,
    p_limit: PAGE_SIZE,
    p_offset: 0,
  }),

  supabase
    .from('categories')
    .select('id, slug, label')
    .order('created_at', {
      ascending: true,
    }),

  supabase
  .from('pyp_promotions')
  .select(`
    id,
    user_id,
    category,
    link,
    caption,
    discoveries_delivered,
    click_count,
    status
  `)
  .eq('status', 'active')
  .order('started_at', {
    ascending: false,
  }),
])


const profile = profileRes.data

if (!mounted) return

const onboardingComplete =
  !!profile?.college_id &&
  !!profile?.batch_year

if (!onboardingComplete) {
  router.replace('/profile')
  return
}

const questionsData =
  (feedRes.data ?? []) as QuestionRow[]



mergeBatch(questionsData)

const creatorIds = [
  ...new Set(
    (promoRes.data ?? []).map((p: any) => p.user_id)
  ),
]

const { data: creatorProfiles } = await supabase
  .from('profiles')
  .select(`
    user_id,
    name,
    username,
    avatar_url,
    is_verified,
    streak_count,
    college_id
  `)
  .in('user_id', creatorIds)

const creatorMap: Record<string, any> = {}

;(creatorProfiles ?? []).forEach((creator: any) => {
  creatorMap[creator.user_id] = creator
})

// mergeBatch already advances the offset.
// Don't manually set it again.
setHasMore(questionsData.length === PAGE_SIZE)

saveLastVisit()

      // ✅ FIX 2: Set loaded=true AFTER data is in state
      //    This unblocks loadMore and re-triggers the observer
      setLoaded(true)

      setTimeout(() => {
       
        if (!mounted) return

        const nowTime = Date.now()

const promoItems: any[] = []

;(promoRes.data ?? []).forEach((p: any) => {
  const creator = creatorMap[p.user_id]

  if (!creator) return

  if (creator.college_id !== profile?.college_id)
    return

  promoItems.push({
    id: p.id,
    category: p.category,
    link: p.link,
    caption: p.caption,
    discoveries:
      p.discoveries_delivered ?? 0,
    clicks:
      p.click_count ?? 0,
    creator,
  })
})

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
        setProfile(profile)
        setProfileLoading(false)
        try {
  if (user?.id) {
    saveLaunchCache(user.id, {
      categories: categoriesWithCount,
      promoted: promoItems,
    })
  }
} catch (err) {
  console.warn(
    'Failed to save launch cache',
    err
  )
}
  try {
  const deletedIds = JSON.parse(
    localStorage.getItem(
      'deleted_questions'
    ) || '[]'
  )

  const cleaned = questionsData.filter(
    (q: any) => !deletedIds.includes(q.id)
  )

  if (user?.id) {
    localStorage.setItem(
      `feed_cache_${user.id}`,
      JSON.stringify(cleaned)
    )
  }
} catch (err) {
  console.warn(
    'Failed to save feed cache',
    err
  )
}

}, 0)
    }

    load()

return () => {
mounted = false

sessionStorage.setItem(
'feed_scroll',
String(window.scrollY)
)

}

}, [])

}