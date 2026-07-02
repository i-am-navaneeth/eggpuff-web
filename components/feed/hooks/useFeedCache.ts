'use client'

import { useEffect } from 'react'

import type {
  QuestionRow,
} from '../types'

type Options = {
  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >

  setLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

export function useFeedCache({
  setQuestions,
  setLoading,
}: Options) {
  useEffect(() => {
    try {
      const cached =
        localStorage.getItem(
          'feed_cache'
        )

      if (!cached) return

      const parsed =
        JSON.parse(cached)

      if (!Array.isArray(parsed))
        return

      const deletedIds =
        JSON.parse(
          localStorage.getItem(
            'deleted_questions'
          ) || '[]'
        )

      const cleaned =
        parsed.filter(
          (q: any) =>
            !deletedIds.includes(
              q.id
            )
        )

      setQuestions(cleaned)

      setLoading(false)
    } catch (e) {
      console.warn(
        'cache parse failed',
        e
      )
    }
  }, [setQuestions, setLoading])
}

export default useFeedCache