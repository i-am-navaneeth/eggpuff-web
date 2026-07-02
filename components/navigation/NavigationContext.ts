'use client'

import {
  createContext,
  useContext,
} from 'react'

import type {
  NavigationContextValue,
} from './types'

/* ==========================================================
   CONTEXT
========================================================== */

export const NavigationContext =
  createContext<NavigationContextValue | null>(
    null
  )

NavigationContext.displayName =
  'NavigationContext'

/* ==========================================================
   HOOK
========================================================== */

export function useNavigation() {
  const context =
    useContext(
      NavigationContext
    )

  if (!context) {
    throw new Error(
      'useNavigation must be used inside NavigationProvider'
    )
  }

  return context
}