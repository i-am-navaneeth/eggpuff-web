'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
} from "react"
import ShareRenderer from "@/components/ShareRenderer"
import type {
  ShareRendererHandle,
} from "@/components/ShareRenderer"

type QuestionShareData = {
  question: string
  creator: string
  username: string
  helpfulCount: number
  answersCount: number
}

type ShareContextType = {
  shareData: QuestionShareData | null

  setShareData: React.Dispatch<
    React.SetStateAction<QuestionShareData | null>
  >

shareRendererRef:
React.RefObject<
  ShareRendererHandle | null
>
}

const ShareContext =
  createContext<ShareContextType | null>(null)

export function ShareProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [shareData, setShareData] =
  useState<QuestionShareData | null>(null)
   const shareRendererRef =
  useRef<ShareRendererHandle | null>(null)
  
  return (
  <ShareContext.Provider
    value={{
      shareData,
      setShareData,
      shareRendererRef,
    }}
  >
    {children}

    <ShareRenderer
      ref={shareRendererRef}
    />
  </ShareContext.Provider>
)}

export function useShare() {
  const ctx =
    useContext(ShareContext)

  if (!ctx)
    throw new Error(
      'useShare must be inside ShareProvider'
    )

  return ctx
}