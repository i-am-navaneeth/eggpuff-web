'use client'
import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/feed`,
    },
  })
}

export const handlePostLogin = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // check if user already has ledger entries
  const { data } = await supabase
    .from('egg_puff_ledger')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  // first-time user → give 5 🥐
  if (!data || data.length === 0) {
    await supabase.from('egg_puff_ledger').insert({
      user_id: user.id,
      amount: 5,
      reason: 'Welcome reward',
    })
  }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}
