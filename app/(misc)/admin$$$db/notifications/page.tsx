'use client'

import NotificationComposer from './components/NotificationComposer'
import StatsCards from './components/StatsCards'
import CooldownCard from './components/CooldownCard'
import DraftList from './components/DraftList'
import ScheduledList from './components/ScheduledList'
import HistoryList from './components/HistoryList'
import { useNotificationCooldown } from '@/hooks/useNotificationCooldown'
import { useNotificationDrafts } from '@/hooks/useNotificationDrafts'
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications'
import { useNotificationHistory } from '@/hooks/useNotificationHistory'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

import type {
  NotificationForm,
  NotificationDraft,  
} from './components/NotificationComposer/types'

export default function AdminNotificationsPage() {

  const {
  startCooldown,
  canSend,
} = useNotificationCooldown()

const {
  sentToday,
} = useNotificationHistory()

const {
  draftCount,
} = useNotificationDrafts()

const {
  scheduledCount,
} = useScheduledNotifications()

  const { saveDraft } = useNotificationDrafts()

  const { refresh } = useNotificationHistory()

  const [selectedDraft, setSelectedDraft] =
  useState<NotificationDraft | null>(null)
  /* ==========================================================
     SEND NOTIFICATION
  ========================================================== */

  async function handleSend(form: NotificationForm) {
    try {

     const {
  data: { session },
} = await supabase.auth.getSession()

const response = await fetch(
  '/api/admin/notifications/send',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: form.title.trim(),
      body: form.body.trim(),
      link: form.link.trim() || null,
      actorId: session?.user?.id ?? null,
    }),
  }
)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Failed to send notification.'
        )
      }

      startCooldown()

      await refresh()

      console.log(
        `✅ Notification sent to ${result.sent} users.`
      )

      // TODO: Replace with toast later
      alert(
        `Notification sent successfully to ${result.sent} users.`
      )
      localStorage.setItem(
  "ep_notification_last_sent",
  Date.now().toString()
);
    } catch (error) {
      console.error(
        'Failed to send notification:',
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : 'Something went wrong.'
      )

      throw error
    }
  }

  /* ==========================================================
     PLACEHOLDERS
     (Will connect in next phases)
  ========================================================== */

  async function handleSaveDraft(
  form: NotificationForm
) {
  saveDraft(
    form,
    selectedDraft?.id
  )

  alert("✅ Draft saved.")

  setSelectedDraft(null)
}

  async function handleSchedule(
  form: NotificationForm
) {
  try {
    if (!form.scheduledFor) {
      throw new Error(
        'Please choose a schedule date and time.'
      )
    }

    const {
  data: { session },
} = await supabase.auth.getSession()

const response = await fetch(
  '/api/admin/notifications/schedule',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: form.title.trim(),
      body: form.body.trim(),
      link: form.link.trim() || null,
      scheduledFor: form.scheduledFor,
      actorId: session?.user?.id ?? null,
    }),
  }
)

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error ||
          'Failed to schedule notification.'
      )
    }

    console.log(
      '✅ Notification scheduled:',
      result.schedule
    )

    alert(
      '✅ Notification scheduled successfully.'
    )
  } catch (error) {
    console.error(
      'Failed to schedule notification:',
      error
    )

    alert(
      error instanceof Error
        ? error.message
        : 'Something went wrong.'
    )

    throw error
  }
}

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F5',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 20px 80px',
        }}
      >
        {/* Header */}

        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: -1,
              color: '#111827',
            }}
          >
            Notification Center
          </div>

          <div
            style={{
              marginTop: 8,
              color: '#6B7280',
              fontSize: 15,
            }}
          >
            Send, schedule and manage campus
            notifications.
          </div>
        </div>

        {/* Stats */}

        <div style={{ marginBottom: 24 }}>
          <StatsCards
  sentToday={sentToday}
  drafts={draftCount}
  scheduled={scheduledCount}
  canSend={canSend}
/>
        </div>

        {/* Main Grid */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left */}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <NotificationComposer
  draft={
  selectedDraft
    ? {
        title: selectedDraft.title,
        body: selectedDraft.body,
        link: selectedDraft.link,
        audience: selectedDraft.audience,
        delivery: selectedDraft.delivery,
        scheduledFor: selectedDraft.scheduledFor,
      }
    : null
}
  onSend={handleSend}
  onSaveDraft={handleSaveDraft}
  onSchedule={handleSchedule}
/>

            <HistoryList />
          </div>

          {/* Right */}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              position: 'sticky',
              top: 24,
              alignSelf: 'start',
            }}
          >
            <CooldownCard />

            <DraftList
  onEditDraft={setSelectedDraft}
  onNewDraft={() => setSelectedDraft(null)}
/>

            <ScheduledList />
          </div>
        </div>
      </div>
    </div>
  )
}