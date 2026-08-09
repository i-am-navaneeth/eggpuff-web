'use client'

import { useState } from 'react'

import {
  UserPlus,
  LogOut,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useNotify } from '@/components/NotificationProvider'

import { joinMatch } from '@/lib/campus-match/joinMatch'
import { leaveMatch } from '@/lib/campus-match/leaveMatch'
import ConfirmationSheet from '@/components/ui/ConfirmationSheet' 

type Props = {
  match: any

  joined: boolean
  setJoined: React.Dispatch<
    React.SetStateAction<boolean>
  >

  participantCount: number
  setParticipantCount: React.Dispatch<
    React.SetStateAction<number>
  >

  members: any[]
  setMembers: React.Dispatch<
    React.SetStateAction<any[]>
  >
}

export default function JoinBar({
  match,

  joined,
  setJoined,

  participantCount,
  setParticipantCount,

  members,
  setMembers,
}: Props) {
  const router = useRouter()
  const { notify } = useNotify()

const [action, setAction] = useState<
  'join' | 'leave' | null
>(null)

const loading = action !== null

const [showLeaveSheet, setShowLeaveSheet] =
  useState(false)

async function handleJoin() {
  try {
    setAction('join')

    // Optimistic UI
    setJoined(true)

    setParticipantCount(
      (count) => count + 1
    )

    setMembers((prev) => [
  ...prev,
  {
    user_id: match.currentUserId,
    profiles: {
      user_id: match.currentUserId,
      name: 'You',
      avatar_url: null,
    },
  },
])

    await joinMatch(match.id)
  } catch (err) {
    // Rollback
    setJoined(false)

    setParticipantCount(
      (count) =>
        Math.max(count - 1, 0)
    )

    console.error(err)

notify(
  '❌ Unable to join this match.'
)
  } finally {
    setAction(null)
  }
}

async function handleLeave() {
  try {
    setAction('leave')

    // Optimistic UI
    setJoined(false)

    setParticipantCount(
      (count) =>
        Math.max(count - 1, 0)
    )

    setMembers((prev) =>
  prev.filter(
    (member) =>
      member.user_id !==
      match.currentUserId
  )
)

    setShowLeaveSheet(false)

    await leaveMatch(match.id)
  } catch (err) {
    // Rollback
    setJoined(true)

    setParticipantCount(
      (count) => count + 1
    )

   console.error(err)

notify(
  '❌ Unable to leave this match.'
)
  } finally {
    setAction(null)
  }
}

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderTop:
          '1px solid #ECECEC',
        padding:
          '14px max(18px,env(safe-area-inset-left)) calc(14px + env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-right))',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        {!joined && (
  <button
    onClick={handleJoin}
    disabled={loading}
    style={{
      width: '100%',
      height: 56,
      border: 'none',
      borderRadius: 18,
      background: '#F4B860',
      color: '#111827',
      fontWeight: 700,
      fontSize: 16,
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      boxShadow:
        '0 10px 24px rgba(244,184,96,.30)',
      opacity: loading ? 0.7 : 1,
    }}
  >
    <UserPlus size={20} />

    {action === 'join'
      ? 'Joining...'
      : 'Join Match'}
  </button>
)}
      </div>
      <ConfirmationSheet
  open={showLeaveSheet}
  title="Leave Campus Match?"
  description="You'll leave this match and won't receive new messages unless you join again."
  confirmText="Leave Match"
  cancelText="Stay"
  confirmColor="#EF4444"
  loading={loading}
  onCancel={() =>
    setShowLeaveSheet(false)
  }
  onConfirm={handleLeave}
/>
    </div>
  )
}