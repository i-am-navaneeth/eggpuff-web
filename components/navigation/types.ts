/* ==========================================================
   EggPuff Navigation Types
   ----------------------------------------------------------
   Single source of truth for the navigation system.
========================================================== */

export type NavigationKind =
  | 'page'
  | 'profile'
  | 'question'
  | 'edit-profile'
  | 'community'
  | 'resource'
  | 'browser'
  | 'search'
  | 'notifications'
  | 'chat'
  | 'custom'

/* ==========================================================
   STACK ENTRY
========================================================== */

export interface NavigationEntry {
  /**
   * Unique stack id.
   */
  id: string

  /**
   * Route category.
   */
  kind: NavigationKind

  /**
   * Canonical route.
   *
   * Example:
   * /u/john
   * /question/123
   */
  route: string

  /**
   * Optional payload.
   */
  params?: Record<
    string,
    unknown
  >

  /**
   * Legacy props support.
   * (Kept for backwards compatibility.)
   */
  props?: unknown

  /**
   * Whether displayed as overlay.
   */
  overlay: boolean

  /**
   * Saved scroll position.
   */
  scrollY: number

  /**
   * Creation timestamp.
   */
  createdAt: number
}

/* ==========================================================
   STATE
========================================================== */

export interface NavigationState {
  stack: NavigationEntry[]
}

/* ==========================================================
   CONTEXT
========================================================== */

export interface NavigationContextValue {
  /**
   * Complete overlay stack.
   */
  navigationStack: NavigationEntry[]

  /**
   * Whether any overlay is open.
   */
  isOpen: boolean

  /**
   * Current route.
   */
  currentRoute: string | null

  /* ==========================
     Navigation
  ========================== */

  open: (
    route: string,
    props?: unknown
  ) => void

  replace: (
    route: string,
    props?: unknown
  ) => void

  close: () => void

  clear: () => void

  /* ==========================
     Helpers
  ========================== */

  current: () => NavigationEntry | null

  previous: () => NavigationEntry | null

  /* ==========================
     Typed Navigation
  ========================== */

  openProfile: (
    username: string
  ) => void

  openQuestion: (
    questionId: string
  ) => void

  openEditProfile: () => void
}