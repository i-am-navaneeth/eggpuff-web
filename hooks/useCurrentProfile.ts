'use client'

import { useSyncExternalStore } from 'react'

import {
  getCurrentProfile,
  subscribeCurrentProfile,
} from '@/lib/currentProfile'

export function useCurrentProfile() {
  return useSyncExternalStore(
    subscribeCurrentProfile,
    getCurrentProfile,
    getCurrentProfile
  )
}