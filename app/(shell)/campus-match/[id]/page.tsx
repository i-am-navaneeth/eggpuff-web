'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import TopBar from '@/components/TopBar'
import MatchDetails from '@/components/campus-match/MatchDetails'
import { getMatch } from '@/lib/campus-match/getMatch'

export default function MatchPage() {
  const params = useParams()

  const matchId = params.id as string

  const router = useRouter()

  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function loadMatch() {
      try {
        const data =
          await getMatch(matchId)

        setMatch(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      loadMatch()
    }
  }, [matchId])

  if (loading) {
    return (
      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '32px 18px',
        }}
      >
        Loading...
      </main>
    )
  }

  return (
  <MatchDetails
    match={match}
  />
)
}