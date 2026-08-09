'use client'

import {
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'

import {
  useShellLayout,
} from '@/components/ShellLayoutContext'
import { useNotify } from '@/components/NotificationProvider'

import CampusMatchMenu from '@/components/topbar/CampusMatchMenu'
import { leaveMatch } from '@/lib/campus-match/leaveMatch'
import { deleteMatch } from '@/lib/campus-match/deleteMatch'
import { reportMatch } from '@/lib/campus-match/reportMatch'
import MatchHeader from './MatchHeader'
import MatchInfo from './MatchInfo'
import Participants from './Participants'
import JoinBar from './JoinBar'
import EmptyMatch from './EmptyMatch'

type Props = {
  match: any
}

export default function MatchDetails({
  match,
}: Props) {
  
const { setTopBar } =
  useShellLayout()

const router = useRouter()
const { notify } = useNotify()

  if (!match) {
    return <EmptyMatch />
  }

  const [joined, setJoined] = useState(
  match.joined
)

const [participantCount, setParticipantCount] =
  useState(
    match.participant_count ?? 0
  )

  const [members, setMembers] = useState(
  match.members ?? []
)

useEffect(() => {
  if (!match) return

  setTopBar((prev) => ({
    ...prev,
    title: match.title || 'Campus Match',

rightSlot: (
  <CampusMatchMenu
    currentUserId={match.current_user_id}
    match={{
      ...match,
      joined,
      creator_id: match.creator_id,
    }}
    onInvite={() => {
      // TODO: Invite classmates
    }}
    onReport={async () => {
  try {
    await reportMatch(match.id)

    notify('✅ Match reported.')
  } catch (err) {
    console.error(err)
    notify('❌ Unable to report this match.')
  }
}}
    onLeave={async () => {
      try {
        setJoined(false)

        setParticipantCount((count: number) =>
          Math.max(count - 1, 0)
        )

        setMembers((prev: any[]) =>
          prev.filter(
            (member: any) =>
              member.user_id !== match.currentUserId
          )
        )

        await leaveMatch(match.id)
      } catch (err) {
  setJoined(true)

  setParticipantCount((count: number) =>
    count + 1
  )

  console.error(err)

  notify('❌ Unable to leave this match.')
}
    }}
onDelete={async () => {
  try {
    await deleteMatch(match.id)

    router.replace('/campus-match')
  } catch (err) {
  console.error(err)

  notify('❌ Unable to delete this match.')
}
}}
  />
),
  }))

  return () => {
    setTopBar((prev) => ({
      ...prev,
      title: 'Campus Match',
      rightSlot: undefined,
    }))
  }
}, [match, setTopBar])

return (
    <main
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '24px 18px 120px',
      }}
    >
      {/* Header */}

      <MatchHeader
        match={match}
      />

      {/* Match Information */}

      <div
        style={{
          marginTop: 32,
        }}
      >
        <MatchInfo
          match={match}
        />
      </div>

      {/* Participants */}

      <div
        style={{
          marginTop: 36,
        }}
      >
       <Participants
  match={{
    ...match,
    joined,
    participant_count:
      participantCount,
    members,
  }}
/>
      </div>

      {/* Future Room Features */}

      <div
        style={{
          marginTop: 40,
          display: 'grid',
          gap: 14,
        }}
      >
        {[
          '💬 Match Chat',
          '🍅 Pomodoro',
          '🎥 Voice / Video',
          '📝 Shared Notes',
        ].map((item) => (
          <div
            key={item}
            style={{
              padding: 18,
              borderRadius: 18,
              border: '1px solid #ECECEC',
              background: '#FAFAFA',
              color: '#9CA3AF',
              fontWeight: 600,
            }}
          >
            {item}
            {' '}
            <span
              style={{
                fontWeight: 400,
              }}
            >
              (Coming Soon)
            </span>
          </div>
        ))}
      </div>

      {/* Sticky Join Bar (Join only) */}

<JoinBar
  match={{
    ...match,
    joined,
    participant_count:
      participantCount,
    members,
  }}
  joined={joined}
  setJoined={setJoined}
  participantCount={participantCount}
  setParticipantCount={setParticipantCount}
  members={members}
  setMembers={setMembers}
/>
    </main>
  )
}