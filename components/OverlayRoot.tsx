'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  usePathname,
  useRouter,
} from 'next/navigation'

import { useNavigation } from '@/components/navigation/NavigationProvider'

import ProfileOverlay from './overlays/ProfileOverlay'
import QuestionOverlay from './overlays/QuestionOverlay'
import EditProfileOverlay from './overlays/EditProfileOverlay'

export default function OverlayRoot() {
 
  const pathname = usePathname() 
  const router = useRouter()

  const {
    navigationStack,
  } = useNavigation()

  const [readerTransition, setReaderTransition] =
    useState<{
      title: string
      resourceId: string
    } | null>(null)

  useEffect(() => {
  const handler = (e: Event) => {
    const detail =
      (e as CustomEvent).detail

    if (
      !detail?.resourceId ||
      !detail?.title
    ) {
      return
    }

    // Show the reader transition immediately
    setReaderTransition({
      title: detail.title,
      resourceId: detail.resourceId,
    })

    // Give the transition time to appear
    // before navigating to the actual reader.
    const timer = window.setTimeout(() => {
      router.push(
        `/reader/${detail.resourceId}`
      )
    }, 320)

    return () => {
      window.clearTimeout(timer)
    }
  }

  window.addEventListener(
  'ep-open-reader',
  handler
)

return () => {
  window.removeEventListener(
    'ep-open-reader',
    handler
  )
}
}, [router])

  useEffect(() => {

    if (
      pathname.startsWith('/reader/')
    ) {
      setReaderTransition(null)
    }

  }, [pathname])

  if (readerTransition) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: '#fff',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          animation:
            'fadeIn .22s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 320,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 54,
              marginBottom: 18,
            }}
          >
            📖
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              lineHeight: 1.4,
            }}
          >
            {readerTransition.title}
          </div>

          <div
            style={{
              marginTop: 18,
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            Opening Reader...
          </div>
        </div>
      </div>
    )
  }

    /*
   * ==========================================================
   * NAVIGATION OVERLAY STACK
   *
   * Keep previous overlays mounted.
   *
   * /u/john
   *   ↓
   * /question/123
   *
   * becomes:
   *
   * ProfileOverlay
   * QuestionOverlay
   *
   * The question sits above the profile while the profile
   * remains mounted with its scroll position and state.
   * ==========================================================
   */

  if (navigationStack.length > 0) {
    return (
      <>
        {navigationStack.map((entry) => {
          const route = entry.route

          if (route.startsWith('/u/')) {
            return (
              <ProfileOverlay
                key={entry.id}
                username={route.replace('/u/', '')}
              />
            )
          }

          if (route === '/profile') {
            return (
              <EditProfileOverlay
                key={entry.id}
              />
            )
          }

          if (route.startsWith('/question/')) {
            return (
              <QuestionOverlay
                key={entry.id}
                questionId={route.replace('/question/', '')}
              />
            )
          }

          return null
        })}
      </>
    )
  }

  return null
}