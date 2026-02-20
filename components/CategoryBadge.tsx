'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
  category: string
}

export default function CategoryBadge({ category }: Props) {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    let mounted = true

    const loadCount = async () => {
      const now = new Date().toISOString()

      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', category)
        .gt('expires_at', now)

      if (mounted) {
        setCount(count || 0)
      }
    }

    loadCount()

    // optional: refresh every 30s so expired questions disappear
    const interval = setInterval(loadCount, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [category])

  if (count === 0) return null

  return (
    <span
      style={{
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 999,
        background: '#EF4444',
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  )
}
