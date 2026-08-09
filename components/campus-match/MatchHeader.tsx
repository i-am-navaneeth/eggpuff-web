'use client'

import {
  Calendar,
  Clock3,
  User,
  CheckCircle2,
} from 'lucide-react'

type Props = {
  match: any
}

export default function MatchHeader({
  match,
}: Props) {
  const createdAt = new Date(
    match.created_at
  ).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const activityEmoji: Record<
    string,
    string
  > = {
    Study: '📚',
    Project: '💻',
    'Placement Prep': '💼',
    'Interview Practice': '🎤',
    'Peer Tutoring': '🧠',
    Gaming: '🎮',
    Hackathon: '🏆',
    Sports: '🏏',
    Startup: '🚀',
    Event: '🎉',
    Other: '✨',
  }

  return (
    <section>

      {/* Meta */}

      <div
        style={{
          display: 'grid',
          gap: 14,
        }}
      >
        <MetaRow
          icon={
            <User size={18} />
          }
          label="Created by"
          value={
            match.creator?.name ??
            'Unknown'
          }
        />

        <MetaRow
          icon={
            <Calendar size={18} />
          }
          label="Created"
          value={createdAt}
        />

        <MetaRow
          icon={
            <Clock3 size={18} />
          }
          label="Status"
          value="Active"
          valueColor="#16A34A"
        />
      </div>

      {/* Divider */}

      <div
        style={{
          marginTop: 30,
          borderTop:
            '1px solid #ECECEC',
        }}
      />
    </section>
  )
}

function MetaRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: '#F8F8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            marginBottom: 2,
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            color:
              valueColor ??
              '#111827',
          }}
        >
          {label === 'Status' && (
            <CheckCircle2
              size={16}
            />
          )}

          {value}
        </div>
      </div>
    </div>
  )
}