'use client'

import {
  useCallback,
  useEffect,
  useRef,
} from 'react'

import {
  fetchPage,
  getUserId,
} from '../api'

import {
  PAGE_SIZE,
} from '../constants'

import type {
  QuestionRow,
} from '../types'

type Props = {
  questions: QuestionRow[]

  loaded: boolean

  hasMore: boolean

  setHasMore: React.Dispatch<
    React.SetStateAction<boolean>
  >

  loadingMore: boolean

  setLoadingMore: React.Dispatch<
    React.SetStateAction<boolean>
  >

  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >

  offsetRef: React.MutableRefObject<number>

  observerRef: React.MutableRefObject<IntersectionObserver | null>

  setOffset: React.Dispatch<
    React.SetStateAction<number>
  >
}

export function useFeedPagination({
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
}: Props) {

  const hardLockRef =
    useRef(false)

  const mergeBatch =
    useCallback(
      (batch: QuestionRow[]) => {
        setQuestions(prev => {
          const map =
            new Map<
              string,
              QuestionRow
            >()

          for (const q of prev) {
            map.set(q.id, q)
          }

          let added = 0

          for (const q of batch) {
            if (!map.has(q.id)) {
              map.set(q.id, q)
              added++
            }
          }

          if (added > 0) {
            setOffset(
              prev => prev + PAGE_SIZE
            )

            offsetRef.current +=
              PAGE_SIZE
          }

          return Array.from(
            map.values()
          )
        })
      },
      [
        setQuestions,
        setOffset,
        offsetRef,
      ]
    )

  const loadMore =
    useCallback(async () => {

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
        const userId =
          await getUserId()

        if (!userId) return

        const batch =
          await fetchPage(
            userId,
            offsetRef.current
          )

        if (batch.length === 0) {
          setHasMore(false)

          observerRef.current?.disconnect()

          return
        }

        if (
          batch.length <
          PAGE_SIZE
        ) {
          setHasMore(false)
        }

        mergeBatch(batch)

      } finally {

        setLoadingMore(false)

        hardLockRef.current =
          false
      }

    }, [
      loaded,
      hasMore,
      observerRef,
      offsetRef,
      mergeBatch,
      setHasMore,
      setLoadingMore,
    ])

  const loadMoreRef =
    useRef(loadMore)

  useEffect(() => {
    loadMoreRef.current =
      loadMore
  })

  return {
    hardLockRef,
    loadMoreRef,
    mergeBatch,
  }
}