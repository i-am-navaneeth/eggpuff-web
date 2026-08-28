// ─────────────────────────────────────────────
// Feed Types
// ─────────────────────────────────────────────

export type Category = {
  id: string
  slug: string
  label: string
}

export type CategoryWithCount = Category & {
  activeCount: number
}

export type FilterType = 'all' | 'unanswered' | 'answered'

export type QuestionRow = {
  id: string

  user_id: string

  text: string

  created_at: string

  expires_at?: string

  type?: 'normal' | 'bubble'

  category_id: string | null

  approved_answer_id?: string | null

  answers_count?: number

  helpful_count?: number

  is_helpful?: boolean

  is_saved?: boolean

  categories?: {
    label: string
  }[]

  category_label?: string

  is_verified?: boolean

  _missed?: boolean

  feed_snapshot_at: string | null

  total_score: number
}

export type Question = {
  id: string
  user_id: string
  created_at: string
  batch_year?: string
  category_id?: string
  categories?: { label: string }[]
  is_trending?: boolean
  streak_count?: number
  answers_count?: number
}

export type Profile = {
  user_id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  college_id?: string
  is_verified?: boolean
  streak_count?: number
}

// ─────────────────────────────────────────────
// Cursor type — tracks where the feed is in DB
// ─────────────────────────────────────────────

export type FeedCursor = {
  last_created_at: string
  last_id: string
}