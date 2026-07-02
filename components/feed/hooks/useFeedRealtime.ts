'use client'

import { useEffect } from 'react'

import { supabase } from '@/lib/supabase'

import type {
  QuestionRow,
} from '../types'

type Props = {
  questionsRef: React.MutableRefObject<
    QuestionRow[]
  >

  setQuestions: React.Dispatch<
    React.SetStateAction<QuestionRow[]>
  >

  setNewQuestions: React.Dispatch<
    React.SetStateAction<any[]>
  >

  setShowNewBanner: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

export function useFeedRealtime({
  questionsRef,
  setQuestions,
  setNewQuestions,
  setShowNewBanner,
}: Props) {
  useEffect(() => {
    const channel = supabase
      .channel('questions-feed')

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
        },
        async (payload) => {
          const incoming =
            payload.new as QuestionRow

          setNewQuestions(prev => {
            if (
              prev.some(
                q => q.id === incoming.id
              )
            ) {
              return prev
            }

            if (
              questionsRef.current.some(
                q => q.id === incoming.id
              )
            ) {
              return prev
            }

            return [
              incoming,
              ...prev,
            ]
          })

          const {
            data: profileRow,
          } = await supabase
            .from('profiles')
            .select(`
              name,
              username,
              avatar_url,
              is_verified,
              streak_count
            `)
            .eq(
              'user_id',
              (incoming as any).user_id
            )
            .maybeSingle()

          setNewQuestions(prev =>
            prev.map((q: any) =>
              q.id === incoming.id
                ? {
                    ...q,
                    user_name:
                      profileRow?.name ??
                      'User',

                    username:
                      profileRow?.username ??
                      'user',

                    avatar_url:
                      profileRow?.avatar_url ??
                      null,

                    is_verified:
                      profileRow?.is_verified ??
                      false,

                    streak_count:
                      profileRow?.streak_count ??
                      0,
                  }
                : q
            )
          )

          setShowNewBanner(true)
        }
      )

      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'questions',
        },
        payload => {
          const deletedId =
            payload.old.id as string

          setQuestions(prev =>
            prev.filter(
              q => q.id !== deletedId
            )
          )

          setNewQuestions(prev =>
            prev.filter(
              q => q.id !== deletedId
            )
          )

          try {
            const cached =
              JSON.parse(
                localStorage.getItem(
                  'feed_cache'
                ) || '[]'
              )

            localStorage.setItem(
              'feed_cache',
              JSON.stringify(
                cached.filter(
                  (q: any) =>
                    q.id !== deletedId
                )
              )
            )
          } catch {}
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(
        channel
      )
    }
  }, [
    questionsRef,
    setQuestions,
    setNewQuestions,
    setShowNewBanner,
  ])
}

export default useFeedRealtime