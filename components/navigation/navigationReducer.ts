/* ==========================================================
   EggPuff Navigation Reducer
   ----------------------------------------------------------
   Pure reducer for navigation state.

   Responsibilities:
   - OPEN
   - REPLACE
   - CLOSE
   - CLEAR
   - POPSTATE

   No React.
   No Browser APIs.
   No Next.js.
========================================================== */

import type {
  NavigationEntry,
  NavigationState,
} from './types'

import * as Stack from './stack'

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
      return Stack.push(
        state,
        action.payload
      )

    case 'REPLACE':
      return Stack.replace(
        state,
        action.payload
      )

    case 'CLOSE':
      return Stack.pop(state)

    case 'POPSTATE':
      return Stack.pop(state)

    case 'CLEAR':
      return Stack.clear()

    default:
      return state
  }
}