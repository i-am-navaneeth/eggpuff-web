'use client'

import { useCallback, useEffect, useState } from 'react'

import type {
  NotificationDraft,
  NotificationForm,
} from '../app/(misc)/admin$$$db/notifications/components/NotificationComposer/types'

const STORAGE_KEY = 'ep_notification_drafts'
const DRAFT_EVENT = 'ep-notification-drafts-updated'

export function useNotificationDrafts() {
  const [drafts, setDrafts] = useState<
    NotificationDraft[]
  >([])

  /* ==========================================================
     LOAD
  ========================================================== */

  useEffect(() => {
  const loadDrafts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)

      if (!raw) {
        setDrafts([])
        return
      }

      setDrafts(JSON.parse(raw))
    } catch (err) {
      console.error(
        'Failed loading drafts',
        err
      )
    }
  }

  loadDrafts()

  window.addEventListener(
    DRAFT_EVENT,
    loadDrafts
  )

  window.addEventListener(
    'storage',
    loadDrafts
  )

  return () => {
    window.removeEventListener(
      DRAFT_EVENT,
      loadDrafts
    )

    window.removeEventListener(
      'storage',
      loadDrafts
    )
  }
}, [])

  /* ==========================================================
     SAVE TO STORAGE
  ========================================================== */

  const saveToStorage = useCallback(
  (items: NotificationDraft[]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    )

    setDrafts(items)

    window.dispatchEvent(
      new Event(DRAFT_EVENT)
    )
  },
  []
)

  /* ==========================================================
     SAVE DRAFT
  ========================================================== */

  const saveDraft =
    useCallback(
      (
        form: NotificationForm,
        draftId?: string
      ) => {
        const now =
          new Date().toISOString()

        const id =
          draftId ??
          crypto.randomUUID()

        let updated = [...drafts]

        const index =
          updated.findIndex(
            d => d.id === id
          )

        const draft: NotificationDraft =
          {
            id,

            title: form.title,

            body: form.body,

            link: form.link,

            audience:
              form.audience,

            delivery:
              form.delivery,

            scheduledFor:
              form.scheduledFor,

            updatedAt: now,
          }

        if (index >= 0) {
          updated[index] = draft
        } else {
          updated.unshift(draft)
        }

        saveToStorage(updated)

        return id
      },
      [drafts, saveToStorage]
    )

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteDraft =
    useCallback(
      (id: string) => {
        saveToStorage(
          drafts.filter(
            d => d.id !== id
          )
        )
      },
      [drafts, saveToStorage]
    )

  /* ==========================================================
     DUPLICATE
  ========================================================== */

  const duplicateDraft =
    useCallback(
      (id: string) => {
        const draft =
          drafts.find(
            d => d.id === id
          )

        if (!draft) return

        const copy = {
          ...draft,

          id: crypto.randomUUID(),

          updatedAt:
            new Date().toISOString(),
        }

        saveToStorage([
          copy,
          ...drafts,
        ])
      },
      [drafts, saveToStorage]
    )

  /* ==========================================================
     GET
  ========================================================== */

  const getDraft =
    useCallback(
      (id: string) =>
        drafts.find(
          d => d.id === id
        ),
      [drafts]
    )

  /* ==========================================================
     CLEAR
  ========================================================== */

  const clearDrafts = useCallback(() => {
  localStorage.removeItem(STORAGE_KEY)

  setDrafts([])

  window.dispatchEvent(
    new Event(DRAFT_EVENT)
  )
}, [])

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    drafts,

    draftCount:
      drafts.length,

    saveDraft,

    deleteDraft,

    duplicateDraft,

    getDraft,

    clearDrafts,
  }
}