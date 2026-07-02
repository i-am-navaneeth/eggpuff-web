'use client'

import {
  createContext,
  useContext,
  ReactNode,
} from 'react'

type ShellLayoutValue = {
  topInset: number
  bottomInset: number
}

const ShellLayoutContext =
  createContext<ShellLayoutValue>({
    topInset: 0,
    bottomInset: 0,
  })

type Props = {
  children: ReactNode

  topInset: number
  bottomInset: number
}

export function ShellLayoutProvider({
  children,
  topInset,
  bottomInset,
}: Props) {
  return (
    <ShellLayoutContext.Provider
      value={{
        topInset,
        bottomInset,
      }}
    >
      {children}
    </ShellLayoutContext.Provider>
  )
}

export function useShellLayout() {
  return useContext(
    ShellLayoutContext
  )
}
