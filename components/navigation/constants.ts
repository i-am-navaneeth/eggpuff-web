/* ==========================================================
   EggPuff Navigation Reducer
   ----------------------------------------------------------
   Pure reducer for navigation state.

   Responsibilities:
   - Open
   - Replace
   - Close
   - Clear
   - Browser back sync

   No React.
   No Browser APIs.
   No Next.js.
========================================================== */

import type {
  NavigationEntry,
  NavigationState,
} from './types'

import {
  push,
  replace,
  pop,
  clear,
} from './stack'

/* ==========================================================
   ACTIONS
========================================================== */

export type NavigationAction =
  | {
      type: 'OPEN'
      payload: Omit<
        NavigationEntry,
        'id' | 'createdAt'
      >
    }
  | {
      type: 'REPLACE'
      payload: Omit<
        NavigationEntry,
        'id' | 'createdAt'
      >
    }
  | {
      type: 'CLOSE'
    }
  | {
      type: 'CLEAR'
    }
  | {
      type: 'POPSTATE'
    }

/* ==========================================================
   INITIAL STATE
========================================================== */

export const initialNavigationState: NavigationState =
  {
    stack: [],
  }

/* ==========================================================
   REDUCER
========================================================== */

export function navigationReducer(
  state: NavigationState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case 'OPEN':
      return push(
        state,
        action.payload
      )

    case 'REPLACE':
      return replace(
        state,
        action.payload
      )

    case 'CLOSE':
      return pop(state)

    case 'POPSTATE':
      return pop(state)

    case 'CLEAR':
      return clear()

    default:
      return state
  }
}