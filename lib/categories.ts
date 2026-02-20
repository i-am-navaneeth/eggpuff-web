import { supabase } from './supabase'

/**
 * Normalize user input into a safe, URL-friendly slug
 * Example:
 *  "Admission Cell" → "admission-cell"
 *  "Canteen & Food" → "canteen-food"
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove symbols
    .replace(/\s+/g, '-')         // spaces → dashes
}

/**
 * Get category_id by label
 *
 * Flow:
 * 1️⃣ Convert label → slug
 * 2️⃣ Check if category already exists
 * 3️⃣ If exists → return id
 * 4️⃣ If not → create category + return new id
 *
 * ⚠️ Categories are NEVER deleted
 * ⚠️ Slug is unique (DB enforced)
 */
export async function getOrCreateCategory(
  label: string,
  userId: string
): Promise<string> {
  const slug = toSlug(label)

  /* 1️⃣ Check existing category */
  const { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (existing?.id) {
    return existing.id
  }

  /* 2️⃣ Create category (first use only) */
  const { data: created, error: insertError } = await supabase
    .from('categories')
    .insert({
      slug,
      label,
      created_by: userId,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    throw insertError ?? new Error('Failed to create category')
  }

  return created.id
}
