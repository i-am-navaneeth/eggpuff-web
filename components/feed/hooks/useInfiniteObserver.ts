'use client'

import { useEffect } from 'react'

type Props = {
  loaded: boolean
  loadingMore: boolean

  loadMoreRefEl: React.RefObject<HTMLDivElement | null>

  observerRef: React.MutableRefObject<
    IntersectionObserver | null
  >

  hardLockRef: React.MutableRefObject<boolean>

  loadMoreRef: React.MutableRefObject<
    () => Promise<void>
  >

  hasMore: boolean
}

export function useInfiniteObserver({
  loaded,
  loadingMore,
  loadMoreRefEl,
  observerRef,
  hardLockRef,
  loadMoreRef,
  hasMore,
}: Props) {
  useEffect(() => {
    if (!loaded || !hasMore) return

    const el = loadMoreRefEl.current
    if (!el) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]

        if (
          !entry.isIntersecting ||
          hardLockRef.current ||
          loadingMore
        ) {
          return
        }

        await loadMoreRef.current()
      },
      {
        root: null,
        rootMargin: '600px 0px',
        threshold: 0,
      }
    )

    observerRef.current.observe(el)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [
    loaded,
    hasMore,
    loadingMore,
    loadMoreRefEl,
  ])
}