'use client'

import {
  useCallback,
  useEffect,
} from 'react'

import { supabase } from '@/lib/supabase'

import type {
  QuestionRow,
} from '../types'

import {
  PAGE_SIZE,
} from '../constants'

import {
  getUserId,
} from '../api'

type Props = {
  refreshing: boolean

  setRefreshing: React.Dispatch<
    React.SetStateAction<boolean>
  >

  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >

  setOffset: React.Dispatch<
    React.SetStateAction<number>
  >

  setHasMore: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

export function useFeedRefresh({
  refreshing,
  setRefreshing,
  setQuestions,
  setOffset,
  setHasMore,
}: Props) {
  const refreshFeed =
    useCallback(async () => {
      if (refreshing) return

      setRefreshing(true)

      try {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })

        const userId =
          await getUserId()

        const { data } =
          await supabase.rpc(
            'get_smart_feed',
            {
              p_user_id: userId,
              p_limit: PAGE_SIZE,
              p_offset: 0,
            }
          )

        const fresh =
          (data ??
            []) as QuestionRow[]

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

        setOffset(PAGE_SIZE)

        setHasMore(
          fresh.length === PAGE_SIZE
        )

       try {
  const deletedIds = JSON.parse(
    localStorage.getItem(
      'deleted_questions'
    ) || '[]'
  )

  const cleaned = fresh.filter(
    (q: any) =>
      !deletedIds.includes(q.id)
  )

  if (userId) {
    localStorage.setItem(
      `feed_cache_${userId}`,
      JSON.stringify(cleaned)
    )
  }
} catch (err) {
  console.warn(
    'Failed to save feed cache',
    err
  )
}
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
    }, [
      refreshing,
      setRefreshing,
      setQuestions,
      setOffset,
      setHasMore,
    ])

  useEffect(() => {
    const handleRefresh = () => {
      refreshFeed()

      setOffset(0)

      setHasMore(true)
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
  }, [
    refreshFeed,
    setOffset,
    setHasMore,
  ])
}