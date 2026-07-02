/* ==========================================================
   EggPuff Navigation Stack
   ----------------------------------------------------------
   Pure stack algorithms.

   Responsibilities:
   - Push
   - Replace
   - Pop
   - Clear
   - Current
   - Previous
   - Length
   - Can Go Back

   No React.
   No Next.js.
   No Browser APIs.
========================================================== */

import type {
  NavigationEntry,
  NavigationState,
} from './types'

/* ==========================================================
   HELPERS
========================================================== */

export function createEntry(
  entry: Omit<
    NavigationEntry,
    'id' | 'createdAt'
  >
): NavigationEntry {
  return {
    ...entry,

    id:
      typeof crypto !== 'undefined' &&
      'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,

    createdAt: Date.now(),
  }
}

/* ==========================================================
   PUSH
========================================================== */

export function push(
  state: NavigationState,
  entry: Omit<
    NavigationEntry,
    'id' | 'createdAt'
  >
): NavigationState {
  return {
    stack: [
      ...state.stack,
      createEntry(entry),
    ],
  }
}

/* ==========================================================
   REPLACE
========================================================== */

export function replace(
  state: NavigationState,
  entry: Omit<
    NavigationEntry,
    'id' | 'createdAt'
  >
): NavigationState {
  if (state.stack.length === 0) {
    return push(state, entry)
  }

  const stack = [...state.stack]

  stack[
    stack.length - 1
  ] = createEntry(entry)

  return {
    stack,
  }
}

/* ==========================================================
   POP
========================================================== */

export function pop(
  state: NavigationState
): NavigationState {
  if (state.stack.length === 0) {
    return state
  }

  return {
    stack: state.stack.slice(
      0,
      -1
    ),
  }
}

/* ==========================================================
   CLEAR
========================================================== */

export function clear(): NavigationState {
  return {
    stack: [],
  }
}

/* ==========================================================
   CURRENT
========================================================== */

export function current(
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

export function previous(
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

export function root(
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

export function length(
  state: NavigationState
): number {
  return state.stack.length
}

/* ==========================================================
   EMPTY
========================================================== */

export function isEmpty(
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
   PEEK
========================================================== */

export function peek(
  state: NavigationState,
  indexFromTop = 0
): NavigationEntry | null {
  const index =
    state.stack.length -
    1 -
    indexFromTop

  if (
    index < 0 ||
    index >= state.stack.length
  ) {
    return null
  }

  return state.stack[index]
}