'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import type {
  NotificationHistoryItem,
} from '../app/(misc)/admin$$$db/notifications/components/NotificationComposer/types'

export function useNotificationHistory() {
  const [history, setHistory] = useState<
    NotificationHistoryItem[]
  >([])

  const [loading, setLoading] =
    useState(true)

  /* ==========================================================
     LOAD HISTORY
  ========================================================== */

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } =
        await supabase
          .from('notification_history')
          .select('*')
          .order('sent_at', {
            ascending: false,
          })

      if (error) throw error

      const mapped: NotificationHistoryItem[] =
        (data ?? []).map((row: any) => ({
          id: row.id,

          title: row.title ?? '',

          body: row.body ?? '',

          link: row.link ?? '',

          audience:
            row.audience ?? 'everyone',

          status:
            row.status ?? 'sent',

          recipientCount:
            row.recipient_count ??
            row.recipientCount ??
            row.sent_count ??
            row.delivered ??
            0,

          sentAt:
            row.sent_at ??
            row.sentAt ??
            new Date().toISOString(),

          createdBy:
            row.created_by ??
            row.createdBy ??
            'System',
        }))

      setHistory(mapped)
    } catch (err) {
      console.error(
        'Failed loading notification history:',
        err
      )
    } finally {
      setLoading(false)
    }
  }, [])

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteHistory =
    useCallback(
      async (id: string) => {
        const { error } =
          await supabase
            .from('notification_history')
            .delete()
            .eq('id', id)

        if (error) {
          console.error(error)
          return
        }

        setHistory(prev =>
          prev.filter(
            item => item.id !== id
          )
        )
      },
      []
    )

  /* ==========================================================
     STATS
  ========================================================== */

  const sentToday = history.filter(item => {
    return (
      new Date(item.sentAt).toDateString() ===
      new Date().toDateString()
    )
  }).length

  const totalRecipients =
    history.reduce(
      (sum, item) =>
        sum + (item.recipientCount ?? 0),
      0
    )

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    history,

    loading,

    refresh: loadHistory,

    deleteHistory,

    sentToday,

    totalRecipients,

    historyCount:
      history.length,
  }
}