'use client'

import { ArrowLeft, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  match: any
}

export default function ChatHeader({
  match,
}: Props) {
  const router = useRouter()

  const joined =
    match.members?.length ??
    match.member_count ??
    0

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#FFFFFF',
        borderBottom: '1px solid #ECECEC',
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            border: '1px solid #ECECEC',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 22,
              }}
            >
              {activityEmoji(
                match.activity
              )}
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: '#111827',
                overflow: 'hidden',
                textOverflow:
                  'ellipsis',
                whiteSpace:
                  'nowrap',
              }}
            >
              {match.title}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#6B7280',
              fontSize: 13,
            }}
          >
            <Users size={14} />

            <span>
              {joined}/
              {match.people_needed ??
                1}{' '}
              joined
            </span>

            <span>•</span>

            <span
              style={{
                textTransform:
                  'capitalize',
              }}
            >
              {match.mode}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function activityEmoji(
  activity?: string
) {
  switch (
    activity?.toLowerCase()
  ) {
    case 'study':
      return '📚'

    case 'project':
      return '💻'

    case 'placement':
      return '💼'

    case 'interview':
      return '🎤'

    case 'tutoring':
      return '🧠'

    case 'gaming':
      return '🎮'

    case 'hackathon':
      return '🏆'

    case 'sports':
      return '🏏'

    case 'startup':
      return '🚀'

    case 'event':
      return '🎉'

    default:
      return '✨'
  }
}