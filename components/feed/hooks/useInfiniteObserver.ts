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
}

export function useInfiniteObserver({
  loaded,
  loadingMore,
  loadMoreRefEl,
  observerRef,
  hardLockRef,
  loadMoreRef,
}: Props) {
  useEffect(() => {
    const el = loadMoreRefEl.current

    if (!el) return

    observerRef.current?.disconnect()

    observerRef.current =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0]

          if (
            entry.isIntersecting &&
            !hardLockRef.current &&
            !loadingMore
          ) {
            observerRef.current?.unobserve(
              entry.target
            )

            loadMoreRef.current()
          }
        },
        {
          root: null,
          rootMargin: '400px 0px',
          threshold: 0,
        }
      )

    observerRef.current.observe(el)

    return () =>
      observerRef.current?.disconnect()
  }, [
    loaded,
    loadingMore,
    hardLockRef,
    loadMoreRef,
    loadMoreRefEl,
    observerRef,
  ])
}