'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useState,
} from 'react'

type TopBarConfig = {
  title?: React.ReactNode

  leftSlot?: React.ReactNode

  rightSlot?: React.ReactNode

  showBack?: boolean

  onBack?: () => void

  hideBalance?: boolean
}

type ShellLayoutValue = {
  topInset: number
  bottomInset: number

  topBar: TopBarConfig

  setTopBar: React.Dispatch<
    React.SetStateAction<TopBarConfig>
  >
}

const defaultTopBar: TopBarConfig = {}

const ShellLayoutContext =
  createContext<ShellLayoutValue>({
    topInset: 0,
    bottomInset: 0,

    topBar: defaultTopBar,

    setTopBar: () => {},
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

  const [topBar, setTopBar] =
    useState<TopBarConfig>(
      defaultTopBar
    )

  return (
    <ShellLayoutContext.Provider
      value={{
        topInset,
        bottomInset,

        topBar,
        setTopBar,
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