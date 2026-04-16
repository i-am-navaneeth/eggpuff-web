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

const { error } = await supabase.from('egg_puff_ledger').insert({
  user_id: userId,
  amount: 1,
  reason: 'Answer approved',
  answer_id: answerId,
})

if (!error) {
  // ⏳ small delay (grouping)
  await new Promise(res => setTimeout(res, 8000))

  await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    title: '✅ Answer approved',
    message: 'Your answer was accepted 🎉',
    url: '/feed',
  }),
})
}

return { error }
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

const { error } = await supabase.from('egg_puff_ledger').insert({
  user_id: userId,
  amount: 0.5,
  reason: 'Supported correct answer',
  answer_id: answerId,
})

// 🔔 PUSH AFTER SUCCESS
if (!error) {
  await new Promise(res => setTimeout(res, 8000))

  await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    title: '👍 Supported',
    message: 'New activity on your answer',
    url: '/feed',
  }),
})
}

return { error }
}

// ===============================
// PYP REWARD (STRICTLY ONCE PER PYP)
// ===============================
export async function rewardForPyp(
  userId: string,
  pypId: string
) {
  // ⛔ prevent duplicate reward per user per PYP
  const { data: existing } = await supabase
    .from('pyp_clicks')
    .select('id')
    .eq('user_id', userId)
    .eq('pyp_id', pypId)
    .maybeSingle()

  if (existing) {
    return { success: false, alreadyClaimed: true }
  }

  // ✅ insert click record
  const { error: clickError } = await supabase
    .from('pyp_clicks')
    .insert({
      user_id: userId,
      pyp_id: pypId,
      rewarded: true,
    })

  if (clickError) {
    return { success: false, error: clickError }
  }

  // ✅ reward EP
  const { error: ledgerError } = await supabase
    .from('egg_puff_ledger')
    .insert({
      user_id: userId,
      amount: 0.5,
      reason: 'PYP support reward',
    })

  if (ledgerError) {
  return { success: false, error: ledgerError }
}

// 🔔 PUSH AFTER SUCCESS
await new Promise(res => setTimeout(res, 8000))

await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    title: '🥐 EP Added',
    message: 'You received EP in your account',
    url: '/feed',
  }),
})

return { success: true }
}