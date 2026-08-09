'use client'

import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Wifi,
  Tag,
  ClipboardList,
} from 'lucide-react'

type Props = {
  match: any
}

export default function MatchInfo({
  match,
}: Props) {
  const tags =
    Array.isArray(match.tags)
      ? match.tags
      : []

  return (
    <section
      style={{
        display: 'grid',
        gap: 26,
      }}
    >
      {/* Overview */}

      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          Match Details
        </h2>

        <div
          style={{
            display: 'grid',
            gap: 18,
          }}
        >
          <InfoRow
            icon={<Users size={18} />}
            label="People Needed"
            value={`${match.people_needed} participant${
              match.people_needed > 1
                ? 's'
                : ''
            }`}
          />

          <InfoRow
            icon={
              <CalendarDays
                size={18}
              />
            }
            label="When"
            value={
              match.when_type ===
                'custom' &&
              match.custom_date
                ? new Date(
                    match.custom_date
                  ).toLocaleString()
                : match.when_type
            }
          />

          <InfoRow
            icon={<Clock3 size={18} />}
            label="Duration"
            value={
              match.duration ===
                'custom' &&
              match.custom_duration
                ? match.custom_duration
                : match.duration
            }
          />

          <InfoRow
            icon={<Wifi size={18} />}
            label="Mode"
            value={match.mode}
          />

          {(match.mode ===
            'offline' ||
            match.mode ===
              'hybrid') &&
            match.location && (
              <InfoRow
                icon={
                  <MapPin
                    size={18}
                  />
                }
                label="Location"
                value={
                  match.location
                }
              />
            )}
        </div>
      </div>

      {/* Requirements */}

      {match.requirements && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <ClipboardList
              size={20}
            />

            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Requirements
            </h2>
          </div>

          <div
            style={{
              whiteSpace:
                'pre-wrap',
              lineHeight: 1.8,
              color: '#374151',
            }}
          >
            {match.requirements}
          </div>
        </div>
      )}

      {/* Tags */}

      {tags.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <Tag size={20} />

            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Tags
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {tags.map(
              (tag: string) => (
                <div
                  key={tag}
                  style={{
                    padding:
                      '8px 14px',
                    borderRadius:
                      999,
                    background:
                      '#FFF8EB',
                    color:
                      '#A16207',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  #{tag.replace(
                    '#',
                    ''
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: '#F8F8F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            color: '#9CA3AF',
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontWeight: 600,
            color: '#111827',
            lineHeight: 1.6,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}