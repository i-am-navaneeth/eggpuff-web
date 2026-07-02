'use client'

import {
  ReactNode,
  useMemo,
  useReducer,
  useEffect,
  useCallback,
} from 'react'

import { useRouter } from 'next/navigation'

import {
  NavigationContext,
} from './NavigationContext'

import type {
  NavigationContextValue,
  NavigationEntry,
} from './types'

import {
  navigationReducer,
  initialNavigationState,
} from './navigationReducer'

import {
  openNavigation,
  replaceNavigation,
  closeNavigation,
  clearNavigation,
  popStateNavigation,
} from './actions'

import {
  currentNavigation,
  previousNavigation,
  isNavigationOpen,
} from './selectors'

import {
  pushHistory,
  replaceHistory,
  backHistory,
  subscribeHistory,
} from './history'

export function NavigationProvider({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()

  const [state, dispatch] =
    useReducer(
      navigationReducer,
      initialNavigationState
    )

  /* ==========================================================
     BROWSER HISTORY
  ========================================================== */

  useEffect(() => {
    return subscribeHistory(() => {
      dispatch(
        popStateNavigation()
      )
    })
  }, [])

  /* ==========================================================
     OPEN
  ========================================================== */

  const open = useCallback(
    (
      route: string,
      props?: unknown
    ) => {
      const entry: Omit<
        NavigationEntry,
        'id' | 'createdAt'
      > = {
        kind: 'custom',

        route,

        props,

        overlay: true,

        scrollY:
          typeof window !==
          'undefined'
            ? window.scrollY
            : 0,
      }

      dispatch(
        openNavigation(entry)
      )

      pushHistory(route)
console.log(
  'OPEN',
  route,
  state.stack.map(s => s.route)
)
    },
[router, state]
)

  /* ==========================================================
     REPLACE
  ========================================================== */

  const replace =
    useCallback(
      (
        route: string,
        props?: unknown
      ) => {
        const entry: Omit<
          NavigationEntry,
          'id' | 'createdAt'
        > = {
          kind: 'custom',

          route,

          props,

          overlay: true,

          scrollY:
            typeof window !==
            'undefined'
              ? window.scrollY
              : 0,
        }

        dispatch(
          replaceNavigation(
            entry
          )
        )

        pushHistory(route)
console.log(
  'REPLACE',
  route,
  state.stack.map(s => s.route)
)
     },
[router, state]
)

  /* ==========================================================
     CLOSE
  ========================================================== */

const close = useCallback(() => {
  // Don't dispatch here.
  // Browser back will fire popstate, which updates the stack.
  backHistory()
}, [])

  /* ==========================================================
     CLEAR
  ========================================================== */

  const clear =
    useCallback(() => {
      dispatch(
        clearNavigation()
      )
    }, [])

  /* ==========================================================
     HELPERS
  ========================================================== */

  const current =
    useCallback(
      () =>
        currentNavigation(
          state
        ),
      [state]
    )

  const previous =
    useCallback(
      () =>
        previousNavigation(
          state
        ),
      [state]
    )

  /* ==========================================================
     TYPED NAVIGATION
  ========================================================== */

 const openProfile =
  useCallback(
    (username: string) => {
      console.log("OPEN PROFILE CALLED")

      open(`/u/${username}`)
    },
    [open]
  )

  const openQuestion =
    useCallback(
      (
        questionId: string
      ) => {
        open(
          `/question/${questionId}`
        )
      },
      [open]
    )

 const openEditProfile =
  useCallback(() => {
    open('/profile')
  }, [open])

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const value =
    useMemo<NavigationContextValue>(
      () => ({
        navigationStack:
          state.stack,

        isOpen:
          isNavigationOpen(
            state
          ),

        currentRoute:
  currentNavigation(state)?.route ?? null,

        open,

        replace,

        close,

        clear,

        current,

        previous,

        openProfile,

        openQuestion,

        openEditProfile,
      }),
      [
        state,
        open,
        replace,
        close,
        clear,
        current,
        previous,
        openProfile,
        openQuestion,
        openEditProfile,
      ]
    )

  return (
    <NavigationContext.Provider
      value={value}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationProvider

export { useNavigation } from './useNavigation'