'use client'

export interface StatsCardsProps {
  sentToday: number
  drafts: number
  scheduled: number
  canSend: boolean
}

export default function StatsCards({
  sentToday,
  drafts,
  scheduled,
  canSend,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Sent Today',
      value: sentToday.toLocaleString(),
      icon: '📤',
      color: '#EFF6FF',
    },
    {
      label: 'Drafts',
      value: drafts.toLocaleString(),
      icon: '📝',
      color: '#FEF3C7',
    },
    {
      label: 'Scheduled',
      value: scheduled.toLocaleString(),
      icon: '⏰',
      color: '#ECFDF5',
    },
    {
      label: 'Cooldown',
      value: canSend ? 'Ready' : 'Active',
      icon: canSend ? '🟢' : '🟠',
      color: '#F3F4F6',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit,minmax(220px,1fr))',
        gap: 18,
      }}
    >
      {stats.map(stat => (
        <StatCard
          key={stat.label}
          {...stat}
        />
      ))}
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: string
  color: string
}

function StatCard({
  label,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECEC',
        borderRadius: 20,
        padding: 22,
        boxShadow:
          '0 8px 24px rgba(0,0,0,.05)',
        transition:
          'transform .18s ease, box-shadow .18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform =
          'translateY(-2px)'
        e.currentTarget.style.boxShadow =
          '0 12px 30px rgba(0,0,0,.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform =
          'translateY(0)'
        e.currentTarget.style.boxShadow =
          '0 8px 24px rgba(0,0,0,.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {label}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: -1,
              color: '#111827',
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}