'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import type {
  ScheduledNotification,
} from '../app/(misc)/admin$$$db/notifications/components/NotificationComposer/types'

export function useScheduledNotifications() {
  const [scheduled, setScheduled] =
    useState<ScheduledNotification[]>([])

  const [loading, setLoading] =
    useState(true)

  /* ==========================================================
     LOAD
  ========================================================== */

  const loadScheduled =
    useCallback(async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
  .from("notification_schedule")
            .select('*')
            .order('scheduled_for', {
              ascending: true,
            })

        if (error) {

  throw error
}

        const mapped: ScheduledNotification[] =
          (data ?? []).map((row: any) => ({
            id: row.id,

            title: row.title ?? '',

            body: row.body ?? '',

            link: row.link ?? '',

            audience:
              row.audience ?? 'everyone',

            scheduledFor:
              row.scheduled_for ??
              row.scheduledFor,

            createdAt:
              row.created_at ??
              row.createdAt ??
              new Date().toISOString(),

            createdBy:
              row.created_by ??
              row.createdBy ??
              'System',
          }))

        setScheduled(mapped)
      } catch (err) {
  console.error(
    'Failed loading scheduled notifications'
  )

  console.error(err)

  if (err instanceof Error) {
    console.error(err.message)
  }
} finally {
        setLoading(false)
      }
    }, [])

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadScheduled()
  }, [loadScheduled])

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteScheduled =
    useCallback(
      async (id: string) => {
        const { error } =
          await supabase
  .from('notification_schedule')
            .delete()
            .eq('id', id)

        if (error) {
          console.error(error)
          return
        }

        setScheduled(prev =>
          prev.filter(
            item => item.id !== id
          )
        )
      },
      []
    )

  /* ==========================================================
     SEND NOW
  ========================================================== */

  const sendNow =
    useCallback(async (id: string) => {
      try {
        const response =
          await fetch(
            '/api/admin/notifications/send-scheduled',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                id,
              }),
            }
          )

        if (!response.ok) {
          throw new Error(
            'Failed to send notification.'
          )
        }

        await loadScheduled()
      } catch (err) {
        console.error(err)
      }
    }, [loadScheduled])

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    scheduled,

    loading,

    refresh: loadScheduled,

    deleteScheduled,

    sendNow,

    scheduledCount:
      scheduled.length,
  }
}