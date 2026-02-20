import { supabase } from './supabase'

/**
 * Fetch all active (non-expired) questions
 * Ordered by newest first
 */
export async function getActiveQuestions() {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

/**
 * Fetch active questions filtered by category_id
 * Used for:
 * - Category overlay selection
 * - Category feed view
 */
export async function getActiveQuestionsByCategory(
  categoryId: string
) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

/**
 * Fetch active question counts grouped by category_id
 * Used for:
 * - Category badges
 * - Overlay counts
 */
export async function getActiveQuestionCounts() {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('questions')
    .select('category_id')
    .gt('expires_at', now)

  if (error) {
    throw error
  }

  const counts: Record<string, number> = {}

  data?.forEach(q => {
    counts[q.category_id] =
      (counts[q.category_id] || 0) + 1
  })

  return counts
}
