'use client'

import {
  Crown,
  Users,
} from 'lucide-react'

type Props = {
  match: any
}

export default function Participants({
  match,
}: Props) {
  const members =
    match.members ?? []

  const creator =
    match.creator ?? null

const peopleNeeded =
  match.max_participants ??
  match.people_needed ??
  1

// Only participants (exclude creator)
const participantMembers =
  members.filter(
    (member: any) =>
      member.user_id !== creator?.user_id
  )

const joinedCount =
  participantMembers.length

const remaining = Math.max(
  peopleNeeded - joinedCount,
  0
)

const progress =
  peopleNeeded > 0
    ? Math.min(
        (joinedCount /
          peopleNeeded) *
          100,
        100
      )
    : 0

  return (
    <section>
      <h2
        style={{
          margin: 0,
          marginBottom: 22,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        Participants
      </h2>

      {/* Progress */}

      <div
        style={{
          marginBottom: 26,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          <span>
            {joinedCount} Joined
          </span>

          <span />
        </div>

        <div
  style={{
    position: 'relative',
    width: '100%',
    height: 10,
    borderRadius: 999,
    background: '#E5E7EB', // darker cement
    overflow: 'hidden',
  }}
>
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: `${progress}%`,
      borderRadius: 999,
      background:
        'linear-gradient(90deg,#F4B860,#E9A73E)',
      transition: 'width .35s ease',
    }}
  />
</div>

        <div
          style={{
            marginTop: 10,
            color: '#6B7280',
            fontSize: 14,
          }}
        >
          {remaining === 0
            ? 'Match is full.'
            : `${remaining} spot${
                remaining > 1
                  ? 's'
                  : ''
              } remaining`}
        </div>
      </div>

      {/* Creator */}

      {creator && (
        <MemberRow
          name={creator.name}
          avatar={
            creator.avatar_url
          }
          subtitle="Creator"
          crown
        />
      )}

      {/* Members */}

{participantMembers.map(
  (member: any) => (
    <MemberRow
      key={member.user_id}
      name={
        member.profiles?.name ??
        'Student'
      }
      avatar={
        member.profiles?.avatar_url
      }
      subtitle="Participant"
    />
  ))}

{Array.from({
  length: remaining,
}).map((_, index) => (
  <MemberRow
    key={`empty-${index}`}
    name="Empty Spot"
    subtitle="Waiting for someone to join"
  />
))}
    </section>
  )
}

function MemberRow({
  name,
  avatar,
  subtitle,
  crown = false,
}: {
  name: string
  avatar?: string
  subtitle: string
  crown?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-between',
        padding: '14px 0',
        borderBottom:
          '1px solid #F3F4F6',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
        )}

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
            }}
          >
            {name}

            {crown && (
              <Crown
                size={16}
                color="#F4B860"
              />
            )}
          </div>

          <div
            style={{
              color: '#6B7280',
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  )
}