'use client'

import { supabase } from './supabase'

// ===============================
// BALANCE (SOURCE OF TRUTH = LEDGER)
// ===============================
export async function getEggPuffBalance(userId: string) {
  const { data, error } = await supabase
    .from('egg_puff_ledger')
    .select('amount')
    .eq('user_id', userId)

  if (error || !data) return 0

  return data.reduce((sum, r) => sum + Number(r.amount), 0)
}

// ===============================
// ASK QUESTION (DEDUCT 1 🥐)
// ===============================
export async function deductForQuestion(userId: string) {
  return supabase.from('egg_puff_ledger').insert({
    user_id: userId,
    amount: -1,
    reason: 'Ask question',
  })
}

// ===============================
// APPROVE ANSWER (STRICTLY ONCE)
// ===============================
export async function rewardAnswer(
  userId: string,
  answerId: string
) {
  // ⛔ prevent duplicate reward
  const { data: existing } = await supabase
    .from('egg_puff_ledger')
    .select('id')
    .eq('reason', 'Answer approved')
    .eq('answer_id', answerId)
    .maybeSingle()

  if (existing) return

  return supabase.from('egg_puff_ledger').insert({
    user_id: userId,
    amount: 1,
    reason: 'Answer approved',
    answer_id: answerId,
  })
}

// ===============================
// SUPPORTER REWARD (STRICTLY ONCE)
// ===============================
export async function rewardSupporter(
  userId: string,
  answerId: string
) {
  // ⛔ prevent duplicate reward
  const { data: existing } = await supabase
    .from('egg_puff_ledger')
    .select('id')
    .eq('reason', 'Supported correct answer')
    .eq('user_id', userId)
    .eq('answer_id', answerId)
    .maybeSingle()

  if (existing) return

  return supabase.from('egg_puff_ledger').insert({
    user_id: userId,
    amount: 0.5,
    reason: 'Supported correct answer',
    answer_id: answerId,
  })
}
