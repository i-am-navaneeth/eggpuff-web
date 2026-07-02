/* ==========================================================
   EggPuff Navigation Selectors
   ----------------------------------------------------------
   Pure selectors for reading navigation state.

   Responsibilities:
   - Current
   - Previous
   - Root
   - Length
   - Empty
   - Can Go Back
   - Current Route

   No React.
   No Browser APIs.
========================================================== */

import type {
  NavigationEntry,
  NavigationState,
} from './types'

/* ==========================================================
   CURRENT
========================================================== */

export function currentNavigation(
  state: NavigationState
): NavigationEntry | null {
  if (state.stack.length === 0) {
    return null
  }

  return state.stack[
    state.stack.length - 1
  ]
}

/* ==========================================================
   PREVIOUS
========================================================== */

export function previousNavigation(
  state: NavigationState
): NavigationEntry | null {
  if (state.stack.length < 2) {
    return null
  }

  return state.stack[
    state.stack.length - 2
  ]
}

/* ==========================================================
   ROOT
========================================================== */

export function rootNavigation(
  state: NavigationState
): NavigationEntry | null {
  if (state.stack.length === 0) {
    return null
  }

  return state.stack[0]
}

/* ==========================================================
   LENGTH
========================================================== */

export function navigationLength(
  state: NavigationState
): number {
  return state.stack.length
}

/* ==========================================================
   EMPTY
========================================================== */

export function isNavigationEmpty(
  state: NavigationState
): boolean {
  return state.stack.length === 0
}

/* ==========================================================
   CAN GO BACK
========================================================== */

export function canGoBack(
  state: NavigationState
): boolean {
  return state.stack.length > 0
}

/* ==========================================================
   CURRENT ROUTE
========================================================== */

export function currentRoute(
  state: NavigationState
): string | null {
  return (
    currentNavigation(state)?.route ??
    null
  )
}

/* ==========================================================
   IS OPEN
========================================================== */

export function isNavigationOpen(
  state: NavigationState
): boolean {
  return state.stack.length > 0
}

/* ==========================================================
   PEEK
========================================================== */

export function peekNavigation(
  state: NavigationState,
  depth = 0
): NavigationEntry | null {
  const index =
    state.stack.length -
    1 -
    depth

  if (
    index < 0 ||
    index >= state.stack.length
  ) {
    return null
  }

  return state.stack[index]
}