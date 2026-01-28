'use client'
import { supabase } from '../../lib/supabase'
import { getEggPuffBalance } from '@/lib/rewards'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [balance, setBalance] = useState(0)
  const [me, setMe] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setMe(data.user.id)
        setBalance(await getEggPuffBalance(data.user.id))
      }
    })
  }, [])

  const promote = async () => {
    if (!me || balance < 7) return

    await supabase.from('egg_puff_ledger').insert({
      user_id: me,
      amount: -7,
      reason: 'Promotion'
    })

    await supabase.from('promotions').insert({
      user_id: me,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    alert('Promoted for 1 day!')
  }

  return (
    <div style={{ padding: 20 }}>
      <p>EggPuffs: {balance}</p>
      <button disabled={balance < 7} onClick={promote}>
        Promote (7 EggPuffs)
      </button>
    </div>
  )
}
