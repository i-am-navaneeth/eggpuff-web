/* ==========================================================
   EggPuff Navigation Actions
   ----------------------------------------------------------
   Factory functions for creating navigation actions.

   Responsibilities:
   - Strongly typed actions
   - No duplicated action objects
   - Single source of truth

   No React.
   No Browser APIs.
========================================================== */

import type {
  NavigationEntry,
} from './types'

import type {
  NavigationAction,
} from './navigationReducer'

/* ==========================================================
   OPEN
========================================================== */

export function openNavigation(
  entry: Omit<
    NavigationEntry,
    'id' | 'createdAt'
  >
): NavigationAction {
  return {
    type: 'OPEN',
    payload: entry,
  }
}

/* ==========================================================
   REPLACE
========================================================== */

export function replaceNavigation(
  entry: Omit<
    NavigationEntry,
    'id' | 'createdAt'
  >
): NavigationAction {
  return {
    type: 'REPLACE',
    payload: entry,
  }
}

/* ==========================================================
   CLOSE
========================================================== */

export function closeNavigation(): NavigationAction {
  return {
    type: 'CLOSE',
  }
}

/* ==========================================================
   CLEAR
========================================================== */

export function clearNavigation(): NavigationAction {
  return {
    type: 'CLEAR',
  }
}

/* ==========================================================
   POPSTATE
========================================================== */

export function popStateNavigation(): NavigationAction {
  return {
    type: 'POPSTATE',
  }
}