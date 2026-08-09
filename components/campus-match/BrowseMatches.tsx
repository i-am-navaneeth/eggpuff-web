'use client'

import { useEffect, useState } from 'react'

import MatchCard from './MatchCard'
import MatchFilters from './MatchFilters'

import { getMatches } from '@/lib/campus-match/getMatches'

export default function BrowseMatches() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activity, setActivity] =
    useState('')

  const [mode, setMode] =
    useState('')

  const [search, setSearch] =
    useState('')

  useEffect(() => {
    load()
  }, [activity, mode, search])

  async function load() {
    setLoading(true)

    const data = await getMatches({
      activity,
      mode,
      search,
    })

    setMatches(data)

    setLoading(false)
  }

return (
  <main
    style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '24px 18px 120px',
    }}
  >

      <MatchFilters
        activity={activity}
        mode={mode}
        search={search}
        onActivityChange={setActivity}
        onModeChange={setMode}
        onSearchChange={setSearch}
      />

      <div
        style={{
          marginTop: 28,
          display: 'grid',
          gap: 18,
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: 'center',
              color: '#6B7280',
            }}
          >
            Loading...
          </div>
        )}

        {!loading &&
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
            />
          ))}

        {!loading &&
          matches.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#9CA3AF',
                padding: '50px 0',
              }}
            >
              No Campus Matches found.
            </div>
          )}
      </div>
    </main>
  )
}