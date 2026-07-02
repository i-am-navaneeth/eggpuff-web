'use client'

import { useMemo } from 'react'

import type {
  CategoryWithCount,
  FilterType,
  QuestionRow,
} from '../types'

type Props = {
  questions: QuestionRow[]
  now: Date
  activeCategorySlug: string
  filter: FilterType
  categories: CategoryWithCount[]
}

export function useVisibleQuestions({
  questions,
  now,
  activeCategorySlug,
  filter,
  categories,
}: Props) {
  return useMemo(() => {
    return questions.filter((q) => {
      if (
        q.expires_at &&
        new Date(q.expires_at) <= now
      ) {
        return false
      }

      if (
        activeCategorySlug === 'general'
      ) {
        if (q.category_id !== null) {
          return false
        }
      } else if (
        activeCategorySlug !== 'all'
      ) {
        const cat = categories.find(
          (c) =>
            c.slug === activeCategorySlug
        )

        if (
          !cat ||
          q.category_id !== cat.id
        ) {
          return false
        }
      }

      if (filter === 'answered') {
        return !!q.approved_answer_id
      }

      if (filter === 'unanswered') {
        return !q.approved_answer_id
      }

      return true
    })
  }, [
    questions,
    now,
    activeCategorySlug,
    filter,
    categories,
  ])
}