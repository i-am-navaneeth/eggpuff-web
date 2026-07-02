// NotificationComposer/types.ts

export type NotificationAudience =
  | 'everyone'
  | 'college'
  | 'community'
  | 'users'

export type NotificationDelivery =
  | 'now'
  | 'scheduled'
  | 'draft'

export type NotificationStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled'

export interface NotificationForm {
  title: string
  body: string
  link: string

  audience: NotificationAudience

  delivery: NotificationDelivery

  scheduledFor: string | null
}

export interface ValidationErrors {
  title?: string
  body?: string
  link?: string
  audience?: string
  scheduledFor?: string
}

export interface NotificationDraft
  extends NotificationForm {
  id: string

  updatedAt: string
}

export interface ScheduledNotification {
  id: string

  title: string
  body: string
  link: string

  audience: NotificationAudience

  scheduledFor: string

  createdAt: string

  createdBy: string
}

export interface NotificationHistoryItem {
  id: string

  title: string
  body: string
  link: string

  audience: NotificationAudience

  status: NotificationStatus

  recipientCount: number

  sentAt: string

  createdBy: string
}

export interface NotificationStats {
  sentToday: number

  drafts: number

  scheduled: number

  cooldownEndsAt: string | null
}

export interface CooldownState {
  isCoolingDown: boolean

  secondsRemaining: number

  nextAvailableAt: string | null
}

export interface NotificationPreview {
  title: string
  body: string
  link: string
}

export interface NotificationComposerProps {
  draft?: NotificationForm | null

  onSend?: (form: NotificationForm) => Promise<void>

  onSaveDraft?: (
    form: NotificationForm
  ) => Promise<void>

  onSchedule?: (
    form: NotificationForm
  ) => Promise<void>
}