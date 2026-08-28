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

  observerRef: React.MutableRefObject<
    IntersectionObserver | null
  >

  feedSnapshotRef: React.MutableRefObject<
    string | null
  >

  cursorScoreRef: React.MutableRefObject<
    number | null
  >

  cursorIdRef: React.MutableRefObject<
    string | null
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
  observerRef,
  feedSnapshotRef,
  cursorScoreRef,
  cursorIdRef,
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

          for (const q of batch) {
            if (!map.has(q.id)) {
              map.set(q.id, q)
            }
          }

          return Array.from(
            map.values()
          )
        })
      },
      [setQuestions]
    )

  const loadMore =
    useCallback(async () => {

      if (
        hardLockRef.current ||
        !loaded ||
        !hasMore ||
        loadingMore
      ) {
        return
      }

      hardLockRef.current = true

      setLoadingMore(true)

      try {

        const userId =
          await getUserId()

        if (!userId) {
          return
        }

        const batch =
          await fetchPage(
            userId,
            feedSnapshotRef.current,
            cursorScoreRef.current,
            cursorIdRef.current
          )

        if (batch.length === 0) {

          setHasMore(false)

          observerRef.current?.disconnect()

          return
        }

        mergeBatch(batch)

        /*
         * The database returns feed_snapshot_at
         * on every row. Keep the first valid snapshot.
         */
        if (
          !feedSnapshotRef.current &&
          batch[0]?.feed_snapshot_at
        ) {
          feedSnapshotRef.current =
            batch[0].feed_snapshot_at
        }

        /*
         * Keyset cursor:
         * the last row becomes the cursor
         * for the next page.
         */
        const last =
          batch[batch.length - 1]

        cursorScoreRef.current =
          last.total_score

        cursorIdRef.current =
          last.id

        /*
         * If fewer than PAGE_SIZE rows came back,
         * there is nothing more to load.
         */
        if (batch.length < PAGE_SIZE) {
          setHasMore(false)

          observerRef.current?.disconnect()
        }

      } finally {

        setLoadingMore(false)

        hardLockRef.current =
          false
      }

    }, [
      loaded,
      hasMore,
      loadingMore,
      observerRef,
      feedSnapshotRef,
      cursorScoreRef,
      cursorIdRef,
      mergeBatch,
      setHasMore,
      setLoadingMore,
    ])

  const loadMoreRef =
    useRef(loadMore)

  useEffect(() => {
    loadMoreRef.current =
      loadMore
  }, [loadMore])

  return {
    hardLockRef,
    loadMoreRef,
    mergeBatch,
  }
}