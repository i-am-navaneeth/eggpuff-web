'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

import type {
  QuestionRow,
  CategoryWithCount,
} from '../types'

type Options = {
  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >
}

export function useFeedCache({
  setQuestions,
}: Options) {
  useEffect(() => {
  const loadCache = async () => {
    try {
      const {
  data: { session },
} = await supabase.auth.getSession()

const userId = session?.user?.id

if (!userId) return

const cacheKey =
  `feed_cache_${userId}`

const cached =
  localStorage.getItem(cacheKey)

if (!cached) return

const parsed = JSON.parse(cached)

if (!Array.isArray(parsed))
  return

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
    } catch (e) {
      console.warn(
        'cache parse failed',
        e
      )
    }
  }

  loadCache()
}, [setQuestions])
}

export default useFeedCache