'use client'

import { useContext } from 'react'

import { NavigationContext } from './NavigationContext'

/* ==========================================================
   HOOK
   ----------------------------------------------------------
   Access the global NavigationContext.

   Must be used inside <NavigationProvider />.
========================================================== */

export function useNavigation() {
  const context =
    useContext(
      NavigationContext
    )

  if (!context) {
    throw new Error(
      'useNavigation must be used inside <NavigationProvider>.'
    )
  }

  return context
}

export default useNavigation