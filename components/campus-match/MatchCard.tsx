'use client'

import Link from 'next/link'

import {
  Calendar,
  Clock3,
  MapPin,
  Users,
} from 'lucide-react'
import { useNotify } from '@/components/NotificationProvider'

const ACTIVITY_ICONS: Record<
  string,
  string
> = {
  study: '📚',
  project: '💻',
  placement: '💼',
  interview: '🎤',
  tutoring: '🧠',
  gaming: '🎮',
  hackathon: '🏆',
  sports: '🏏',
  startup: '🚀',
  event: '🎉',
  other: '✨',
}

type Props = {
  match: any
}

export default function MatchCard({
  match,
}: Props) {
  const { notify } = useNotify()
  const emoji =
    ACTIVITY_ICONS[
      match.activity?.toLowerCase()
    ] ?? '✨'

  const joined =
    match.member_count ?? 0

  const needed =
    match.people_needed ?? 1

  return (
    <Link
      href={`/campus-match/${match.id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <article
        style={{
          background: '#FFFFFF',
          border: '1px solid #ECECEC',
          borderRadius: 22,
          padding: 20,
          transition: '.18s',
        }}
      >
        {/* Top */}

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
              }}
            >
              {emoji}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: '#F59E0B',
                fontWeight: 700,
                textTransform:
                  'uppercase',
                letterSpacing: '.04em',
              }}
            >
              {match.activity}
            </div>

            <h2
              style={{
                marginTop: 6,
                marginBottom: 0,
                fontSize: 22,
                fontWeight: 800,
                color: '#111827',
              }}
            >
              {match.title}
            </h2>
          </div>

          <div
            style={{
              padding:
                '6px 12px',
              borderRadius: 999,
              background:
                match.mode ===
                'online'
                  ? '#ECFDF5'
                  : match.mode ===
                    'offline'
                  ? '#EFF6FF'
                  : '#FFF7ED',
              fontSize: 13,
              fontWeight: 700,
              color: '#374151',
              whiteSpace: 'nowrap',
            }}
          >
            {match.mode}
          </div>
        </div>

        {/* Description */}

        <p
          style={{
            marginTop: 16,
            color: '#6B7280',
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient:
              'vertical',
            overflow: 'hidden',
          }}
        >
          {match.description}
        </p>

        {/* Info */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2,minmax(0,1fr))',
            gap: 14,
            marginTop: 20,
          }}
        >
          <Info
            icon={<Users size={16} />}
            text={`${joined}/${needed} joined`}
          />

          <Info
            icon={<Calendar size={16} />}
            text={match.when}
          />

          <Info
            icon={<Clock3 size={16} />}
            text={
              match.duration
            }
          />

          <Info
            icon={<MapPin size={16} />}
            text={
              match.mode ===
              'offline'
                ? match.location ||
                  'Campus'
                : 'Online'
            }
          />
        </div>

       {/* Footer */}

<div
  style={{
    marginTop: 22,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F3F4F6',
    paddingTop: 16,
  }}
>
  <div>
    <div
      style={{
        fontWeight: 600,
        color: '#111827',
        fontSize: 14,
      }}
    >
      {match.creator_name ?? 'Student'}
    </div>

    <div
      style={{
        marginTop: 3,
        color: '#9CA3AF',
        fontSize: 13,
      }}
    >
      {new Date(
        match.created_at
      ).toLocaleDateString()}
    </div>
  </div>

  <button
    type="button"
    onClick={async (e) => {
  e.preventDefault()
  e.stopPropagation()

  try {
    if (navigator.share) {
      await navigator.share({
        title: match.title,
        text: 'Join my Campus Match on EggPuff!',
        url: `${window.location.origin}/campus-match/${match.id}`,
      })
    } else {
      await navigator.clipboard.writeText(
        `${window.location.origin}/campus-match/${match.id}`
      )

      notify('✅ Link copied to clipboard')
    }
  } catch (err) {
    console.error(err)

    notify('❌ Unable to share link')
  }
}}
    style={{
      border: 'none',
      background: '#FFF7E8',
      color: '#D97706',
      fontWeight: 700,
      borderRadius: 14,
      padding: '10px 16px',
      cursor: 'pointer',
    }}
  >
    Share
  </button>
</div>
      </article>
    </Link>
  )
}

function Info({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: '#6B7280',
        fontSize: 14,
      }}
    >
      {icon}

      <span>{text}</span>
    </div>
  )
}